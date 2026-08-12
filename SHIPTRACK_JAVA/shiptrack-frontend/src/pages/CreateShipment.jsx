import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

function CreateShipment() {
    const [form, setForm] = useState({
        customerEmail: "",
        customerPhone: "",
        senderName: "",
        receiverName: "",
        sourceAddress: "",
        destinationAddress: "",
        packageWeight: "",
        shipmentStatus: "CREATED"
    });
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const geocode = async (q, setter) => {
        if (!q || q.trim().length < 3) return setter([]);
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setter(data);
    };

    useEffect(() => {
        const t = setTimeout(() => geocode(form.sourceAddress, setSourceSuggestions), 350);
        return () => clearTimeout(t);
    }, [form.sourceAddress]);

    useEffect(() => {
        const t = setTimeout(() => geocode(form.destinationAddress, setDestinationSuggestions), 350);
        return () => clearTimeout(t);
    }, [form.destinationAddress]);

    const handleSelectPlace = (place, field) => {
        if (field === "sourceAddress") {
            setSourceSuggestions([]);
        }

        if (field === "destinationAddress") {
            setDestinationSuggestions([]);
        }

        setForm((prev) => ({
            ...prev,
            [field]: place.display_name
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.customerEmail.trim() || !form.senderName.trim() || !form.receiverName.trim() || !form.sourceAddress.trim() || !form.destinationAddress.trim()) {
            toast.error("Fill all required shipment fields.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const source = sourceSuggestions[0];
            const destination = destinationSuggestions[0];
            const response = await api.post("/shipments", {
                customerEmail: form.customerEmail.trim(),
                customerPhone: form.customerPhone.trim(),
                senderName: form.senderName.trim(),
                receiverName: form.receiverName.trim(),
                receiverAddress: form.destinationAddress.trim(),
                sourceAddress: form.sourceAddress.trim(),
                destinationAddress: form.destinationAddress.trim(),
                sourceLatitude: source ? Number(source.lat) : null,
                sourceLongitude: source ? Number(source.lon) : null,
                destinationLatitude: destination ? Number(destination.lat) : null,
                destinationLongitude: destination ? Number(destination.lon) : null,
                packageWeight: Number(form.packageWeight),
                shipmentStatus: form.shipmentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Shipment created. Tracking: ${response.data.trackingNumber}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create shipment");
        } finally {
            setLoading(false);
        }
    };

    const sourceOptions = useMemo(() => sourceSuggestions, [sourceSuggestions]);
    const destinationOptions = useMemo(() => destinationSuggestions, [destinationSuggestions]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Create Shipment</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">User Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={form.customerEmail}
                        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Customer Phone</label>
                    <input
                        type="tel"
                        className="form-control"
                        value={form.customerPhone}
                        onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Sender Name</label>
                    <input className="form-control" value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Receiver Name</label>
                    <input className="form-control" value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} required />
                </div>
                <div className="mb-3 position-relative">
                    <label className="form-label">Source Location</label>
                    <input className="form-control" value={form.sourceAddress} onChange={(e) => setForm({ ...form, sourceAddress: e.target.value })} required />
                    {sourceOptions.length > 0 && (
                        <div className="list-group position-absolute w-100 z-3">
                            {sourceOptions.map((place) => (
                                <button key={place.place_id} type="button" className="list-group-item list-group-item-action" onClick={() => handleSelectPlace(place, "sourceAddress")}>
                                    {place.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mb-3 position-relative">
                    <label className="form-label">Destination Location</label>
                    <input className="form-control" value={form.destinationAddress} onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })} required />
                    {destinationOptions.length > 0 && (
                        <div className="list-group position-absolute w-100 z-3">
                            {destinationOptions.map((place) => (
                                <button key={place.place_id} type="button" className="list-group-item list-group-item-action" onClick={() => handleSelectPlace(place, "destinationAddress")}>
                                    {place.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label">Package Weight (kg)</label>
                    <input type="number" className="form-control" value={form.packageWeight} onChange={(e) => setForm({ ...form, packageWeight: e.target.value })} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Shipment Status</label>
                    <select
                        className="form-select"
                        value={form.shipmentStatus}
                        onChange={(e) => setForm({ ...form, shipmentStatus: e.target.value })}
                    >
                        <option value="CREATED">CREATED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PICKED_UP">PICKED_UP</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERY_FAILED">DELIVERY_FAILED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>

                <button className="btn btn-success mb-4" disabled={loading}>
                    {loading ? "Creating..." : "Create Shipment"}
                </button>
            </form>
        </div>
    );
}

export default CreateShipment;
