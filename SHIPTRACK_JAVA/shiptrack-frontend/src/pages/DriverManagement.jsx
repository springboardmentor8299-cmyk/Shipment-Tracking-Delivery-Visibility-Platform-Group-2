import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
    getDrivers,
    getDriverStats,
    addDriver,
    updateDriver,
    setDriverActive,
    deleteDriver,
    getDriverPerformance,
    getDriverShipments,
    getDriverRouteHistory,
    getDriverLocations,
    getDriverNotifications,
    getLiveShipmentStatus,
    getLiveShipmentMonitor,
    assignShipmentDriver
} from "../api/adminDriverApi";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

function LiveDriverMap({ locations }) {

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {

        if (!mapRef.current) {
            return;
        }

        if (!mapInstanceRef.current) {

            mapInstanceRef.current = L.map(mapRef.current).setView(
                [28.6139, 77.209],
                6
            );

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: "&copy; OpenStreetMap contributors"
                }
            ).addTo(mapInstanceRef.current);
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        locations.forEach((location) => {

            const marker = L.marker([
                location.latitude,
                location.longitude
            ]).addTo(mapInstanceRef.current);

            marker.bindPopup(
                `<strong>${location.driverName}</strong><br/>Driver ID: ${location.driverId}`
            );

            markersRef.current.push(marker);
        });

        if (locations.length > 0) {

            const bounds = locations.map(
                (location) => [location.latitude, location.longitude]
            );

            mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
        }

    }, [locations]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "460px",
                borderRadius: "8px"
            }}
        />
    );
}

const TRUCK_ICON_HTML = '<span style="font-size:28px;line-height:28px;">🚚</span>';

function LiveShipmentTrackingMap({ monitor }) {

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef = useRef([]);

    const driverLat = monitor?.driverLatitude;
    const driverLng = monitor?.driverLongitude;
    const destLat = monitor?.destinationLatitude;
    const destLng = monitor?.destinationLongitude;
    const reached = monitor?.shipmentStatus === "DELIVERED";

    useEffect(() => {

        if (!mapRef.current) {
            return;
        }

        if (!mapInstanceRef.current) {

            mapInstanceRef.current = L.map(mapRef.current).setView(
                destLat ? [destLat, destLng] : [28.6139, 77.209],
                8
            );

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: "&copy; OpenStreetMap contributors"
                }
            ).addTo(mapInstanceRef.current);
        }

        layersRef.current.forEach((layer) => layer.remove());
        layersRef.current = [];

        const driverPos = driverLat ? [driverLat, driverLng] : null;
        const destPos = destLat ? [destLat, destLng] : null;

        if (driverPos && destPos) {

            const routeLine = L.polyline([driverPos, destPos], {
                color: "#0d6efd",
                weight: 3,
                dashArray: "8 6",
                opacity: 0.7
            }).addTo(mapInstanceRef.current);

            layersRef.current.push(routeLine);
        }

        if (driverPos) {

            const truckIcon = L.divIcon({
                className: "truck-marker",
                html: TRUCK_ICON_HTML,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker(driverPos, { icon: truckIcon, zIndexOffset: 1000 })
                .addTo(mapInstanceRef.current)
                .bindPopup(
                    monitor?.driverName
                        ? `<strong>${monitor.driverName}</strong><br/>${reached ? "Destination reached" : "Live position"}`
                        : "Driver live position"
                );

            layersRef.current.push(marker);
        }

        if (destPos) {

            const marker = L.marker(destPos)
                .addTo(mapInstanceRef.current)
                .bindPopup("Destination");

            layersRef.current.push(marker);
        }

        const bounds = [driverPos, destPos].filter(Boolean);

        if (bounds.length > 0) {

            mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });

        } else if (driverPos || destPos) {

            mapInstanceRef.current.setView(driverPos || destPos, 10);
        }

    }, [driverLat, driverLng, destLat, destLng, reached, monitor?.driverName]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "460px",
                borderRadius: "8px"
            }}
        />
    );
}

function DriverManagement() {

    const [activeTab, setActiveTab] = useState("overview");

    const [drivers, setDrivers] = useState([]);
    const [stats, setStats] = useState({
        totalDrivers: 0,
        activeDrivers: 0,
        inactiveDrivers: 0,
        busyDrivers: 0,
        availableDrivers: 0,
        onlineDrivers: 0,
        offlineDrivers: 0
    });

    const [locations, setLocations] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [liveShipments, setLiveShipments] = useState([]);
    const [liveShipmentsLoading, setLiveShipmentsLoading] = useState(false);
    const [selectedLiveShipmentId, setSelectedLiveShipmentId] = useState("");
    const [liveMonitor, setLiveMonitor] = useState(null);
    const [monitorLoading, setMonitorLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [viewLoading, setViewLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        vehicleType: "",
        vehicleNumber: ""
    });

    const [selectedDriver, setSelectedDriver] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [driverShipments, setDriverShipments] = useState([]);
    const [routeHistory, setRouteHistory] = useState([]);

    const [assignDriverId, setAssignDriverId] = useState("");

    const [formSaving, setFormSaving] = useState(false);

    const fetchDrivers = useCallback(async () => {

        try {

            setLoading(true);

            const response = await getDrivers(search);

            setDrivers(response.data || []);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load drivers."
            );

        } finally {

            setLoading(false);

        }
    }, [search]);

    const fetchStats = useCallback(async () => {

        try {

            const response = await getDriverStats();

            setStats((prev) => ({
                ...prev,
                ...(response.data || {})
            }));

        } catch (error) {

            console.error(error);

        }
    }, []);

    const fetchShipments = useCallback(async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/shipments",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setShipments(response.data || []);

        } catch (error) {

            console.error(error);

            toast.error("Failed to load shipments.");
        }
    }, []);

    const fetchNotifications = useCallback(async () => {

        try {

            const response = await getDriverNotifications();

            setNotifications(response.data || []);

        } catch (error) {

            console.error(error);

        }
    }, []);

    const fetchLocations = useCallback(async () => {

        try {

            const response = await getDriverLocations();

            setLocations(response.data || []);

        } catch (error) {

            console.error(error);

        }
    }, []);

    const fetchLiveShipments = useCallback(async () => {

        try {

            setLiveShipmentsLoading(true);

            const response = await getLiveShipmentStatus();

            setLiveShipments(response.data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLiveShipmentsLoading(false);

        }
    }, []);

    const fetchLiveMonitor = useCallback(async (shipmentId) => {

        if (!shipmentId) {
            return;
        }

        try {

            setMonitorLoading(true);

            const response = await getLiveShipmentMonitor(shipmentId);

            setLiveMonitor(response.data || null);

        } catch (error) {

            console.error(error);

            setLiveMonitor(null);

        } finally {

            setMonitorLoading(false);

        }
    }, []);

    const handleSelectLiveShipment = (event) => {

        const shipmentId = event.target.value;

        setSelectedLiveShipmentId(shipmentId);

        if (shipmentId) {
            fetchLiveMonitor(shipmentId);
        } else {
            setLiveMonitor(null);
        }
    };

    useEffect(() => {
        
        fetchDrivers();
    }, [fetchDrivers]);

    useEffect(() => {
        
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        
        fetchShipments();
    }, [fetchShipments]);

    useEffect(() => {
        
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {

        let intervalId;

        const poll = async () => {

            try {

                const response = await getDriverLocations();

                setLocations(response.data || []);

            } catch (error) {

                console.error(error);
            }

            try {

                const liveResponse = await getLiveShipmentStatus();

                setLiveShipments(liveResponse.data || []);

            } catch (error) {

                console.error(error);
            }
        };

        poll();

        intervalId = setInterval(poll, 10000);

        return () => clearInterval(intervalId);

    }, []);

    useEffect(() => {

        if (!selectedLiveShipmentId) {
            return undefined;
        }

        fetchLiveMonitor(selectedLiveShipmentId);

        const intervalId = setInterval(() => {
            fetchLiveMonitor(selectedLiveShipmentId);
        }, 10000);

        return () => clearInterval(intervalId);

    }, [selectedLiveShipmentId, fetchLiveMonitor]);

    const assignedShipments = useMemo(() => {

        return shipments.filter((shipment) => shipment.driver !== null);

    }, [shipments]);

    const filteredDrivers = useMemo(() => {

        return drivers.filter((driver) => {

            const matchesStatus =
                statusFilter === "ALL" ||
                driver.status === statusFilter;

            return matchesStatus;
        });

    }, [drivers, statusFilter]);

    const unassignedShipments = useMemo(() => {

        return shipments.filter((shipment) => shipment.driver === null);
    }, [shipments]);

    const activeDrivers = useMemo(() => {

        return drivers.filter(
            (driver) => driver.isActive
        );
    }, [drivers]);

    const openAddForm = () => {

        setEditingDriver(null);

        setForm({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            vehicleType: "",
            vehicleNumber: ""
        });

        setShowForm(true);
    };

    const openEditForm = (driver) => {

        setEditingDriver(driver);

        setForm({
            fullName: driver.fullName || "",
            email: driver.email || "",
            phone: driver.phone || "",
            password: "",
            vehicleType: driver.vehicleType || "",
            vehicleNumber: driver.vehicleNumber || ""
        });

        setShowForm(true);
    };

    const handleFormChange = (event) => {

        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {

        if (!form.fullName.trim() || !form.email.trim()) {

            toast.error("Name and email are required.");

            return;
        }

        if (!editingDriver && !form.password.trim()) {

            toast.error("A password is required for a new driver.");

            return;
        }

        setFormSaving(true);

        try {

            if (editingDriver) {

                await updateDriver(editingDriver.driverId, {
                    fullName: form.fullName,
                    phone: form.phone,
                    vehicleType: form.vehicleType,
                    vehicleNumber: form.vehicleNumber,
                    isActive: editingDriver.isActive
                });

                toast.success("Driver updated successfully.");

            } else {

                await addDriver({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                    vehicleType: form.vehicleType,
                    vehicleNumber: form.vehicleNumber
                });

                toast.success("Driver added successfully.");
            }

            setShowForm(false);

            fetchDrivers();

            fetchStats();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save driver."
            );

        } finally {

            setFormSaving(false);
        }
    };

    const handleToggleActive = async (driver) => {

        try {

            await setDriverActive(
                driver.driverId,
                !driver.isActive
            );

            toast.success(
                driver.isActive
                    ? "Driver deactivated."
                    : "Driver activated."
            );

            fetchDrivers();

            fetchStats();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update driver status."
            );
        }
    };

    const handleDelete = async (driver) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${driver.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteDriver(driver.driverId);

            toast.success("Driver deleted successfully.");

            fetchDrivers();

            fetchStats();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete driver."
            );
        }
    };

    const handleView = async (driver) => {

        setSelectedDriver(driver);

        setPerformance(null);

        setDriverShipments([]);

        setRouteHistory([]);

        setViewLoading(true);

        try {

            const [perfRes, shipRes, routeRes] = await Promise.all([
                getDriverPerformance(driver.driverId),
                getDriverShipments(driver.driverId),
                getDriverRouteHistory(driver.driverId)
            ]);

            setPerformance(perfRes.data || null);

            setDriverShipments(shipRes.data || []);

            setRouteHistory(routeRes.data || []);

        } catch (error) {

            console.error(error);

            toast.error("Failed to load driver details.");

        } finally {

            setViewLoading(false);
        }
    };

    const handleAssign = async (shipmentId) => {

        if (!assignDriverId) {

            toast.error("Select a driver first.");

            return;
        }

        try {

            await assignShipmentDriver(
                shipmentId,
                Number(assignDriverId)
            );

            toast.success("Shipment assigned to driver.");

            fetchShipments();

            fetchDrivers();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to assign shipment."
            );
        }
    };

    const getStatusBadge = (status) => {

        switch (status) {

            case "Available":
                return "bg-success";

            case "Busy":
                return "bg-warning text-dark";

            case "Out for Delivery":
                return "bg-primary";

            case "In Transit":
                return "bg-info";

            case "Picked Up":
                return "bg-secondary";

            case "Offline":
                return "bg-dark";

            case "Inactive":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    const getShipmentStatusBadge = (status) => {

        switch (status) {

            case "DELIVERED":
                return "bg-success";

            case "DELIVERY_FAILED":
                return "bg-danger";

            case "CANCELLED":
                return "bg-secondary";

            case "OUT_FOR_DELIVERY":
                return "bg-primary";

            case "IN_TRANSIT":
            case "PICKED_UP":
                return "bg-info";

            default:
                return "bg-warning text-dark";
        }
    };

    const formatDateTime = (value) => {

        if (!value) {
            return "--";
        }

        return new Date(value).toLocaleString();
    };

    const tabs = [
        { key: "overview", label: "Overview", icon: "bi-speedometer2" },
        { key: "drivers", label: "Drivers", icon: "bi-truck" },
        { key: "map", label: "Live Tracking", icon: "bi-geo-alt-fill" },
        { key: "assignments", label: "Assignments", icon: "bi-diagram-3-fill" },
        { key: "notifications", label: "Notifications", icon: "bi-bell-fill" }
    ];

    const statCards = [
        {
            label: "Total Drivers",
            value: stats.totalDrivers,
            icon: "bi-truck-front-fill",
            color: "primary"
        },
        {
            label: "Active Drivers",
            value: stats.activeDrivers,
            icon: "bi-person-check-fill",
            color: "success"
        },
        {
            label: "Available",
            value: stats.availableDrivers,
            icon: "bi-person-standing",
            color: "info"
        },
        {
            label: "Busy",
            value: stats.busyDrivers,
            icon: "bi-lightning-charge-fill",
            color: "warning"
        },
        {
            label: "Online",
            value: stats.onlineDrivers,
            icon: "bi-wifi",
            color: "primary"
        },
        {
            label: "Offline",
            value: stats.offlineDrivers,
            icon: "bi-wifi-off",
            color: "dark"
        },
        {
            label: "Inactive",
            value: stats.inactiveDrivers,
            icon: "bi-person-x-fill",
            color: "danger"
        }
    ];

    return (
        <div className="container-fluid px-4 mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

                <div>

                    <h2 className="fw-bold mb-1">
                        Driver Management
                    </h2>

                    <p className="text-muted">
                        Overview, manage, assign and track drivers.
                    </p>

                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Driver
                </button>

            </div>

            <ul className="nav nav-tabs mb-4">

                {tabs.map((tab) => (

                    <li className="nav-item" key={tab.key}>

                        <button
                            type="button"
                            className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <i className={`bi ${tab.icon} me-1`}></i>
                            {tab.label}
                        </button>

                    </li>

                ))}

            </ul>

            {activeTab === "overview" && (

                <div>

                    <div className="row g-4 mb-4">

                        {statCards.map((card) => (

                            <div className="col-xl-3 col-md-4 col-sm-6" key={card.label}>

                                <div className="card shadow border-0 h-100">

                                    <div className="card-body d-flex align-items-center">

                                        <div className={`bg-${card.color}-subtle rounded-circle p-3 me-3`}>

                                            <i className={`bi ${card.icon} text-${card.color} fs-3`}></i>

                                        </div>

                                        <div>

                                            <h6 className="text-muted mb-1">
                                                {card.label}
                                            </h6>

                                            <h3 className="fw-bold mb-0">
                                                {card.value}
                                            </h3>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {activeTab === "drivers" && (

                <div>

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <div className="row g-3">

                                <div className="col-lg-8">

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by Name, Email, Phone, Vehicle"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />

                                </div>

                                <div className="col-lg-4">

                                    <select
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >

                                        <option value="ALL">
                                            All Statuses
                                        </option>

                                        <option value="Available">Available</option>

                                        <option value="Busy">Busy</option>

                                        <option value="Out for Delivery">Out for Delivery</option>

                                        <option value="In Transit">In Transit</option>

                                        <option value="Picked Up">Picked Up</option>

                                        <option value="Offline">Offline</option>

                                        <option value="Inactive">Inactive</option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>

                    {loading ? (

                        <div className="text-center py-5">

                            <div className="spinner-border text-primary" role="status"></div>

                            <p className="mt-3">Loading Drivers...</p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover table-bordered align-middle">

                                <thead className="table-dark">

                                    <tr>

                                        <th>ID</th>

                                        <th>Name</th>

                                        <th>Email</th>

                                        <th>Phone</th>

                                        <th>Vehicle</th>

                                        <th>Status</th>

                                        <th>Active</th>

                                        <th>Active Shipments</th>

                                        <th>Deliveries</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredDrivers.length === 0 ? (

                                        <tr>

                                            <td colSpan={10} className="text-center py-5">
                                                No Drivers Found
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredDrivers.map((driver) => (

                                            <tr key={driver.driverId}>

                                                <td>{driver.driverId}</td>

                                                <td className="fw-semibold">{driver.fullName}</td>

                                                <td>{driver.email}</td>

                                                <td>{driver.phone || "--"}</td>

                                                <td>
                                                    {driver.vehicleType
                                                        ? `${driver.vehicleType}${driver.vehicleNumber ? ` - ${driver.vehicleNumber}` : ""}`
                                                        : "--"}
                                                </td>

                                                <td>

                                                    <span className={`badge ${getStatusBadge(driver.status)}`}>
                                                        {driver.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className={`badge ${driver.isActive ? "bg-success" : "bg-danger"}`}>
                                                        {driver.isActive ? "Active" : "Inactive"}
                                                    </span>

                                                </td>

                                                <td>{driver.activeShipments}</td>

                                                <td>{driver.completedDeliveries}</td>

                                                <td>

                                                    <div className="d-flex gap-1 flex-wrap">

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => handleView(driver)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => openEditForm(driver)}
                                                        >
                                                            <i className="bi bi-pencil me-1"></i>
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`btn ${driver.isActive ? "btn-outline-warning" : "btn-outline-success"} btn-sm`}
                                                            onClick={() => handleToggleActive(driver)}
                                                        >
                                                            {driver.isActive ? "Deactivate" : "Activate"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDelete(driver)}
                                                        >
                                                            <i className="bi bi-trash me-1"></i>
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}

            {activeTab === "map" && (

                <div>

                    <div className="card shadow border-0 mb-4">

                        <div className="card-header bg-white d-flex justify-content-between align-items-center">

                            <h5 className="mb-0">
                                Live Driver Tracking
                            </h5>

                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                    fetchLocations();
                                    fetchLiveShipments();
                                    if (selectedLiveShipmentId) {
                                        fetchLiveMonitor(selectedLiveShipmentId);
                                    }
                                }}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Refresh
                            </button>

                        </div>

                        <div className="card-body">

                            <div className="row g-3 mb-3">

                                <div className="col-lg-6">

                                    <label className="form-label fw-semibold">
                                        Select Assigned Shipment
                                    </label>

                                    <select
                                        className="form-select"
                                        value={selectedLiveShipmentId}
                                        onChange={handleSelectLiveShipment}
                                    >

                                        <option value="">
                                            Choose a shipment to track...
                                        </option>

                                        {assignedShipments.map((shipment) => (

                                            <option key={shipment.id} value={shipment.id}>
                                                #{shipment.trackingNumber} — {shipment.receiverName || "N/A"} ({shipment.driver?.fullName || "Driver"})
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div className="col-lg-6 d-flex align-items-end">

                                    <p className="text-muted mb-0">
                                        Positions update automatically every 10 seconds.
                                    </p>

                                </div>

                            </div>

                            {selectedLiveShipmentId ? (

                                <div>

                                    {monitorLoading && liveMonitor === null ? (

                                        <div className="text-center py-5">

                                            <div className="spinner-border text-primary" role="status"></div>

                                            <p className="mt-3 text-muted">
                                                Loading live tracking...
                                            </p>

                                        </div>

                                    ) : liveMonitor ? (

                                        <div className="row g-3">

                                            <div className="col-lg-4">

                                                <div className="card h-100 shadow-sm border-0 bg-light">

                                                    <div className="card-body">

                                                        <h6 className="fw-bold mb-3">
                                                            #{liveMonitor.trackingNumber || "—"}
                                                        </h6>

                                                        <ul className="list-unstyled mb-3 small">

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Status</span>
                                                                <span className={`badge ${getShipmentStatusBadge(liveMonitor.shipmentStatus)}`}>
                                                                    {String(liveMonitor.shipmentStatus || "—").replace(/_/g, " ")}
                                                                </span>
                                                            </li>

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Driver</span>
                                                                <span className="fw-semibold">
                                                                    {liveMonitor.driverName || "No Driver Assigned Yet"}
                                                                </span>
                                                            </li>

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Destination</span>
                                                                <span className="fw-semibold text-end">
                                                                    {liveMonitor.destinationAddress || "—"}
                                                                </span>
                                                            </li>

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">ETA</span>
                                                                <span className="fw-semibold">
                                                                    {liveMonitor.etaLabel || "—"}
                                                                </span>
                                                            </li>

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Distance</span>
                                                                <span className="fw-semibold">
                                                                    {liveMonitor.distanceKm > 0 ? liveMonitor.distanceKm.toFixed(1) + " km" : "—"}
                                                                </span>
                                                            </li>

                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Speed</span>
                                                                <span className="fw-semibold">
                                                                    {liveMonitor.estimatedSpeedKmh > 0 ? liveMonitor.estimatedSpeedKmh.toFixed(0) + " km/h" : "—"}
                                                                </span>
                                                            </li>

                                                        </ul>

                                                        <p className="text-muted small mb-0">
                                                            {liveMonitor.deliveryForecast || "—"}
                                                        </p>

                                                        {liveMonitor.googleMapsUrl && (
                                                            <a
                                                                href={liveMonitor.googleMapsUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn btn-outline-primary btn-sm mt-3 w-100"
                                                            >
                                                                <i className="bi bi-map me-1"></i>
                                                                Open in Google Maps
                                                            </a>
                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-lg-8">

                                                <LiveShipmentTrackingMap monitor={liveMonitor} />

                                            </div>

                                        </div>

                                    ) : (

                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-truck fs-1 d-block mb-2"></i>
                                            Could not load live tracking for this shipment.
                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div>

                                    <p className="text-muted mb-3">
                                        All driver live positions.
                                    </p>

                                    <LiveDriverMap locations={locations} />

                                </div>

                            )}

                        </div>

                    </div>

                    <div className="card shadow border-0">

                        <div className="card-header bg-white d-flex justify-content-between align-items-center">

                            <h5 className="mb-0">
                                Live Shipment Status
                            </h5>

                            {liveShipmentsLoading && (
                                <span className="text-muted small">
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Updating...
                                </span>
                            )}

                        </div>

                        <div className="card-body">

                            <p className="text-muted mb-3">
                                Live status of all shipments created by every customer, refreshing automatically every 10 seconds.
                            </p>

                            <div className="table-responsive">

                                <table className="table table-hover align-middle">

                                    <thead className="table-light">

                                        <tr>
                                            <th>Tracking Number</th>
                                            <th>Customer</th>
                                            <th>Status</th>
                                            <th>Driver</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {liveShipments.length === 0 ? (

                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-4">
                                                    No shipments found.
                                                </td>
                                            </tr>

                                        ) : (

                                            liveShipments.map((shipment) => (

                                                <tr key={shipment.shipmentId}>

                                                    <td className="fw-semibold">
                                                        {shipment.trackingNumber}
                                                    </td>

                                                    <td>
                                                        {shipment.senderName || shipment.createdBy || "—"}
                                                    </td>

                                                    <td>
                                                        <span className={`badge ${getShipmentStatusBadge(shipment.shipmentStatus)}`}>
                                                            {String(shipment.shipmentStatus).replace(/_/g, " ")}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {shipment.driverName ? (
                                                            <span className="badge bg-success">
                                                                {shipment.driverName}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark">
                                                                No Driver Assigned Yet
                                                            </span>
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

                </div>

            )}

            {activeTab === "assignments" && (

                <div>

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <label className="form-label fw-semibold">
                                Select Driver to Assign Shipments
                            </label>

                            <select
                                className="form-select"
                                value={assignDriverId}
                                onChange={(e) => setAssignDriverId(e.target.value)}
                            >

                                <option value="">
                                    Choose a driver...
                                </option>

                                {activeDrivers.map((driver) => (

                                    <option key={driver.driverId} value={driver.driverId}>
                                        {driver.fullName} ({driver.vehicleType || "No vehicle"})
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>

                    <div className="card shadow border-0">

                        <div className="card-header bg-white">

                            <h5 className="mb-0">
                                Unassigned Shipments
                            </h5>

                        </div>

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-dark">

                                    <tr>

                                        <th>ID</th>

                                        <th>Tracking No.</th>

                                        <th>Receiver</th>

                                        <th>Destination</th>

                                        <th>Status</th>

                                        <th>Action</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {unassignedShipments.length === 0 ? (

                                        <tr>

                                            <td colSpan={6} className="text-center py-4">
                                                No unassigned shipments.
                                            </td>

                                        </tr>

                                    ) : (

                                        unassignedShipments.map((shipment) => (

                                            <tr key={shipment.id}>

                                                <td>{shipment.id}</td>

                                                <td className="fw-semibold">{shipment.trackingNumber}</td>

                                                <td>{shipment.receiverName}</td>

                                                <td>{shipment.destinationAddress || "--"}</td>

                                                <td>

                                                    <span className={`badge ${getShipmentStatusBadge(shipment.shipmentStatus)}`}>
                                                        {shipment.shipmentStatus}
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleAssign(shipment.id)}
                                                    >
                                                        <i className="bi bi-send me-1"></i>
                                                        Assign
                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

            {activeTab === "notifications" && (

                <div className="card shadow border-0">

                    <div className="card-header bg-white d-flex justify-content-between align-items-center">

                        <h5 className="mb-0">
                            Recent Driver Notifications
                        </h5>

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchNotifications}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>

                    </div>

                    <div className="card-body">

                        {notifications.length === 0 ? (

                            <p className="text-muted mb-0">
                                No driver notifications yet.
                            </p>

                        ) : (

                            <div className="list-group">

                                {notifications.map((notification) => (

                                    <div className="list-group-item" key={notification.id}>

                                        <div className="d-flex justify-content-between align-items-start gap-2">

                                            <div>

                                                <strong>{notification.title}</strong>

                                                <p className="mb-1">
                                                    {notification.message}
                                                </p>

                                                <small className="text-muted">
                                                    {formatDateTime(notification.createdAt)}
                                                </small>

                                            </div>

                                            <span className={`badge ${notification.read ? "bg-secondary" : "bg-danger"}`}>
                                                {notification.read ? "Read" : "Unread"}
                                            </span>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            )}

            {showForm && (

                <div className="modal fade show d-block" tabIndex={-1} role="dialog">

                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    {editingDriver ? "Edit Driver" : "Add Driver"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowForm(false)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                <div className="row g-3">

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Full Name *
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleFormChange}
                                        />

                                    </div>

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Email *
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={form.email}
                                            disabled={Boolean(editingDriver)}
                                            onChange={handleFormChange}
                                        />

                                    </div>

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Phone
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleFormChange}
                                        />

                                    </div>

                                    {!editingDriver && (

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Password *
                                            </label>

                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                value={form.password}
                                                onChange={handleFormChange}
                                            />

                                        </div>

                                    )}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Vehicle Type
                                        </label>

                                        <select
                                            className="form-select"
                                            name="vehicleType"
                                            value={form.vehicleType}
                                            onChange={handleFormChange}
                                        >

                                            <option value="">None</option>

                                            <option value="Van">Van</option>

                                            <option value="Truck">Truck</option>

                                            <option value="Motorcycle">Motorcycle</option>

                                            <option value="Car">Car</option>

                                            <option value="Bicycle">Bicycle</option>

                                            <option value="Other">Other</option>

                                        </select>

                                    </div>

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Vehicle Number
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="vehicleNumber"
                                            value={form.vehicleNumber}
                                            onChange={handleFormChange}
                                        />

                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={formSaving}
                                    onClick={handleSave}
                                >
                                    {formSaving ? "Saving..." : "Save Driver"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {showForm && <div className="modal-backdrop fade show"></div>}

            {selectedDriver && (

                <div className="modal fade show d-block" tabIndex={-1} role="dialog">

                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Driver Details - {selectedDriver.fullName}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedDriver(null)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                <div className="row g-3 mb-4">

                                    <div className="col-md-3">

                                        <strong>Email</strong>

                                        <p className="mb-0">{selectedDriver.email}</p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Phone</strong>

                                        <p className="mb-0">{selectedDriver.phone || "--"}</p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Vehicle</strong>

                                        <p className="mb-0">
                                            {selectedDriver.vehicleType
                                                ? `${selectedDriver.vehicleType}${selectedDriver.vehicleNumber ? ` - ${selectedDriver.vehicleNumber}` : ""}`
                                                : "--"}
                                        </p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Status</strong>

                                        <p className="mb-0">
                                            <span className={`badge ${getStatusBadge(selectedDriver.status)}`}>
                                                {selectedDriver.status}
                                            </span>
                                        </p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Last Location Update</strong>

                                        <p className="mb-0">
                                            {formatDateTime(selectedDriver.lastLocationUpdate)}
                                        </p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Coordinates</strong>

                                        <p className="mb-0">
                                            {selectedDriver.latitude != null
                                                ? `${selectedDriver.latitude}, ${selectedDriver.longitude}`
                                                : "--"}
                                        </p>

                                    </div>

                                    <div className="col-md-3">

                                        <strong>Member Since</strong>

                                        <p className="mb-0">
                                            {formatDateTime(selectedDriver.createdAt)}
                                        </p>

                                    </div>

                                </div>

                                {viewLoading ? (

                                    <div className="text-center py-4">

                                        <div className="spinner-border text-primary" role="status"></div>

                                    </div>

                                ) : (

                                    <>

                                        {performance && (

                                            <div className="row g-3 mb-4">

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Total Shipments</h6>

                                                            <h3 className="fw-bold">{performance.totalShipments}</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Completed</h6>

                                                            <h3 className="fw-bold text-success">{performance.completedDeliveries}</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Failed</h6>

                                                            <h3 className="fw-bold text-danger">{performance.failedDeliveries}</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Completed Today</h6>

                                                            <h3 className="fw-bold">{performance.completedToday}</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">On-Time Rate</h6>

                                                            <h3 className="fw-bold">{performance.onTimeRate}%</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Avg Delivery</h6>

                                                            <h3 className="fw-bold">{performance.avgDeliveryMinutes} min</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">Distance Covered</h6>

                                                            <h3 className="fw-bold">{performance.totalDistanceKm} km</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-3">

                                                    <div className="card bg-light border-0">

                                                        <div className="card-body text-center">

                                                            <h6 className="text-muted">In Progress</h6>

                                                            <h3 className="fw-bold">{performance.inProgress}</h3>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                        <h6 className="fw-bold mb-2">
                                            Assigned / Historical Shipments
                                        </h6>

                                        <div className="table-responsive mb-4">

                                            <table className="table table-sm table-hover align-middle">

                                                <thead className="table-dark">

                                                    <tr>

                                                        <th>ID</th>

                                                        <th>Tracking No.</th>

                                                        <th>Receiver</th>

                                                        <th>Destination</th>

                                                        <th>Status</th>

                                                        <th>ETA</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {driverShipments.length === 0 ? (

                                                        <tr>

                                                            <td colSpan={6} className="text-center py-3">
                                                                No shipments for this driver.
                                                            </td>

                                                        </tr>

                                                    ) : (

                                                        driverShipments.map((shipment) => (

                                                            <tr key={shipment.shipmentId}>

                                                                <td>{shipment.shipmentId}</td>

                                                                <td className="fw-semibold">{shipment.trackingNumber}</td>

                                                                <td>{shipment.receiverName}</td>

                                                                <td>{shipment.destinationAddress || "--"}</td>

                                                                <td>

                                                                    <span className={`badge ${getShipmentStatusBadge(shipment.shipmentStatus)}`}>
                                                                        {shipment.shipmentStatus}
                                                                    </span>

                                                                </td>

                                                                <td>{formatDateTime(shipment.estimatedDeliveryAt)}</td>

                                                            </tr>

                                                        ))

                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                        <h6 className="fw-bold mb-2">
                                            Route History (Delivered)
                                        </h6>

                                        <div className="table-responsive">

                                            <table className="table table-sm table-hover align-middle">

                                                <thead className="table-dark">

                                                    <tr>

                                                        <th>Tracking No.</th>

                                                        <th>From</th>

                                                        <th>To</th>

                                                        <th>Received By</th>

                                                        <th>Distance</th>

                                                        <th>Travel Time</th>

                                                        <th>Delivered At</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {routeHistory.length === 0 ? (

                                                        <tr>

                                                            <td colSpan={7} className="text-center py-3">
                                                                No completed deliveries yet.
                                                            </td>

                                                        </tr>

                                                    ) : (

                                                        routeHistory.map((route) => (

                                                            <tr key={route.shipmentId}>

                                                                <td className="fw-semibold">{route.trackingNumber}</td>

                                                                <td>{route.sourceAddress || "--"}</td>

                                                                <td>{route.destinationAddress || "--"}</td>

                                                                <td>{route.receiverName || "--"}</td>

                                                                <td>
                                                                    {route.travelDistanceKm != null
                                                                        ? `${route.travelDistanceKm} km`
                                                                        : "--"}
                                                                </td>

                                                                <td>
                                                                    {route.travelTimeMinutes != null
                                                                        ? `${route.travelTimeMinutes} min`
                                                                        : "--"}
                                                                </td>

                                                                <td>{formatDateTime(route.deliveredAt)}</td>

                                                            </tr>

                                                        ))

                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </>

                                )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedDriver(null)}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {selectedDriver && <div className="modal-backdrop fade show"></div>}

        </div>
    );
}

export default DriverManagement;
