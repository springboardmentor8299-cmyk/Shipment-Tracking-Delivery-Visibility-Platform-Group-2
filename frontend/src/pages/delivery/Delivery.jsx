import { useEffect, useMemo, useState } from "react";
import { getAllShipments } from "../../services/shipmentService";
import "../../styles/Delivery.css";

function Delivery() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeStatus, setActiveStatus] = useState("ALL");

    const loadShipments = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllShipments();
            setShipments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Unable to load delivery data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShipments();
    }, []);

    // Helper to format status strings for CSS class names ("OUT_FOR_DELIVERY" -> "out-for-delivery")
    const getStatusClass = (status) => {
        if (!status) return "";
        return String(status).toLowerCase().trim().replace(/[\s_]+/g, "-");
    };

    // Helper to match backend status codes dynamically
    const matchStatus = (status, target) => {
        if (!status) return false;
        const normalized = String(status).toUpperCase().replace(/[\s_]+/g, "_");
        return normalized === target;
    };

    const groupedShipments = useMemo(() => {
        return {
            created: shipments.filter((s) => matchStatus(s.status, "CREATED")),
            pickedUp: shipments.filter((s) => matchStatus(s.status, "PICKED_UP")),
            inTransit: shipments.filter((s) => matchStatus(s.status, "IN_TRANSIT")),
            outForDelivery: shipments.filter((s) => matchStatus(s.status, "OUT_FOR_DELIVERY")),
            delivered: shipments.filter((s) => matchStatus(s.status, "DELIVERED")),
            pending: shipments.filter((s) => matchStatus(s.status, "PENDING")),
            cancelled: shipments.filter((s) => matchStatus(s.status, "CANCELLED")),
            failed: shipments.filter((s) => matchStatus(s.status, "FAILED_DELIVERY")),
        };
    }, [shipments]);

    const activeList = useMemo(() => {
        if (activeStatus === "ALL") return shipments;
        return shipments.filter((s) => matchStatus(s.status, activeStatus));
    }, [activeStatus, shipments]);

    return (
        <div className="delivery-page">
            <div className="delivery-header">
                <div>
                    <h1>Delivery Dashboard</h1>
                    <p>Track active deliveries and see shipment status grouped by delivery stage.</p>
                </div>
                <button className="refresh-btn" onClick={loadShipments} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh Deliveries"}
                </button>
            </div>

            <div className="delivery-summary-cards">
                <div className="summary-card">
                    <span>Created</span>
                    <strong>{groupedShipments.created.length}</strong>
                </div>
                <div className="summary-card">
                    <span>In Transit</span>
                    <strong>{groupedShipments.inTransit.length}</strong>
                </div>
                <div className="summary-card delivered-card">
                    <span>Delivered</span>
                    <strong>{groupedShipments.delivered.length}</strong>
                </div>
                <div className="summary-card cancelled-card">
                    <span>Cancelled / Failed</span>
                    <strong>{groupedShipments.cancelled.length + groupedShipments.failed.length}</strong>
                </div>
            </div>

            <div className="delivery-filters">
                {[
                    { key: "ALL", label: "All Deliveries" },
                    { key: "CREATED", label: "Created" },
                    { key: "PICKED_UP", label: "Picked Up" },
                    { key: "IN_TRANSIT", label: "In Transit" },
                    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
                    { key: "DELIVERED", label: "Delivered" },
                    { key: "CANCELLED", label: "Cancelled" },
                    { key: "FAILED_DELIVERY", label: "Failed" }
                ].map((filter) => (
                    <button
                        key={filter.key}
                        className={filter.key === activeStatus ? "filter-btn active" : "filter-btn"}
                        onClick={() => setActiveStatus(filter.key)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {error && <div className="delivery-error">{error}</div>}

            <div className="delivery-list">
                {activeList.length === 0 && !loading ? (
                    <div className="delivery-empty">No shipments found for this delivery status.</div>
                ) : (
                    activeList.map((shipment) => (
                        <div className="delivery-card" key={shipment.id || shipment.trackingId}>
                            <div className="delivery-card-header">
                                <div>
                                    <h2>{shipment.trackingId}</h2>
                                    <span>{shipment.customerName}</span>
                                </div>
                                <div className={`status-pill ${getStatusClass(shipment.status)}`}>
                                    {String(shipment.status || "UNKNOWN").replace(/_/g, " ")}
                                </div>
                            </div>
                            <div className="delivery-card-body">
                                <div>
                                    <label>Origin</label>
                                    <p>{shipment.origin || "—"}</p>
                                </div>
                                <div>
                                    <label>Destination</label>
                                    <p>{shipment.destination || "—"}</p>
                                </div>
                                <div>
                                    <label>Shipment Date</label>
                                    <p>{shipment.shipmentDate || "—"}</p>
                                </div>
                                <div>
                                    <label>Delivery Date</label>
                                    <p>{shipment.deliveryDate || "—"}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Delivery;