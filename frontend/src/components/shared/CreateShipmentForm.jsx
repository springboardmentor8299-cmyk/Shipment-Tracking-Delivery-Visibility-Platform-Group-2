import { useEffect, useRef, useState } from "react";
import { create } from "../../services/shipmentService";
import { loadGeoapifyAutocomplete, hasApiKey } from "../../services/mapsService";

function CreateShipmentForm({ onCreated, onCancel }) {

    const [formData, setFormData] = useState({
        senderName: "",
        senderAddress: "",
        receiverName: "",
        deliveryAddress: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const senderRef = useRef(null);
    const deliveryRef = useRef(null);

    useEffect(() => {
        if (!hasApiKey()) return;
        loadGeoapifyAutocomplete().then(() => {
            const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
            if (senderRef.current && window.GeoapifyAutocomplete) {
                new window.GeoapifyAutocomplete(senderRef.current, { apiKey });
            }
            if (deliveryRef.current && window.GeoapifyAutocomplete) {
                new window.GeoapifyAutocomplete(deliveryRef.current, { apiKey });
            }
        });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setLoading(true);

        try {

            const shipment = await create(formData);

            setFormData({ senderName: "", senderAddress: "", receiverName: "", deliveryAddress: "" });

            if (onCreated) {
                onCreated(shipment);
            }

        } catch (err) {

            setError(err.response?.data?.message || "Could not create shipment.");

        } finally {

            setLoading(false);

        }

    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded-4 bg-light mb-4">

            {error && (
                <div className="alert alert-danger py-2">
                    {error}
                </div>
            )}

            <div className="mb-2">
                <label className="form-label fw-semibold small">Sender Name</label>
                <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    required
                />
            </div>

            <div className="mb-2">
                <label className="form-label fw-semibold small">Sender Address</label>
                <textarea
                    ref={senderRef}
                    name="senderAddress"
                    value={formData.senderAddress}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                    placeholder="Sender's full address"
                    required
                />
            </div>

            <div className="mb-2">
                <label className="form-label fw-semibold small">Receiver Name</label>
                <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Priya Patel"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold small">Receiver Address (Delivery Address)</label>
                <textarea
                    ref={deliveryRef}
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                    placeholder="Receiver's full address"
                    required
                />
            </div>

            <div className="d-flex gap-2">
                <button type="submit" className="btn bluebtn" disabled={loading}>
                    {loading ? "Creating..." : "Create Shipment"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>

        </form>
    );
}

export default CreateShipmentForm;