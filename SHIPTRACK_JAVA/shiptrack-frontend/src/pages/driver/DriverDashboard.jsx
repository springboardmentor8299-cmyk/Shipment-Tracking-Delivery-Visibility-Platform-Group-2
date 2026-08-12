import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axiosConfig";
import RouteDetailsModal from "../../components/routes/RouteDetailsModal";
import RouteDetailsView from "../../components/routes/RouteDetailsView";
import useRouteDetails from "../../components/routes/useRouteDetails";
import SignaturePad from "../../components/signature/SignaturePad";
import ThemeToggle from "../../components/dashboard/ThemeToggle";

import "../../styles/driver-dashboard.css";
import {
    changePassword,
    confirmDelivery,
    deleteNotification,
    getDriverOverview,
    getDriverShipments,
    getDeliveredShipments,
    getLiveMonitor,
    getNotifications,
    getProfile,
    markAllNotificationsRead,
    markNotificationRead,
    saveSignature,
    sendNotificationToRole,
    updateProfile,
    updateShipmentStatus
} from "../../api/driverApi";

const TABS = [
    { key: "shipments", label: "Assigned Shipments" },
    { key: "tracking", label: "Live Tracking" },
    { key: "pod", label: "Delivered Shipments" },
    { key: "notifications", label: "Notifications" },
    { key: "profile", label: "Profile" }
];

const DRIVER_STATUS_OPTIONS = [
    { value: "PICKED_UP", label: "Picked Up" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered Successfully" },
    { value: "DELIVERY_FAILED", label: "Delivery Failed" }
];

const getBadgeClass = (status) => {
    switch (status) {
        case "CREATED": return "bg-primary";
        case "PENDING": return "bg-secondary";
        case "PICKED_UP": return "bg-primary";
        case "IN_TRANSIT": return "bg-warning text-dark";
        case "OUT_FOR_DELIVERY": return "bg-info text-dark";
        case "DELIVERED": return "bg-success";
        case "DELIVERY_FAILED": return "bg-danger";
        case "CANCELLED": return "bg-dark";
        default: return "bg-dark";
    }
};

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
};

const getPodStatus = (pod) => {
    if (!pod) {
        return { label: "No POD", icon: "bi-x-circle", color: "secondary" };
    }
    const hasSignature = Boolean(pod.signatureData);
    const hasPhoto = Boolean(pod.deliveryPhoto);
    if (hasSignature && hasPhoto) {
        return { label: "POD Complete", icon: "bi-check-circle", color: "success" };
    }
    if (hasSignature) {
        return { label: "POD Available", icon: "bi-check-circle", color: "info" };
    }
    return { label: "POD Incomplete", icon: "bi-exclamation-triangle", color: "warning text-dark" };
};

export default function DriverDashboard() {

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("shipments");
    const [overview, setOverview] = useState(null);
    const [shipments, setShipments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [supportMsgTitle, setSupportMsgTitle] = useState("");
    const [supportMsgBody, setSupportMsgBody] = useState("");
    const [supportMsgSending, setSupportMsgSending] = useState(false);
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState("");
    const [shipmentsLoading, setShipmentsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusShipment, setStatusShipment] = useState(null);
    const [statusValue, setStatusValue] = useState("");
    const [failureReason, setFailureReason] = useState("");
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    const [routeDetailsShipment, setRouteDetailsShipment] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofShipment, setProofShipment] = useState(null);
    const [receiverName, setReceiverName] = useState("");
    const [signatureData, setSignatureData] = useState(null);
    const [deliveryPhoto, setDeliveryPhoto] = useState(null);
    const [proofSubmitting, setProofSubmitting] = useState(false);
    const [proofConfirmed, setProofConfirmed] = useState(false);
    const [proofDeliveryTime, setProofDeliveryTime] = useState(null);

    const [trackingShipment, setTrackingShipment] = useState(null);
    const [monitor, setMonitor] = useState(null);

    const [podList, setPodList] = useState([]);
    const [podsLoading, setPodsLoading] = useState(false);

    const routeDetails = useRouteDetails(
        trackingShipment?.shipmentId ?? null,
        trackingShipment?.trackingNumber ?? null
    );

    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const refreshAll = useCallback(async () => {
        try {
            const [overviewRes, shipmentsRes, notificationsRes] = await Promise.all([
                getDriverOverview(),
                getDriverShipments(search.trim()),
                getNotifications()
            ]);
            setOverview(overviewRes.data);
            setShipments(shipmentsRes.data);
            setNotifications(notificationsRes.data);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load driver dashboard."
            );
        }
    }, [search]);

    useEffect(() => {
        const load = async () => {
            try {
                await refreshAll();
                const profileRes = await getProfile();
                setProfile(profileRes.data);
                setPhone(profileRes.data.phone || "");
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load driver dashboard."
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [refreshAll]);

    useEffect(() => {
        let cancelled = false;
        const loadMonitor = async () => {
            if (!trackingShipment) {
                return;
            }
            try {
                const res = await getLiveMonitor(trackingShipment.shipmentId);
                if (!cancelled) {
                    setMonitor(res.data);
                }
            } catch {
                if (!cancelled) {
                    setMonitor(null);
                }
            }
        };
        if (trackingShipment) {
            loadMonitor();
        }
        const interval = setInterval(loadMonitor, 15000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [trackingShipment]);

    const handleSearch = async () => {
        setShipmentsLoading(true);
        try {
            const res = await getDriverShipments(search.trim());
            setShipments(res.data);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to search shipments."
            );
        } finally {
            setShipmentsLoading(false);
        }
    };

    const openDetails = async (shipment) => {
        setSelectedShipment(shipment);
    };

    const openStatusModal = (shipment) => {
        setStatusShipment(shipment);
        setStatusValue("");
        setFailureReason("");
        setShowStatusModal(true);
    };

    const openProofModal = (shipment, force = false) => {
        if (!force && !canDeliver(shipment)) {
            return;
        }
        setProofShipment(shipment);
        setReceiverName(shipment.receiverName || "");
        setSignatureData(null);
        setDeliveryPhoto(null);
        setProofConfirmed(false);
        setProofDeliveryTime(null);
        setShowProofModal(true);
    };

    const submitStatus = async () => {
        if (!statusShipment) return;
        if (!statusValue) {
            toast.error("Select a status.");
            return;
        }
        if (statusValue === "DELIVERY_FAILED" && !failureReason.trim()) {
            toast.error("Please provide a reason for the failed delivery.");
            return;
        }

        if (statusValue === "DELIVERED") {
            setShowStatusModal(false);
            setStatusShipment(null);
            setFailureReason("");
            openProofModal(statusShipment, true);
            return;
        }

        setStatusSubmitting(true);
        try {
            await updateShipmentStatus(statusShipment.shipmentId, {
                status: statusValue,
                failureReason: failureReason.trim() || null
            });
            toast.success("Shipment status updated.");
            setShowStatusModal(false);
            setStatusShipment(null);
            setFailureReason("");
            await refreshAll();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update shipment status."
            );
        } finally {
            setStatusSubmitting(false);
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setDeliveryPhoto(reader.result);
        reader.readAsDataURL(file);
    };

    const submitProof = async () => {
        if (!proofShipment || proofConfirmed) return;
        if (proofSubmitting) return;
        if (!receiverName.trim()) {
            toast.error("Receiver name is required.");
            return;
        }
        if (!signatureData) {
            toast.error("Please draw and save the receiver's signature before confirming delivery.");
            return;
        }
        setProofSubmitting(true);
        try {
            if (signatureData) {
                try {
                    await saveSignature({
                        shipmentId: proofShipment.shipmentId,
                        signatureData
                    });
                } catch (signatureError) {
                    toast.warning(
                        signatureError.response?.data?.message ||
                        "Signature could not be stored separately."
                    );
                }
            }
            await confirmDelivery({
                shipmentId: proofShipment.shipmentId,
                receiverName: receiverName.trim(),
                signatureData,
                deliveryPhoto: deliveryPhoto || null,
                latitude: null,
                longitude: null
            });
            toast.success("Delivery confirmed successfully.");
            setProofConfirmed(true);
            setProofDeliveryTime(new Date().toLocaleString());
            await refreshAll();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to confirm delivery."
            );
        } finally {
            setProofSubmitting(false);
        }
    };

    const closeProofModal = () => {
        setShowProofModal(false);
        setProofShipment(null);
        setReceiverName("");
        setSignatureData(null);
        setDeliveryPhoto(null);
        setProofConfirmed(false);
        setProofDeliveryTime(null);
    };

    const downloadProofPdf = async (shipment) => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(`/pod/download/${shipment.shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const url = URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = `POD-${shipment.trackingNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to download the Proof of Delivery document."
            );
        }
    };

    const viewProofPdf = (shipment) => {
        setShowProofModal(false);
        navigate(`/pod/${shipment.shipmentId}`);
    };

    const loadPods = useCallback(async () => {
        setPodsLoading(true);
        try {
            const res = await getDeliveredShipments();
            const delivered = res.data || [];
            if (delivered.length === 0) {
                setPodList([]);
                return;
            }
            const results = await Promise.all(
                delivered.map(async (shipment) => {
                    try {
                        const token = localStorage.getItem("token");
                        const podRes = await api.get(`/pod/${shipment.shipmentId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        return { shipment, pod: podRes.data };
                    } catch {
                        return { shipment, pod: null };
                    }
                })
            );
            setPodList(results);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load delivered shipments."
            );
        } finally {
            setPodsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "pod") {
            loadPods();
        }
    }, [activeTab, loadPods]);

    const loadNotifications = useCallback(async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load notifications."
            );
        }
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            await loadNotifications();
        } catch {
            toast.error("Failed to mark notification as read.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            await loadNotifications();
        } catch {
            toast.error("Failed to mark notifications as read.");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await deleteNotification(id);
            await loadNotifications();
        } catch {
            toast.error("Failed to delete notification.");
        }
    };

    const sendSupportMessage = async () => {
        if (!supportMsgTitle.trim() || !supportMsgBody.trim()) {
            toast.error("Please provide a subject and message.");
            return;
        }
        setSupportMsgSending(true);
        try {
            const res = await sendNotificationToRole({
                title: supportMsgTitle.trim(),
                message: supportMsgBody.trim(),
                type: "INFO",
                role: "ROLE_SUPPORT"
            });
            toast.success(res.data || "Message sent to support.");
            setSupportMsgTitle("");
            setSupportMsgBody("");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send message to support."
            );
        } finally {
            setSupportMsgSending(false);
        }
    };

    const saveContact = async () => {
        if (!phone.trim()) {
            toast.error("Contact number is required.");
            return;
        }
        try {
            const res = await updateProfile({ phone: phone.trim() });
            setProfile(res.data);
            toast.success("Contact number updated.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update contact number."
            );
        }
    };

    const submitPassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }
        try {
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });
            toast.success("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to change password."
            );
        }
    };

    const handleTrackingSelect = (event) => {
        const id = Number(event.target.value);
        const found = shipments.find((shipment) => shipment.shipmentId === id);
        setTrackingShipment(found || null);
        setMonitor(null);
    };

    const canDeliver = (shipment) =>
        shipment?.shipmentStatus === "OUT_FOR_DELIVERY";

    if (loading) {
        return (
            <div className="container-fluid py-4 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Assigned Shipments",
            value: overview?.assignedShipments ?? 0,
            icon: "bi-box-seam",
            color: "primary"
        },
        {
            label: "Completed Deliveries",
            value: overview?.completedDeliveries ?? 0,
            icon: "bi-check2-circle",
            color: "success"
        },
        {
            label: "Pending Deliveries",
            value: overview?.pendingDeliveries ?? 0,
            icon: "bi-hourglass-split",
            color: "warning"
        },
        {
            label: "Cancelled Deliveries",
            value: overview?.cancelledDeliveries ?? 0,
            icon: "bi-x-circle",
            color: "danger"
        },
        {
            label: "Completed Today",
            value: overview?.completedToday ?? 0,
            icon: "bi-calendar-check",
            color: "info"
        },
        {
            label: "Current Status",
            value: overview?.currentStatus ?? "Available",
            icon: "bi-activity",
            color: "secondary"
        }
    ];

    return (

        <div className="driver-dashboard-page">

            <div className="container-fluid py-4 px-4 driver-dashboard-content">

            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">

                <h3 className="mb-0">Driver Dashboard</h3>

                <ThemeToggle />

            </div>

            <div className="row g-3 mb-4">

                {statCards.map((card) => (

                    <div
                        className="col-lg-3 col-md-6 col-sm-6"
                        key={card.label}
                    >

                        <div className="card shadow-sm h-100">

                            <div className="card-body d-flex align-items-center">

                                <i
                                    className={`bi ${card.icon} text-${card.color} me-3 fs-3`}
                                ></i>

                                <div>

                                    <div className="small text-muted">
                                        {card.label}
                                    </div>

                                    <div className="fw-bold fs-5">
                                        {card.value}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <ul className="nav nav-tabs mb-4">

                {TABS.map((tab) => (

                    <li
                        className="nav-item"
                        key={tab.key}
                    >

                        <button
                            type="button"
                            className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>

                    </li>

                ))}

            </ul>

            {activeTab === "shipments" && (

                <div>

                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

                        <h5 className="mb-0">Assigned Shipments</h5>

                        <div className="d-flex gap-2">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search tracking no / receiver / address"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                            />

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSearch}
                                disabled={shipmentsLoading}
                            >
                                Search
                            </button>

                        </div>

                    </div>

                    {shipmentsLoading ? (

                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>

                    ) : shipments.length === 0 ? (

                        <div className="alert alert-info">
                            No assigned shipments found.
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead>
                                    <tr>
                                        <th>Tracking</th>
                                        <th>Receiver</th>
                                        <th>Destination</th>
                                        <th>Status</th>
                                        <th>Weight</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {shipments.map((shipment) => (

                                        <tr key={shipment.shipmentId}>

                                            <td>{shipment.trackingNumber}</td>

                                            <td>{shipment.receiverName}</td>

                                            <td>{shipment.destinationAddress}</td>

                                            <td>
                                                <span
                                                    className={`badge ${getBadgeClass(shipment.shipmentStatus)}`}
                                                >
                                                    {shipment.shipmentStatus.replace(/_/g, " ")}
                                                </span>
                                            </td>

                                            <td>
                                                {shipment.packageWeight != null
                                                    ? `${shipment.packageWeight} kg`
                                                    : "—"}
                                            </td>

                                            <td>

                                                <div className="d-flex flex-wrap gap-1">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openDetails(shipment)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => openStatusModal(shipment)}
                                                    >
                                                        Status
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => setRouteDetailsShipment(shipment)}
                                                    >
                                                        View Route
                                                    </button>

                                                    {canDeliver(shipment) && (

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => openProofModal(shipment)}
                                                        >
                                                            Complete Delivery
                                                        </button>

                                                    )}

                                                    {shipment.shipmentStatus === "DELIVERED" && (

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() => navigate(`/pod/${shipment.shipmentId}`)}
                                                        >
                                                            POD
                                                        </button>

                                                    )}

                                        </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}

            {activeTab === "tracking" && (

                <div className="row g-3">

                    <div className="col-lg-8">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h5 className="mb-3">Live Navigation & Tracking</h5>

                                {shipments.length === 0 ? (

                                    <div className="alert alert-info">
                                        No assigned shipments to track.
                                    </div>

                                ) : (

                                    <>
                                        <div className="mb-3 d-flex gap-2 flex-wrap">

                                            <select
                                                className="form-select"
                                                value={trackingShipment?.shipmentId ?? ""}
                                                onChange={handleTrackingSelect}
                                            >
                                                <option value="" disabled>
                                                    Select a shipment to track
                                                </option>
                                                {shipments.map((shipment) => (
                                                    <option
                                                        key={shipment.shipmentId}
                                                        value={shipment.shipmentId}
                                                    >
                                                        {shipment.trackingNumber} — {shipment.receiverName}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                className="btn btn-outline-info"
                                                disabled={!trackingShipment}
                                                onClick={() => setRouteDetailsShipment(trackingShipment)}
                                            >
                                                View Route
                                            </button>

                                        </div>

                                        {trackingShipment ? (

                                            routeDetails.loading ? (

                                                <div className="text-center py-4">
                                                    <div className="spinner-border text-primary" role="status"></div>
                                                    <div className="text-muted mt-2">
                                                        Loading live route...
                                                    </div>
                                                </div>

                                            ) : (

                                                <RouteDetailsView
                                                    points={routeDetails.points}
                                                    summary={routeDetails.summary}
                                                    source={routeDetails.coords?.source}
                                                    destination={routeDetails.coords?.destination}
                                                    driverName={routeDetails.shipment?.driver?.fullName
                                                        || routeDetails.shipment?.deliveryDriverName
                                                        || null}
                                                    delivered={routeDetails.shipment?.shipmentStatus === "DELIVERED"}
                                                    trackingNumber={trackingShipment.trackingNumber}
                                                    estimatedDeliveryAt={routeDetails.shipment?.estimatedDeliveryAt || null}
                                                />

                                            )

                                        ) : (

                                            <div className="alert alert-secondary">
                                                Select a shipment above to see the truck movement from source to destination.
                                            </div>

                                        )}

                                    </>

                                )}

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h5 className="mb-3">Delivery Info & ETA</h5>

                                {monitor ? (

                                    <div className="d-grid gap-2">

                                        <div>
                                            <span className="text-muted small">Tracking</span>
                                            <div className="fw-bold">{monitor.trackingNumber}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Status</span>
                                            <div>
                                                <span className={`badge ${getBadgeClass(monitor.shipmentStatus)}`}>
                                                    {monitor.shipmentStatus.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">ETA</span>
                                            <div className="fw-bold">{monitor.etaLabel || "—"}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Distance to Destination</span>
                                            <div className="fw-bold">
                                                {monitor.distanceKm != null
                                                    ? `${monitor.distanceKm.toFixed(1)} km`
                                                    : "—"}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Forecast</span>
                                            <div>{monitor.deliveryForecast || "—"}</div>
                                        </div>

                                        {monitor.delayed && (
                                            <div className="alert alert-danger py-2 mb-0">
                                                {monitor.delayReason}
                                            </div>
                                        )}

                                    </div>

                                ) : (

                                    <p className="text-muted mb-0">
                                        Select a shipment to view live delivery information.
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {activeTab === "pod" && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Delivered Shipments</h5>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={loadPods}
                            disabled={podsLoading}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>
                    </div>

                    {podsLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : podList.length === 0 ? (
                        <div className="alert alert-info">
                            No delivered shipments yet.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Tracking</th>
                                        <th>Receiver</th>
                                        <th>POD Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {podList.map(({ shipment, pod }) => (
                                        <tr key={shipment.shipmentId}>
                                            <td>{shipment.trackingNumber}</td>
                                            <td>{pod?.receiverName || shipment.receiverName}</td>
                                            <td>
                                                {(() => {
                                                    const status = getPodStatus(pod);
                                                    return (
                                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                                            <span className={`badge bg-${status.color}`}>
                                                                <i className={`bi ${status.icon} me-1`}></i>
                                                                {status.label}
                                                            </span>
                                                            {pod && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => navigate(`/pod/${shipment.shipmentId}`)}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i>
                                                                    View POD
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "notifications" && (

                <div>

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="mb-0">Notifications</h5>

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleMarkAllRead}
                        >
                            Mark All as Read
                        </button>

                    </div>

                    <div className="card shadow border-0 mb-4">
                        <div className="card-body">
                            <h6 className="mb-3">
                                <i className="bi bi-headset me-1"></i>
                                Message Support Team
                            </h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Subject"
                                        value={supportMsgTitle}
                                        onChange={(event) => setSupportMsgTitle(event.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Write your message..."
                                        value={supportMsgBody}
                                        onChange={(event) => setSupportMsgBody(event.target.value)}
                                    />
                                </div>
                                <div className="col-md-2 d-grid">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={supportMsgSending}
                                        onClick={sendSupportMessage}
                                    >
                                        {supportMsgSending ? "Sending..." : "Send"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {notifications.length === 0 ? (

                        <div className="alert alert-info">
                            No notifications yet.
                        </div>

                    ) : (

                        <div className="list-group">

                            {notifications.map((notification) => (

                                <div
                                    key={notification.id}
                                    className={`list-group-item d-flex justify-content-between align-items-start gap-3 ${notification.read ? "" : "list-group-item-warning"}`}
                                >

                                    <div>

                                        <div className="fw-bold">
                                            {notification.title}
                                        </div>

                                        <div className="text-muted">
                                            {notification.message}
                                        </div>

                                        <div className="small text-muted">
                                            {notification.senderName
                                                ? `From: ${notification.senderName}`
                                                : ""}
                                        </div>

                                        <div className="small text-muted">
                                            {formatDateTime(notification.createdAt)}
                                        </div>

                                    </div>

                                    <div className="d-flex gap-1 flex-shrink-0">

                                        {!notification.read && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleMarkRead(notification.id)}
                                            >
                                                Read
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            )}

            {activeTab === "profile" && (

                <div className="row g-3">

                    <div className="col-lg-4">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h5 className="mb-3">Profile</h5>

                                {profile && (

                                    <div className="d-grid gap-2">

                                        <div>
                                            <span className="text-muted small">Name</span>
                                            <div className="fw-bold">{profile.fullName}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Email</span>
                                            <div>{profile.email}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Contact Number</span>
                                            <div>{profile.phone || "—"}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Role</span>
                                            <div>{profile.role}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted small">Member Since</span>
                                            <div>{formatDateTime(profile.createdAt)}</div>
                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                        <div className="card shadow-sm mt-3">

                            <div className="card-body">

                                <h5 className="mb-3">Assigned Vehicle</h5>

                                <p className="text-muted mb-0">
                                    No vehicle assigned.
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h5 className="mb-3">Update Contact Number</h5>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Phone Number
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                    />

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={saveContact}
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h5 className="mb-3">Change Password</h5>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Current Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                    />

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={submitPassword}
                                >
                                    Change Password
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {selectedShipment && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-scrollable">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Shipment Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedShipment(null)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                <div className="row g-3">

                                    <div className="col-md-6">

                                        <h6>Shipment Information</h6>

                                        <div className="d-grid gap-1">

                                            <div>
                                                <span className="text-muted small">Tracking</span>
                                                <div className="fw-bold">{selectedShipment.trackingNumber}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Status</span>
                                                <div>
                                                    <span className={`badge ${getBadgeClass(selectedShipment.shipmentStatus)}`}>
                                                        {selectedShipment.shipmentStatus.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Sender</span>
                                                <div>{selectedShipment.senderName || "—"}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Receiver</span>
                                                <div>{selectedShipment.receiverName || "—"}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Weight</span>
                                                <div>
                                                    {selectedShipment.packageWeight != null
                                                        ? `${selectedShipment.packageWeight} kg`
                                                        : "—"}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Created</span>
                                                <div>{formatDateTime(selectedShipment.createdAt)}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Estimated Delivery</span>
                                                <div>{formatDateTime(selectedShipment.estimatedDeliveryAt)}</div>
                                            </div>

                                            {selectedShipment.deliveryFailureReason && (
                                                <div>
                                                    <span className="text-muted small">Failure Reason</span>
                                                    <div className="text-danger">
                                                        {selectedShipment.deliveryFailureReason}
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                    </div>

                                    <div className="col-md-6">

                                        <h6>Customer Information</h6>

                                        <div className="d-grid gap-1">

                                            <div>
                                                <span className="text-muted small">Name</span>
                                                <div className="fw-bold">{selectedShipment.customerName || "Not available"}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Phone</span>
                                                <div>{selectedShipment.customerPhone || "Not available"}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Email</span>
                                                <div>{selectedShipment.customerEmail || "Not available"}</div>
                                            </div>

                                        </div>

                                        <h6 className="mt-3">Delivery Address</h6>

                                        <div className="d-grid gap-1">

                                            <div>
                                                <span className="text-muted small">Address</span>
                                                <div>{selectedShipment.destinationAddress || "—"}</div>
                                            </div>

                                            <div>
                                                <span className="text-muted small">Coordinates</span>
                                                <div>
                                                    {selectedShipment.destinationLatitude != null
                                                        ? `${selectedShipment.destinationLatitude}, ${selectedShipment.destinationLongitude}`
                                                        : "—"}
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedShipment(null)}
                                >
                                    Close
                                </button>

                                {canDeliver(selectedShipment) && (

                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => {
                                            setSelectedShipment(null);
                                            openProofModal(selectedShipment);
                                        }}
                                    >
                                        Complete Delivery
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {showStatusModal && statusShipment && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Update Status
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowStatusModal(false)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                <p className="text-muted">
                                    {statusShipment.trackingNumber} — {statusShipment.receiverName}
                                </p>

                                <div className="mb-3">

                                    <label className="form-label">
                                        New Status
                                    </label>

                                    <select
                                        className="form-select"
                                        value={statusValue}
                                        onChange={(event) => setStatusValue(event.target.value)}
                                    >

                                        <option value="" disabled>
                                            Select status
                                        </option>

                                        {DRIVER_STATUS_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                {statusValue === "DELIVERY_FAILED" && (

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Failure Reason
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={failureReason}
                                            onChange={(event) => setFailureReason(event.target.value)}
                                            placeholder="e.g. Recipient not available at address"
                                        ></textarea>

                                    </div>

                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={statusSubmitting}
                                    onClick={submitStatus}
                                >
                                    {statusSubmitting ? "Saving..." : "Save"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {showProofModal && proofShipment && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-scrollable">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Proof of Delivery
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeProofModal}
                                ></button>

                            </div>

                            <div className="modal-body">

                                {proofConfirmed ? (

                                    <>

                                        <div className="alert alert-success d-flex align-items-start" role="alert">

                                            <div>
                                                <h6 className="mb-1">
                                                    Delivery Completed Successfully
                                                </h6>
                                                <p className="mb-1">
                                                    Proof of Delivery generated. Shipment {proofShipment.trackingNumber}
                                                    was marked as delivered on {proofDeliveryTime}.
                                                </p>

                                                <div className="d-flex gap-2 mt-2 flex-wrap">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => viewProofPdf(proofShipment)}
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        View POD
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => downloadProofPdf(proofShipment)}
                                                    >
                                                        <i className="bi bi-download me-1"></i>
                                                        Download POD
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="row g-4">

                                            <div className="col-md-6">

                                                <h6>Delivery Details</h6>

                                                <div className="mb-2">
                                                    <span className="text-muted">Receiver Name:</span>
                                                    <div className="fw-semibold">{receiverName || "--"}</div>
                                                </div>

                                                <div className="mb-2">
                                                    <span className="text-muted">Delivered On:</span>
                                                    <div className="fw-semibold">{proofDeliveryTime || "--"}</div>
                                                </div>

                                                <div className="mb-2">
                                                    <span className="text-muted">GPS Location:</span>
                                                    <div className="fw-semibold">
                                                        Not captured
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-md-6">

                                                <h6>Receiver Signature</h6>

                                                {signatureData ? (
                                                    <img
                                                        src={signatureData}
                                                        alt="Receiver signature"
                                                        className="border rounded bg-white"
                                                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                                                    />
                                                ) : (
                                                    <p className="text-muted">No signature captured.</p>
                                                )}

                                                {deliveryPhoto && (
                                                    <div className="mt-3">
                                                        <h6>Delivery Photo</h6>
                                                        <img
                                                            src={deliveryPhoto}
                                                            alt="Delivery proof"
                                                            className="border rounded"
                                                            style={{ maxWidth: "100%", maxHeight: "180px" }}
                                                        />
                                                    </div>
                                                )}

                                            </div>

                                        </div>

                                    </>

                                ) : (

                                <>
                                <p className="text-muted">
                                    {proofShipment.trackingNumber} — {proofShipment.receiverName}
                                </p>

                                <div className="row g-4">

                                    <div className="col-12">

                                        <div className="row g-3">

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Tracking Number</span>
                                                <div className="fw-semibold">{proofShipment.trackingNumber || "--"}</div>
                                            </div>

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Shipment Status</span>
                                                <div>
                                                    <span className={`badge ${getBadgeClass("DELIVERED")}`}>
                                                        DELIVERED
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Driver Name</span>
                                                <div className="fw-semibold">
                                                    {proofShipment.driver?.fullName || profile?.fullName || "--"}
                                                </div>
                                            </div>

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Customer Name</span>
                                                <div className="fw-semibold">{proofShipment.customerName || "--"}</div>
                                            </div>

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Receiver Name</span>
                                                <div className="fw-semibold">{proofShipment.receiverName || "--"}</div>
                                            </div>

                                            <div className="col-sm-6 col-lg-4">
                                                <span className="text-muted small d-block">Customer Phone</span>
                                                <div className="fw-semibold">{proofShipment.customerPhone || "--"}</div>
                                            </div>

                                            <div className="col-12">
                                                <span className="text-muted small d-block">Delivery Address</span>
                                                <div className="fw-semibold">{proofShipment.destinationAddress || "--"}</div>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <hr />

                                <div className="row g-4">

                                    <div className="col-md-6">

                                        <h6>Receiver & Signature</h6>

                                        <div className="mb-3">

                                            <label className="form-label">
                                                Receiver Name
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={receiverName}
                                                onChange={(event) => setReceiverName(event.target.value)}
                                            />

                                        </div>

                                        <label className="form-label">
                                            Signature
                                        </label>

                                        <SignaturePad
                                            onSave={setSignatureData}
                                            width={400}
                                            height={160}
                                        />

                                        <div className="form-text">
                                            Required. The receiver must sign before the delivery can be confirmed.
                                        </div>

                                    </div>

                                    <div className="col-md-6">

                                        <h6>Delivery Photo</h6>

                                        <div className="mb-3">

                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handlePhotoChange}
                                            />

                                            <div className="form-text">
                                                Optional. Capture a photo of the delivered package.
                                            </div>

                                        </div>

                                        {deliveryPhoto && (

                                            <div className="mb-3">

                                                <img
                                                    src={deliveryPhoto}
                                                    alt="Delivery proof"
                                                    className="border rounded"
                                                    style={{ maxWidth: "100%", maxHeight: "220px" }}
                                                />

                                            </div>

                                        )}

                                    </div>

                                </div>

                                </>

                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeProofModal}
                                >
                                    {proofConfirmed ? "Done" : "Cancel"}
                                </button>

                                {!proofConfirmed && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        disabled={proofSubmitting}
                                        onClick={submitProof}
                                    >
                                        {proofSubmitting ? "Confirming..." : "Confirm Delivery"}
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {routeDetailsShipment && (
                <RouteDetailsModal
                    shipmentId={routeDetailsShipment.shipmentId}
                    trackingNumber={routeDetailsShipment.trackingNumber}
                    onClose={() => setRouteDetailsShipment(null)}
                />
            )}

            </div>

        </div>

    );

}
