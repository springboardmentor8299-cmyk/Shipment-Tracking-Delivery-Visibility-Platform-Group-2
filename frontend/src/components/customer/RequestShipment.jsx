import { useState } from "react";
import { Package, MapPin, User, PlusCircle, UserCheck, Truck } from "lucide-react";
import { createShipment } from "../../services/shipmentService";
import { useNotifications } from "../../context/NotificationContext";

export default function RequestShipment({ onRequested }) {
  const [form, setForm] = useState({ trackingNumber: "", senderName: "", receiverName: "", deliveryAddress: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { addNotification } = useNotifications();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!form.trackingNumber || !form.senderName || !form.receiverName || !form.deliveryAddress) {
      setMessage("Please fill all fields to request a shipment.");
      return;
    }
    setLoading(true);
    try {
      await createShipment({ ...form, status: "REQUESTED" });
      addNotification({
        title: "New Customer Shipment Request",
        message: `Customer requested shipment #${form.trackingNumber} to ${form.deliveryAddress}. Pending Admin approval.`,
        category: "SHIPMENT_REQUEST",
        trackingNumber: form.trackingNumber,
        recipientRole: "ADMIN"
      });
      setMessage("Shipment request submitted successfully! Admin will review and accept shortly.");
      setForm({ trackingNumber: "", senderName: "", receiverName: "", deliveryAddress: "" });
      onRequested?.();
    } catch (err) {
      console.error("Request submit failed:", err);
      setMessage("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: 12,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 24, padding: "28px 32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", marginBottom: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>Request a Shipment</h3>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14, fontWeight: 500 }}>
          Fill a simple request and Admin will accept and create the shipment.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 740, margin: "0 auto" }}>
        {/* Field 1: Tracking ID */}
        <div style={{ position: "relative" }}>
          <Package size={18} color="#64748b" style={{ position: "absolute", left: 14, top: 14 }} />
          <input
            name="trackingNumber"
            value={form.trackingNumber}
            onChange={handleChange}
            placeholder="Tracking ID (e.g. SH3001)"
            style={inputStyle}
          />
        </div>

        {/* Field 2: Driver / Operator Name */}
        <div style={{ position: "relative" }}>
          <Truck size={18} color="#64748b" style={{ position: "absolute", left: 14, top: 14 }} />
          <input
            name="senderName"
            value={form.senderName}
            onChange={handleChange}
            placeholder="Driver / Operator Name (e.g. Driver Sanjai)"
            style={inputStyle}
          />
        </div>

        {/* Field 3: Receiver Name */}
        <div style={{ position: "relative" }}>
          <UserCheck size={18} color="#64748b" style={{ position: "absolute", left: 14, top: 14 }} />
          <input
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            placeholder="Receiver Name"
            style={inputStyle}
          />
        </div>

        {/* Field 4: Delivery Address */}
        <div style={{ position: "relative" }}>
          <MapPin size={18} color="#64748b" style={{ position: "absolute", left: 14, top: 14 }} />
          <input
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            placeholder="Delivery Address"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              transition: "transform 0.15s ease"
            }}
          >
            <PlusCircle size={16} />
            {loading ? "Submitting Request..." : "Request Shipment"}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: message.includes("Failed") ? "#fef2f2" : "#f0fdf4",
              color: message.includes("Failed") ? "#dc2626" : "#16a34a",
              border: `1px solid ${message.includes("Failed") ? "#fecdd3" : "#bbf7d0"}`
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
