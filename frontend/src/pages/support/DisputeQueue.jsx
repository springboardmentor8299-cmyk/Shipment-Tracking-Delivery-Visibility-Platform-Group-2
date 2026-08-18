import React, { useEffect, useState } from "react";
import { AlertOctagon, Eye, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";
import PodViewerModal from "../../components/pod/PodViewerModal";
import { useNotifications } from "../../context/NotificationContext";

export function DisputeQueue() {
  const [disputedPods, setDisputedPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Inspection Modal State
  const [viewingPodShipmentId, setViewingPodShipmentId] = useState(null);
  const [viewingTrackingNo, setViewingTrackingNo] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
      const res = await axios.get("http://localhost:8080/api/pod/disputed", { headers });
      setDisputedPods(res.data || []);
    } catch (err) {
      console.error("Error fetching disputed PODs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDispute = async (shipmentId, newStatus, notes) => {
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

      await axios.put(
        `http://localhost:8080/api/pod/${shipmentId}/verify`,
        { status: newStatus, verifiedBy: auth?.username || "SupportAgent", notes },
        { headers }
      );

      addNotification({
        title: `POD Dispute Status: ${newStatus}`,
        message: `POD claim for shipment #${shipmentId} updated to ${newStatus} by Support Agent.`,
        category: "DISPUTE",
        trackingNumber: String(shipmentId)
      });

      alert(`POD status updated to ${newStatus}`);
      fetchDisputes();
    } catch (err) {
      console.error("Dispute verification error:", err);
      alert("Failed to update dispute status.");
    }
  };

  const handleEscalateToAdmin = (shipmentId) => {
    addNotification({
      title: "Dispute Escalated to Admin",
      message: `Shipment #${shipmentId} POD dispute escalated for executive admin review.`,
      category: "DISPUTE",
      trackingNumber: String(shipmentId)
    });
    alert(`Shipment #${shipmentId} escalated to Administrator queue for priority audit.`);
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 600 }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12, color: "#2563eb" }} />
        <div>Loading Disputed POD Claims Queue...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 48 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderRadius: 24,
          padding: "28px 32px",
          boxShadow: "0 10px 25px rgba(15,23,42,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "rgba(225, 29, 72, 0.25)", color: "#fecdd3", border: "1px solid rgba(254, 205, 211, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Claims & Proof Audit
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", margin: "8px 0 4px 0", letterSpacing: "-0.5px" }}>
            Disputed POD Queue
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
            Inspect recipient signature and photo proof evidence, audit redelivery requests, and manage claims.
          </p>
        </div>

        <button
          onClick={fetchDisputes}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          <RefreshCw size={15} /> Refresh Queue
        </button>
      </div>

      {/* Disputed POD Queue Card */}
      <div style={{ background: "#ffffff", borderRadius: 24, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertOctagon size={22} color="#e11d48" />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Disputed POD Claims Queue</h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#e11d48", background: "#fff1f2", padding: "6px 14px", borderRadius: 20, border: "1px solid #fecdd3" }}>
            {disputedPods.length} Pending Disputes
          </span>
        </div>

        {disputedPods.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
            <ShieldCheck size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <div>No disputed POD records currently pending review. All claims clear!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {disputedPods.map((pod) => (
              <div key={pod.id} style={{ padding: 20, borderRadius: 16, background: "#fff5f5", border: "1.5px solid #fecdd3", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Shipment #{pod.shipmentId}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#ffe4e6", color: "#9f1239", border: "1px solid #fca5a5" }}>
                      DISPUTED
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Captured: {pod.capturedAt ? new Date(pod.capturedAt).toLocaleString() : "N/A"}</span>
                </div>

                <div style={{ fontSize: 13, color: "#334155" }}>
                  Recipient Claimant: <strong>{pod.recipientName || "Claimant"}</strong>
                </div>

                <p style={{ fontSize: 13, color: "#9f1239", fontStyle: "italic", background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #fecdd3", margin: 0 }}>
                  Dispute Notes: "{pod.notes || "Customer reported package condition discrepancy."}"
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, borderTop: "1px solid #fecdd3", paddingTop: 12 }}>
                  <button
                    onClick={() => { setViewingPodShipmentId(pod.shipmentId); setViewingTrackingNo(String(pod.shipmentId)); }}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Eye size={14} color="#2563eb" /> Inspect Proof
                  </button>

                  <button
                    onClick={() => handleVerifyDispute(pod.shipmentId, "VERIFIED", "Approved by Support Agent after audit.")}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#16a34a", color: "#ffffff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <CheckCircle2 size={14} /> Approve POD
                  </button>

                  <button
                    onClick={() => handleVerifyDispute(pod.shipmentId, "RESOLVED", "Redelivery dispatched.")}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#d97706", color: "#ffffff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <XCircle size={14} /> Request Redelivery
                  </button>

                  <button
                    onClick={() => handleEscalateToAdmin(pod.shipmentId)}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#0f172a", color: "#ffffff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <ArrowUpRight size={14} /> Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POD Viewer Modal */}
      {viewingPodShipmentId && (
        <PodViewerModal
          shipmentId={viewingPodShipmentId}
          trackingNumber={viewingTrackingNo}
          onClose={() => setViewingPodShipmentId(null)}
        />
      )}
    </div>
  );
}

export default DisputeQueue;
