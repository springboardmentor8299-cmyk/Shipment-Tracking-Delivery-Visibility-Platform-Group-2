import { useEffect, useState } from "react";
import { getAllShipments, updateShipmentStatus } from "../../services/shipmentService";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const all = await getAllShipments();
      setRequests((all || []).filter(s => (s.status || "").toUpperCase() === "REQUESTED"));
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id) => {
    try {
      await updateShipmentStatus(id, "PENDING");
      const req = requests.find(r => r.id === id);
      addNotification({
        title: "Shipment Request Approved",
        message: `Admin approved your shipment request #${req?.trackingNumber || id}! Shipment created & ready for dispatch.`,
        category: "SHIPMENT_REQUEST",
        trackingNumber: req?.trackingNumber || "",
        recipientRole: "CUSTOMER",
        targetCustomer: req?.receiverName || ""
      });
      load();
      alert("Shipment request accepted. Shipment moved to PENDING.");
    } catch (err) {
      console.error(err);
      alert("Failed to accept request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateShipmentStatus(id, "REJECTED");
      const req = requests.find(r => r.id === id);
      addNotification({
        title: "Shipment Request Declined",
        message: `Shipment request #${req?.trackingNumber || id} was declined by Admin.`,
        category: "SHIPMENT_REQUEST",
        trackingNumber: req?.trackingNumber || "",
        recipientRole: "CUSTOMER",
        targetCustomer: req?.receiverName || ""
      });
      load();
      alert("Shipment request rejected.");
    } catch (err) {
      console.error(err);
      alert("Failed to reject request.");
    }
  };

  if (loading) return <div className="p-6 text-slate-600 font-semibold">Loading shipment requests...</div>;

  return (
    <div style={{ marginTop: 18, background: "#ffffff", border: "1px solid #e6eef8", borderRadius: 14, padding: 18 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Pending Shipment Requests</h3>
      <p style={{ margin: "6px 0 12px", color: "#64748b", fontSize: 13 }}>Approve or reject customer-raised requests.</p>

      {requests.length === 0 ? (
        <div className="p-6 text-center text-slate-400">No pending requests.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {requests.map(r => (
            <div key={r.id} style={{ border: "1px solid #eef2ff", padding: 12, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{r.trackingNumber} — {r.receiverName}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{r.deliveryAddress}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleReject(r.id)} style={{ background: "#fff", border: "1px solid #f3f4f6", padding: "8px 10px", borderRadius: 10 }}>Reject</button>
                <button onClick={() => handleAccept(r.id)} style={{ background: "#10b981", color: "#fff", padding: "8px 10px", borderRadius: 10, border: "none", fontWeight: 700 }}>
                  <CheckCircle2 size={14} />&nbsp;Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
