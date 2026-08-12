import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";
import RouteDetailsModal from "../components/routes/RouteDetailsModal";
import ThemeToggle from "../components/dashboard/ThemeToggle";

import "../styles/customer-dashboard.css";

function CustomerDashboard() {

    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [shipmentRequests, setShipmentRequests] = useState([]);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showShipmentRequestModal, setShowShipmentRequestModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({
        subject: "",
        message: "",
        trackingNumber: ""
    });
    const [shipmentRequestForm, setShipmentRequestForm] = useState({
        senderName: "",
        receiverName: "",
        customerEmail: localStorage.getItem("email") || "",
        customerPhone: "",
        sourceAddress: "",
        destinationAddress: "",
        packageWeight: ""
    });
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [ticketLoading, setTicketLoading] = useState(false);
    const [shipmentRequestLoading, setShipmentRequestLoading] = useState(false);
    const [timelineShipment, setTimelineShipment] = useState(null);
    const [timelineHistory, setTimelineHistory] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [proofShipment, setProofShipment] = useState(null);
    const [podData, setPodData] = useState(null);
    const [podLoading, setPodLoading] = useState(false);
    const [podDeliveredAt, setPodDeliveredAt] = useState(null);
    const [routeShipment, setRouteShipment] = useState(null);
    const selectedLocationRef = useRef({
        sourceAddress: "",
        destinationAddress: ""
    });

    const [stats, setStats] = useState({
        customerName: "",
        totalShipments: 0,
        createdShipments: 0,
        deliveredShipments: 0,
        inTransitShipments: 0,
        pendingShipments: 0,
        outForDeliveryShipments: 0,
        pickedUpShipments: 0,
        cancelledShipments: 0,
        deliveryFailedShipments: 0,
        activeShipments: 0,
        deliverySuccessRate: 0,
        averageDeliveryTimeMinutes: 0,
        lastDeliveryDate: null
    });

    const [allShipments, setAllShipments] = useState([]);
    const [historyFrom, setHistoryFrom] = useState("");
    const [historyTo, setHistoryTo] = useState("");

    async function fetchStats() {

        try {

            const token =
                localStorage.getItem("token");

            const response =
                await api.get(
                    "/customer/dashboard",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setStats(response.data);

        } catch (error) {

            console.error(error);
        }
    }

    async function fetchAllShipments() {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/shipments/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAllShipments(response.data || []);

        } catch (error) {

            console.error(error);
        }
    }

    async function fetchTickets() {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/support-requests", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTickets(response.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchShipmentRequests() {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/shipment-requests/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setShipmentRequests(response.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchLocationSuggestions(query, field) {
        const value = query.trim();
        const setSuggestions =
            field === "sourceAddress"
                ? setSourceSuggestions
                : setDestinationSuggestions;

        if (
            value.length < 3 ||
            selectedLocationRef.current[field] === value
        ) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}&limit=5`,
                {
                    headers: {
                        "Accept-Language": "en"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Location lookup failed");
            }

            const data = await response.json();
            setSuggestions(data || []);
        } catch (error) {
            console.error(error);
            setSuggestions([]);
        }
    }

    useEffect(() => {

        Promise.resolve().then(() => {
            fetchStats();
            fetchTickets();
            fetchShipmentRequests();
            fetchAllShipments();
        });

    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLocationSuggestions(
                shipmentRequestForm.sourceAddress,
                "sourceAddress"
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [shipmentRequestForm.sourceAddress]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLocationSuggestions(
                shipmentRequestForm.destinationAddress,
                "destinationAddress"
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [shipmentRequestForm.destinationAddress]);

    const STATUS_BADGE = {
        CREATED: "bg-primary",
        PENDING: "bg-secondary",
        PICKED_UP: "bg-primary",
        IN_TRANSIT: "bg-warning text-dark",
        OUT_FOR_DELIVERY: "bg-info text-dark",
        DELIVERY_FAILED: "bg-danger",
        DELIVERED: "bg-success",
        CANCELLED: "bg-danger"
    };

    const TIMELINE_STEPS = [
        { key: "CREATED", label: "Order Created" },
        { key: "PICKED_UP", label: "Picked Up" },
        { key: "IN_TRANSIT", label: "In Transit" },
        { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { key: "DELIVERED", label: "Delivered" }
    ];

    const openTimeline = (shipment) => {
        setTimelineShipment(shipment);
        setTimelineHistory([]);
        setTimelineLoading(true);

        const token = localStorage.getItem("token");

        api.get(`/tracking/${shipmentIdOf(shipment)}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => setTimelineHistory(response.data || []))
            .catch(() => setTimelineHistory([]))
            .finally(() => setTimelineLoading(false));
    };

    const openProof = (shipment) => {
        setProofShipment(shipment);
        setPodData(null);
        setPodLoading(true);
        setPodDeliveredAt(null);

        const token = localStorage.getItem("token");
        const shipmentId = shipmentIdOf(shipment);

        Promise.all([
            api.get(`/pod/${shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null),
            api.get(`/tracking/${shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => [])
        ])
            .then(([podResponse, historyResponse]) => {
                setPodData(podResponse?.data || null);
                const history = historyResponse?.data || [];
                const deliveredEntry = history
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(a?.timestamp) - new Date(b?.timestamp)
                    )
                    .find(
                        (entry) =>
                            String(entry?.status) === "DELIVERED"
                    );
                setPodDeliveredAt(deliveredEntry?.timestamp || null);
            })
            .catch(() => setPodData(null))
            .finally(() => setPodLoading(false));
    };

    const downloadReceipt = async (shipment) => {
        try {
            const token = localStorage.getItem("token");

            let deliveredAt = shipment.deliveryTime || null;

            if (!deliveredAt) {
                try {
                    const historyResponse = await api.get(
                        `/tracking/${shipmentIdOf(shipment)}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const deliveredEntry = (historyResponse?.data || [])
                        .slice()
                        .sort(
                            (a, b) =>
                                new Date(a?.timestamp) - new Date(b?.timestamp)
                        )
                        .find(
                            (entry) =>
                                String(entry?.status) === "DELIVERED"
                        );
                    deliveredAt = deliveredEntry?.timestamp || null;
                } catch {
                    deliveredAt = null;
                }
            }

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("Shipment Receipt", 14, 20);

            doc.setFontSize(10);
            doc.text(
                `Generated: ${new Date().toLocaleString()}`,
                14,
                28
            );

            autoTable(doc, {
                startY: 34,
                head: [["Shipment Receipt", ""]],
                body: [
                    ["Tracking Number", shipment.trackingNumber || "--"],
                    ["Sender", shipment.senderName || "--"],
                    ["Receiver", shipment.receiverName || "--"],
                    ["Receiver Address", shipment.receiverAddress || "--"],
                    ["Package Weight", shipment.packageWeight != null
                        ? `${shipment.packageWeight} kg`
                        : "--"],
                    ["Status", String(shipment.shipmentStatus || "").replace(/_/g, " ")],
                    ["Created At", shipment.createdAt
                        ? new Date(shipment.createdAt).toLocaleString()
                        : "--"],
                    ["Delivered At", deliveredAt
                        ? new Date(deliveredAt).toLocaleString()
                        : "--"],
                    ["Received By", shipment.deliveryReceiverName || shipment.receiverName || "--"],
                    ["Driver", shipment.deliveryDriverName || shipment.driver?.fullName || "--"]
                ]
            });

            doc.save(`Receipt-${shipment.trackingNumber}.pdf`);
            toast.success("Receipt downloaded successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download receipt.");
        }
    };

    const buildTimeline = (shipment, history) => {
        const statusIndex = TIMELINE_STEPS.findIndex(
            (step) => step.key === shipment.shipmentStatus
        );
        const historyByStatus = {};

        (history || []).forEach((entry) => {
            const key = entry.status;
            if (
                key &&
                (!historyByStatus[key] ||
                    new Date(entry.timestamp) > new Date(historyByStatus[key]))
            ) {
                historyByStatus[key] = entry.timestamp;
            }
        });

        return TIMELINE_STEPS.map((step, index) => ({
            ...step,
            done: statusIndex >= index || Boolean(historyByStatus[step.key]),
            timestamp: historyByStatus[step.key] || null
        }));
    };

    const formatDateTime = (value) =>
        value ? new Date(value).toLocaleString() : "--";

    const shipmentIdOf = (shipment) =>
        shipment?.shipmentId ?? shipment?.id ?? null;

    const shortLocation = (address) => {
        if (!address) return "--";
        const parts = String(address)
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
        return parts.slice(0, 2).join(", ") || "--";
    };

    const chartData = [
        {
            name: "Created",
            value: stats.createdShipments
        },
        {
            name: "Delivered",
            value: stats.deliveredShipments
        },
        {
            name: "In Transit",
            value: stats.inTransitShipments
        },
        {
            name: "Pending",
            value: stats.pendingShipments
        },
        {
            name: "Out For Delivery",
            value: stats.outForDeliveryShipments
        },
        {
            name: "Cancelled",
            value: stats.cancelledShipments
        }
    ];

    const statusBoxes = [
        {
            label: "Total Shipments",
            value: stats.totalShipments
        },
        {
            label: "Active",
            value: stats.activeShipments
        },
        {
            label: "Delivered",
            value: stats.deliveredShipments
        },
        {
            label: "Pending",
            value: stats.pendingShipments
        },
        {
            label: "Delivery Success Rate",
            value: stats.deliverySuccessRate != null
                ? `${stats.deliverySuccessRate}%`
                : "0%"
        },
        {
            label: "Cancelled",
            value: stats.cancelledShipments
        }
    ];

    const submitTicket = async (e) => {
        e.preventDefault();

        if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
            return;
        }

        try {
            setTicketLoading(true);
            const token = localStorage.getItem("token");
            await api.post(
                "/support-requests",
                {
                    subject: ticketForm.subject.trim(),
                    message: ticketForm.message.trim(),
                    trackingNumber: ticketForm.trackingNumber.trim() || null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Ticket raised successfully.");

            setTicketForm({
                subject: "",
                message: "",
                trackingNumber: ""
            });
            setShowTicketModal(false);
        } catch (error) {
            console.error(error);
        } finally {
            setTicketLoading(false);
        }
    };

    const handleLocationInputChange = (field, value) => {
        selectedLocationRef.current[field] = "";
        setActiveLocationField(field);
        setShipmentRequestForm((currentForm) => ({
            ...currentForm,
            [field]: value
        }));
    };

    const handleSelectLocation = (field, place) => {
        const address = place.display_name;
        selectedLocationRef.current[field] = address;

        setShipmentRequestForm((currentForm) => ({
            ...currentForm,
            [field]: address
        }));

        if (field === "sourceAddress") {
            setSourceSuggestions([]);
        } else {
            setDestinationSuggestions([]);
        }

        setActiveLocationField(null);
    };

    const renderLocationSuggestions = (field, suggestions) => {
        if (activeLocationField !== field || suggestions.length === 0) {
            return null;
        }

        return (
            <div className="list-group position-absolute w-100 z-3 shadow-sm">
                {suggestions.map((place) => (
                    <button
                        key={place.place_id}
                        type="button"
                        className="list-group-item list-group-item-action small"
                        onMouseDown={(event) => {
                            event.preventDefault();
                            handleSelectLocation(field, place);
                        }}
                    >
                        {place.display_name}
                    </button>
                ))}
            </div>
        );
    };

    const closeShipmentRequestModal = () => {
        setShowShipmentRequestModal(false);
        setSourceSuggestions([]);
        setDestinationSuggestions([]);
        setActiveLocationField(null);
    };

    const submitShipmentRequest = async (e) => {
        e.preventDefault();

        if (
            !shipmentRequestForm.senderName.trim() ||
            !shipmentRequestForm.receiverName.trim() ||
            !shipmentRequestForm.customerEmail.trim() ||
            !shipmentRequestForm.sourceAddress.trim() ||
            !shipmentRequestForm.destinationAddress.trim() ||
            !shipmentRequestForm.packageWeight
        ) {
            toast.error("Fill all shipment request fields.");
            return;
        }

        try {
            setShipmentRequestLoading(true);
            const token = localStorage.getItem("token");
            await api.post(
                "/shipment-requests",
                {
                    senderName: shipmentRequestForm.senderName.trim(),
                    receiverName: shipmentRequestForm.receiverName.trim(),
                    customerEmail: shipmentRequestForm.customerEmail.trim(),
                    customerPhone: shipmentRequestForm.customerPhone.trim() || null,
                    sourceAddress: shipmentRequestForm.sourceAddress.trim(),
                    destinationAddress: shipmentRequestForm.destinationAddress.trim(),
                    packageWeight: Number(shipmentRequestForm.packageWeight)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success(
                "Shipment request sent to admin.",
                {
                    position: "top-right"
                }
            );
            setShipmentRequestForm({
                senderName: "",
                receiverName: "",
                customerEmail: localStorage.getItem("email") || "",
                customerPhone: "",
                sourceAddress: "",
                destinationAddress: "",
                packageWeight: ""
            });
            selectedLocationRef.current = {
                sourceAddress: "",
                destinationAddress: ""
            };
            await fetchShipmentRequests();
            closeShipmentRequestModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send shipment request");
        } finally {
            setShipmentRequestLoading(false);
        }
    };

    return (

        <div className="customer-dashboard-page">

            <div className="container-fluid customer-dashboard-content py-4 px-4">

            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">

                <div>

                    <h2 className="mb-0">
                        Customer Dashboard
                    </h2>

                    {stats.customerName ? (
                        <p className="text-muted mb-0 mt-1">
                            Welcome, {stats.customerName}
                        </p>
                    ) : null}

                </div>

                <ThemeToggle />

            </div>

            {}

            <div className="row g-3 mb-4">

                {statusBoxes.map((item) => (
                    <div className="col-12 col-md-3" key={item.label}>
                        <div className="card shadow border-0 h-100">
                            <div className="card-body text-center">
                                <h6 className="mb-2">{item.label}</h6>
                                <h3 className="mb-0">{item.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Quick Actions
                    </h4>

                    <div className="d-flex gap-3 flex-wrap">

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate(
                                    "/track-shipment"
                                )
                            }
                        >
                            Track Shipment
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() =>
                                navigate(
                                    "/shipments"
                                )
                            }
                        >
                            View Orders
                        </button>

                        <button
                            className="btn btn-warning"
                            onClick={() => setShowTicketModal(true)}
                        >
                            Raise Ticket
                        </button>

                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowShipmentRequestModal(true)}
                        >
                            Create Shipment Request
                        </button>

                    </div>

                </div>

            </div>

            {}

            <div className="card shadow border-0 mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">

                        <h4 className="mb-0">
                            My Shipments
                        </h4>

                    </div>

                    <div className="row g-2 align-items-end mb-3">

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">From Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={historyFrom}
                                onChange={(e) => setHistoryFrom(e.target.value)}
                            />
                        </div>

                        <div className="col-6 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">To Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={historyTo}
                                onChange={(e) => setHistoryTo(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-6 col-lg-8 text-md-end text-muted small">
                            Showing {(() => {
                                const all = allShipments || [];
                                const filtered = all.filter((shipment) => {
                                    const raw = shipment.createdAt || shipment.deliveryTime;
                                    if (!raw) return true;
                                    const key = String(raw).slice(0, 10);
                                    if (historyFrom && key < historyFrom) return false;
                                    if (historyTo && key > historyTo) return false;
                                    return true;
                                });
                                return `${filtered.length} of ${all.length} shipments`;
                            })()}
                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-dark">

                                <tr>

                                    <th>Tracking No.</th>

                                    <th>Receiver</th>

                                    <th>Status</th>

                                    <th>Delivered At</th>

                                    <th>Received By</th>

                                    <th>Timeline</th>

                                    <th>Route</th>

                                    <th>Proof of Delivery</th>

                                    <th>Receipt</th>

                                </tr>

                            </thead>

                            <tbody>

                                {(allShipments || []).filter((shipment) => {
                                    const raw = shipment.createdAt || shipment.deliveryTime;
                                    if (!raw) return true;
                                    const key = String(raw).slice(0, 10);
                                    if (historyFrom && key < historyFrom) return false;
                                    if (historyTo && key > historyTo) return false;
                                    return true;
                                }).length === 0 ? (

                                    <tr>

                                        <td colSpan={9} className="text-center py-4">
                                            No shipments found.
                                        </td>

                                    </tr>

                                ) : (

                                    (allShipments || []).filter((shipment) => {
                                        const raw = shipment.createdAt || shipment.deliveryTime;
                                        if (!raw) return true;
                                        const key = String(raw).slice(0, 10);
                                        if (historyFrom && key < historyFrom) return false;
                                        if (historyTo && key > historyTo) return false;
                                        return true;
                                    }).map((shipment) => (

                                        <tr key={shipmentIdOf(shipment)}>

                                            <td>{shipment.trackingNumber}</td>

                                            <td>{shipment.receiverName || "--"}</td>

                                            <td>

                                                <span
                                                    className={`badge ${STATUS_BADGE[shipment.shipmentStatus] || "bg-dark"}`}
                                                >
                                                    {String(shipment.shipmentStatus).replace(/_/g, " ")}
                                                </span>

                                            </td>

                                            <td>
                                                {shipment.shipmentStatus === "DELIVERED"
                                                    ? shortLocation(shipment.receiverAddress || shipment.destinationAddress)
                                                    : "--"}
                                            </td>

                                            <td>
                                                {shipment.shipmentStatus === "DELIVERED"
                                                    ? (shipment.deliveryReceiverName || shipment.receiverName || "--")
                                                    : "--"}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => openTimeline(shipment)}
                                                >
                                                    View Timeline
                                                </button>

                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-info btn-sm"
                                                    onClick={() => setRouteShipment(shipment)}
                                                >
                                                    View Route
                                                </button>

                                            </td>

                                            <td>

                                                {shipment.shipmentStatus === "DELIVERED" ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => openProof(shipment)}
                                                    >
                                                        View Proof
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">--</span>
                                                )}

                                            </td>

                                            <td>

                                                {shipment.shipmentStatus === "DELIVERED" ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => downloadReceipt(shipment)}
                                                    >
                                                        Download Receipt
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">--</span>
                                                )}

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            {}

            <div className="row g-3 mb-4">

                <div className="col-md-6">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4 className="mb-3">
                                Pending Shipments
                            </h4>

                            {allShipments.filter((shipment) =>
                                shipment.shipmentStatus === "PENDING" ||
                                shipment.shipmentStatus === "CREATED"
                            ).length === 0 ? (

                                <p className="text-muted mb-0">
                                    No pending shipments.
                                </p>

                            ) : (

                                <ul className="list-group list-group-flush">
                                    {allShipments.filter((shipment) =>
                                        shipment.shipmentStatus === "PENDING" ||
                                        shipment.shipmentStatus === "CREATED"
                                    ).map((shipment) => (
                                        <li
                                            key={shipment.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {shipment.trackingNumber}
                                                </div>
                                                <div className="small text-muted">
                                                    {shipment.receiverName || "--"} · {shipment.destinationAddress || "--"}
                                                </div>
                                            </div>
                                            <span className="badge bg-secondary">
                                                {String(shipment.shipmentStatus).replace(/_/g, " ")}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                            )}

                        </div>

                    </div>

                </div>

                <div className="col-md-6">

                    <div className="card shadow border-0 h-100">

                        <div className="card-body">

                            <h4 className="mb-3">
                                Cancelled Shipments
                            </h4>

                            {allShipments.filter((shipment) =>
                                shipment.shipmentStatus === "CANCELLED"
                            ).length === 0 ? (

                                <p className="text-muted mb-0">
                                    No cancelled shipments.
                                </p>

                            ) : (

                                <ul className="list-group list-group-flush">
                                    {allShipments.filter((shipment) =>
                                        shipment.shipmentStatus === "CANCELLED"
                                    ).map((shipment) => (
                                        <li
                                            key={shipment.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {shipment.trackingNumber}
                                                </div>
                                                <div className="small text-muted">
                                                    {shipment.receiverName || "--"} · {shipment.destinationAddress || "--"}
                                                </div>
                                            </div>
                                            <span className="badge bg-danger">
                                                CANCELLED
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                            )}

                        </div>

                    </div>

                </div>

            </div>

            {showTicketModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Raise Support Ticket</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowTicketModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={submitTicket}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Subject</label>
                                        <input
                                            className="form-control"
                                            value={ticketForm.subject}
                                            onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tracking Number</label>
                                        <input
                                            className="form-control"
                                            value={ticketForm.trackingNumber}
                                            onChange={(e) => setTicketForm({ ...ticketForm, trackingNumber: e.target.value })}
                                            placeholder="Optional if you want support on a shipment"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Message</label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={ticketForm.message}
                                            onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowTicketModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={ticketLoading}>
                                        {ticketLoading ? "Submitting..." : "Submit Ticket"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showShipmentRequestModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Shipment Request</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeShipmentRequestModal}
                                ></button>
                            </div>
                            <form onSubmit={submitShipmentRequest}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Sender Name</label>
                                            <input className="form-control" value={shipmentRequestForm.senderName} onChange={(e) => setShipmentRequestForm({ ...shipmentRequestForm, senderName: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Receiver Name</label>
                                            <input className="form-control" value={shipmentRequestForm.receiverName} onChange={(e) => setShipmentRequestForm({ ...shipmentRequestForm, receiverName: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" value={shipmentRequestForm.customerEmail} onChange={(e) => setShipmentRequestForm({ ...shipmentRequestForm, customerEmail: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone Number</label>
                                            <input type="tel" className="form-control" placeholder="Optional" value={shipmentRequestForm.customerPhone} onChange={(e) => setShipmentRequestForm({ ...shipmentRequestForm, customerPhone: e.target.value })} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Weight</label>
                                            <input type="number" className="form-control" value={shipmentRequestForm.packageWeight} onChange={(e) => setShipmentRequestForm({ ...shipmentRequestForm, packageWeight: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6 position-relative">
                                            <label className="form-label">Source</label>
                                            <input
                                                className="form-control"
                                                value={shipmentRequestForm.sourceAddress}
                                                onFocus={() => setActiveLocationField("sourceAddress")}
                                                onBlur={() => setTimeout(() => setActiveLocationField(null), 150)}
                                                onChange={(e) =>
                                                    handleLocationInputChange(
                                                        "sourceAddress",
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="off"
                                                required
                                            />
                                            {renderLocationSuggestions(
                                                "sourceAddress",
                                                sourceSuggestions
                                            )}
                                        </div>
                                        <div className="col-md-6 position-relative">
                                            <label className="form-label">Destination</label>
                                            <input
                                                className="form-control"
                                                value={shipmentRequestForm.destinationAddress}
                                                onFocus={() => setActiveLocationField("destinationAddress")}
                                                onBlur={() => setTimeout(() => setActiveLocationField(null), 150)}
                                                onChange={(e) =>
                                                    handleLocationInputChange(
                                                        "destinationAddress",
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="off"
                                                required
                                            />
                                            {renderLocationSuggestions(
                                                "destinationAddress",
                                                destinationSuggestions
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={closeShipmentRequestModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={shipmentRequestLoading}>
                                        {shipmentRequestLoading ? "Sending..." : "Send Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow border-0 mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
                        <h4 className="mb-0">My Shipment Requests</h4>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchShipmentRequests}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Sender</th>
                                    <th>Receiver</th>
                                    <th>Source</th>
                                    <th>Destination</th>
                                    <th>Status</th>
                                    <th>Shipment ID</th>
                                    <th>Admin Response</th>
                                    <th>Responded At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipmentRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-4">
                                            No shipment requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    shipmentRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{request.id}</td>
                                            <td>{request.senderName}</td>
                                            <td>{request.receiverName}</td>
                                            <td>{request.sourceAddress}</td>
                                            <td>{request.destinationAddress}</td>
                                            <td>
                                                {request.responseSent ? (
                                                    <span
                                                        className={`badge ${request.shipmentCreated ? "bg-success" : "bg-warning text-dark"}`}
                                                    >
                                                        {request.shipmentCreated ? "Created" : "Not Created"}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary">Pending</span>
                                                )}
                                            </td>
                                            <td>{request.createdShipmentId || "--"}</td>
                                            <td style={{ minWidth: "280px", whiteSpace: "pre-line" }}>
                                                {request.responseMessage || "Waiting for admin response."}
                                            </td>
                                            <td>
                                                {request.respondedAt
                                                    ? new Date(request.respondedAt).toLocaleString()
                                                    : "--"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card shadow border-0 mb-4">
                <div className="card-body">
                    <h4 className="mb-3">My Support Tickets</h4>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Tracking No.</th>
                                    <th>Status</th>
                                    <th>Reply</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            No support tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.trackingNumber || "--"}</td>
                                            <td>{ticket.status}</td>
                                            <td>{ticket.responseMessage || "--"}</td>
                                            <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "--"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {}

            <div className="card shadow border-0">

                <div className="card-body">

                    <h4 className="mb-3">
                        Order Status Overview
                    </h4>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={120}
                                label
                            >

                        <Cell fill="#198754" />
                                <Cell fill="#6c757d" />
                                <Cell fill="#0d6efd" />
                                <Cell fill="#fd7e14" />
                                <Cell fill="#ffc107" />
                                <Cell fill="#dc3545" />

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>

            {timelineShipment && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Shipment Timeline — {timelineShipment.trackingNumber}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setTimelineShipment(null)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                {timelineLoading ? (

                                    <div className="text-center py-4">

                                        <div className="spinner-border text-primary" role="status"></div>

                                    </div>

                                ) : (

                                    <ol className="list-unstyled mb-0">

                                        {buildTimeline(timelineShipment, timelineHistory).map((step) => (

                                            <li
                                                key={step.key}
                                                className="d-flex align-items-start mb-3"
                                            >

                                                <span
                                                    className={`badge me-3 ${step.done ? "bg-success" : "bg-secondary"}`}
                                                    style={{ fontSize: "1rem" }}
                                                >
                                                    {step.done ? "\u2714" : "\u2022"}
                                                </span>

                                                <div>

                                                    <div className="fw-semibold">
                                                        {step.label}
                                                    </div>

                                                    <div className="text-muted small">
                                                        {step.done && step.timestamp
                                                            ? formatDateTime(step.timestamp)
                                                            : step.done
                                                                ? "Completed"
                                                                : "Pending"}
                                                    </div>

                                                </div>

                                            </li>

                                        ))}

                                    </ol>

                                )}

                                {timelineShipment.shipmentStatus === "CANCELLED" && (

                                    <div className="alert alert-danger mt-3 mb-0">
                                        This shipment was cancelled.
                                    </div>

                                )}

                                {timelineShipment.shipmentStatus === "DELIVERY_FAILED" && (

                                    <div className="alert alert-danger mt-3 mb-0">
                                        This shipment had a failed delivery attempt.
                                    </div>

                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setTimelineShipment(null)}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {proofShipment && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Proof of Delivery — {proofShipment.trackingNumber}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setProofShipment(null)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                {podLoading ? (

                                    <div className="text-center py-4">

                                        <div className="spinner-border text-primary" role="status"></div>

                                    </div>

                                ) : (

                                <div className="row g-4">

                                    <div className="col-md-6">

                                        <h6>Delivery Details</h6>

                                        <div className="mb-2">
                                            <span className="text-muted">Shipment Status:</span>
                                            <div className="fw-semibold text-success">DELIVERED</div>
                                        </div>

                                        <div className="mb-2">
                                            <span className="text-muted">Receiver Name:</span>
                                            <div className="fw-semibold">
                                                {podData?.receiverName || proofShipment.receiverName || proofShipment.deliveryReceiverName || "--"}
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <span className="text-muted">Delivered By (Driver):</span>
                                            <div className="fw-semibold">
                                                {podData?.driverName || proofShipment.driver?.fullName || proofShipment.deliveryDriverName || "--"}
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <span className="text-muted">Delivered On:</span>
                                            <div className="fw-semibold">
                                                {(podData?.deliveryTime || podDeliveredAt)
                                                    ? new Date(podData?.deliveryTime || podDeliveredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                                    : "--"}
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <span className="text-muted">Time:</span>
                                            <div className="fw-semibold">
                                                {(podData?.deliveryTime || podDeliveredAt)
                                                    ? new Date(podData?.deliveryTime || podDeliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                    : "--"}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="col-md-6">

                                        <h6>Receiver Signature</h6>

                                        {(podData?.signatureData || proofShipment.deliverySignature) ? (
                                            <img
                                                src={podData?.signatureData || proofShipment.deliverySignature}
                                                alt="Receiver signature"
                                                className="border rounded bg-white"
                                                style={{ maxWidth: "100%", maxHeight: "180px" }}
                                            />
                                        ) : (
                                            <p className="text-muted">
                                                No digital signature was captured for this delivery.
                                            </p>
                                        )}

                                        {podData?.deliveryPhoto && (
                                            <div className="mt-3">
                                                <h6>Delivery Photo</h6>
                                                <img
                                                    src={podData.deliveryPhoto}
                                                    alt="Delivery proof"
                                                    className="border rounded"
                                                    style={{ maxWidth: "100%", maxHeight: "180px" }}
                                                />
                                            </div>
                                        )}

                                    </div>

                                </div>

                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() =>
                                        navigate(`/pod/${shipmentIdOf(proofShipment)}`, {
                                            state: {
                                                podData: {
                                                    shipmentId: shipmentIdOf(proofShipment),
                                                    trackingNumber: proofShipment.trackingNumber,
                                                    customerName:
                                                        proofShipment.senderName ||
                                                        proofShipment.createdBy?.fullName ||
                                                        "--",
                                                    receiverName:
                                                        podData?.receiverName ||
                                                        proofShipment.receiverName ||
                                                        proofShipment.deliveryReceiverName ||
                                                        "--",
                                                    driverName:
                                                        podData?.driverName ||
                                                        proofShipment.driver?.fullName ||
                                                        proofShipment.deliveryDriverName ||
                                                        "--",
                                                    deliveryAddress:
                                                        proofShipment.destinationAddress ||
                                                        proofShipment.receiverAddress ||
                                                        "--",
                                                    deliveryTime:
                                                        podData?.deliveryTime || podDeliveredAt || null,
                                                    signatureData:
                                                        podData?.signatureData ||
                                                        proofShipment.deliverySignature ||
                                                        null,
                                                    deliveryPhoto: podData?.deliveryPhoto || null,
                                                    remarks: podData?.remarks || null
                                                }
                                            }
                                        })
                                    }
                                >
                                    View Full POD
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setProofShipment(null)}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {routeShipment && (
                <RouteDetailsModal
                    shipmentId={shipmentIdOf(routeShipment)}
                    trackingNumber={routeShipment.trackingNumber}
                    onClose={() => setRouteShipment(null)}
                />
            )}

            </div>

        </div>
    );
}

export default CustomerDashboard;
