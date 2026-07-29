import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllShipments, updateStatus, removeShipment } from "../../services/shipmentService";
import { getStatusLabel, getStatusBadgeClass, ALL_STATUSES } from "../../utils/constants";
import CreateShipmentForm from "../shared/CreateShipmentForm";

function RecentShipments({ onDataChanged, isSupport, onViewDetails, onEdit }) {

    const navigate = useNavigate();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
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
        loadShipments();
    }, []);

    const handleCreated = (shipment) => {
        setShipments((prev) => [shipment, ...prev]);
        setShowForm(false);
        if (onDataChanged) onDataChanged();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this shipment?")) return;
        try {
            await removeShipment(id);
            setShipments((prev) => prev.filter((s) => s.id !== id));
            if (onDataChanged) onDataChanged();
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete shipment.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const updated = await updateStatus(id, { status: newStatus });
            setShipments((prev) =>
                prev.map((s) => (s.id === id ? updated : s))
            );
            if (onDataChanged) onDataChanged();
        } catch (err) {
            setError(err.response?.data?.message || "Could not update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Recent Shipments</h4>
                {!isSupport && (
                    <button className="btn btn-primary-custom bluebtn" onClick={() => setShowForm((prev) => !prev)}>
                        {showForm ? "Close" : "+ Add Shipment"}
                    </button>
                )}
            </div>

            {showForm && (
                <CreateShipmentForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
            )}

            {loading && <p className="text-muted">Loading shipments...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && shipments.length === 0 && <p className="text-muted mb-0">No shipments yet.</p>}

            {!loading && !error && shipments.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Tracking ID</th>
                                <th>Sender Name</th>
                                <th>Receiver Name</th>
                                <th>Status</th>
                                <th>Created</th>
                                {isSupport ? <th>Details</th> : <><th>Live</th><th></th></>}
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map((shipment) => (
                                <tr key={shipment.id}>
                                    <td>{shipment.trackingNumber}</td>
                                    <td>{shipment.senderName}</td>
                                    <td>{shipment.receiverName}</td>
                                    <td>
                                        {isSupport ? (
                                            <span className={`badge ${getStatusBadgeClass(shipment.status)}`}>
                                                {getStatusLabel(shipment.status)}
                                            </span>
                                        ) : (
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ minWidth: "160px" }}
                                                value={shipment.status}
                                                disabled={updatingId === shipment.id}
                                                onChange={(e) => handleStatusChange(shipment.id, e.target.value)}
                                            >
                                                {ALL_STATUSES.map((status) => (
                                                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td>{shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : "-"}</td>
                                    {isSupport ? (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => onViewDetails && onViewDetails(shipment.id)} title="View Details">
                                                <i className="bi bi-eye"></i> Details
                                            </button>
                                            {onEdit && (
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(shipment.id)} title="Edit Shipment">
                                                    <i className="bi bi-pencil"></i> Edit
                                                </button>
                                            )}
                                        </td>
                                    ) : (
                                        <>
                                            <td>
                                                <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/live-tracking/${shipment.trackingNumber}`)} title="Live Track">
                                                    <i className="bi bi-geo-alt"></i>
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(shipment.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RecentShipments;