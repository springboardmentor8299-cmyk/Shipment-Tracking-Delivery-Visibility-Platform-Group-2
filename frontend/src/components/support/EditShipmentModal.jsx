import { useState, useEffect } from "react";
import { fetchShipmentById, updateShipmentDetails } from "../../services/shipmentService";

function EditShipmentModal({ shipmentId, onClose, onUpdated }) {
    const [formData, setFormData] = useState({
        senderName: "",
        senderAddress: "",
        receiverName: "",
        deliveryAddress: "",
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shipmentId) return;
        setLoading(true);
        fetchShipmentById(shipmentId)
            .then((data) => {
                setFormData({
                    senderName: data.senderName || "",
                    senderAddress: data.senderAddress || "",
                    receiverName: data.receiverName || "",
                    deliveryAddress: data.deliveryAddress || "",
                });
            })
            .catch(() => setError("Failed to load shipment data."))
            .finally(() => setLoading(false));
    }, [shipmentId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const updated = await updateShipmentDetails(shipmentId, formData);
            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update shipment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Shipment</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading && (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {!loading && (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Sender Name</label>
                                    <input
                                        type="text"
                                        name="senderName"
                                        value={formData.senderName}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Sender Address</label>
                                    <textarea
                                        name="senderAddress"
                                        value={formData.senderAddress}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="2"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Receiver Name</label>
                                    <input
                                        type="text"
                                        name="receiverName"
                                        value={formData.receiverName}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Delivery Address</label>
                                    <textarea
                                        name="deliveryAddress"
                                        value={formData.deliveryAddress}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="2"
                                        required
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditShipmentModal;
