import { useEffect, useState } from "react";
import { fetchAllShipments, updateStatus } from "../../services/shipmentService";
import { getStatusLabel, getStatusBadgeClass, getPodStatusLabel, getPodStatusBadgeClass } from "../../utils/constants";

const FILTERS = [
    { value: "ALL", label: "All Statuses" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
];

function DeliveriesTable({ refreshKey, onCapturePod, onViewPod }) {

    const [shipments, setShipments] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadShipments = async () => {
        try {
            const data = await fetchAllShipments();
            setShipments(data);
        } catch {
            setError("Could not load shipments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadShipments();
    }, [refreshKey]);

    const handleMarkOutForDelivery = async (shipment) => {
        setUpdatingId(shipment.id);
        setError("");
        try {
            const updated = await updateStatus(shipment.id, {
                status: "OUT_FOR_DELIVERY",
                latitude: shipment.latestLatitude ?? shipment.originLatitude,
                longitude: shipment.latestLongitude ?? shipment.originLongitude,
            });
            setShipments((prev) =>
                prev.map((s) => (s.id === shipment.id ? updated : s))
            );
        } catch (err) {
            setError(err.response?.data?.message || "Could not update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === "ALL" ? shipments : shipments.filter((s) => s.status === filter);

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">My Deliveries</h4>
                <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    {FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p className="text-muted">Loading shipments...</p>}
            {!loading && !error && filtered.length === 0 && <p className="text-muted mb-0">No shipments match this filter.</p>}

            {!loading && !error && filtered.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Tracking ID</th>
                                <th>Sender Name</th>
                                <th>Receiver Name</th>
                                <th>Delivery Address</th>
                                <th>Status</th>
                                <th>POD</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((shipment) => (
                                <tr key={shipment.id}>
                                    <td>{shipment.trackingNumber}</td>
                                    <td>{shipment.senderName}</td>
                                    <td>{shipment.receiverName}</td>
                                    <td>{shipment.deliveryAddress || "-"}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(shipment.status)}`}>
                                            {getStatusLabel(shipment.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {shipment.podVerificationStatus ? (
                                            <span className={`badge ${getPodStatusBadgeClass(shipment.podVerificationStatus)}`}>
                                                {getPodStatusLabel(shipment.podVerificationStatus)}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>{shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : "-"}</td>
                                    <td>
                                        {shipment.status === "OUT_FOR_DELIVERY" && !shipment.podVerificationStatus && (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => onCapturePod && onCapturePod(shipment)}
                                                title="Capture signature & proof of delivery"
                                            >
                                                <i className="bi bi-signature me-1"></i>Deliver
                                            </button>
                                        )}
                                        {shipment.status === "OUT_FOR_DELIVERY" && shipment.podVerificationStatus && shipment.podVerificationStatus !== "VERIFIED" && (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => onCapturePod && onCapturePod(shipment)}
                                                title="A previous proof of delivery exists and will be replaced"
                                            >
                                                <i className="bi bi-signature me-1"></i>Re-capture
                                            </button>
                                        )}
                                        {shipment.status === "OUT_FOR_DELIVERY" && shipment.podVerificationStatus === "VERIFIED" && (
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onViewPod && onViewPod(shipment)}
                                                title="View proof of delivery"
                                            >
                                                <i className="bi bi-clipboard-check me-1"></i>View POD
                                            </button>
                                        )}
                                        {shipment.status === "DELIVERED" && (
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onViewPod && onViewPod(shipment)}
                                                title="View proof of delivery"
                                            >
                                                <i className="bi bi-clipboard-check me-1"></i>View POD
                                            </button>
                                        )}
                                        {["CREATED", "PICKED_UP", "AT_SORTING_FACILITY", "IN_TRANSIT"].includes(shipment.status) && (
                                            <button
                                                className="btn btn-sm btn-outline-warning"
                                                disabled={updatingId === shipment.id}
                                                onClick={() => handleMarkOutForDelivery(shipment)}
                                                title="Mark shipment out for delivery"
                                            >
                                                {updatingId === shipment.id ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-geo-alt me-1"></i>Mark Out for Delivery
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DeliveriesTable;
