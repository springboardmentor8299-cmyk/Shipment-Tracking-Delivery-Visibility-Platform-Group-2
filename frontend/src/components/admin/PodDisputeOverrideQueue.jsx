import React, { useEffect, useState } from "react";
import { AlertTriangle, Eye, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import axios from "axios";
import { getStoredAuth, getStoredUser } from "../../utils/auth";
import PodViewerModal from "../pod/PodViewerModal";
import ExportButton from "../common/ExportButton";

export function PodDisputeOverrideQueue({ onOverrideSuccess }) {
  const [disputedPods, setDisputedPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectShipmentId, setInspectShipmentId] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      if (auth?.token) {
        const res = await axios.get("http://localhost:8080/api/pod/disputed", {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setDisputedPods(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching disputed PODs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminOverride = async (shipmentId, status) => {
    try {
      const auth = getStoredAuth();
      const user = getStoredUser();

      await axios.put(
        `http://localhost:8080/api/pod/${shipmentId}/verify`,
        {
          status,
          verifiedBy: user?.username || "AdminOverride",
          notes: "Executive Admin Override Approval"
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      alert(`Executive override successful! POD status for Shipment #${shipmentId} updated to ${status}.`);
      fetchDisputes();
      if (onOverrideSuccess) onOverrideSuccess();
    } catch (err) {
      console.error("Admin override error:", err);
      alert("Failed to execute POD override.");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
        Loading POD Dispute Override Queue...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #fecdd3",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 4px 20px rgba(244, 63, 94, 0.06)",
        marginBottom: 24
      }}
    >
      {/* Component Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: 10, background: "#fff1f2", color: "#e11d48", borderRadius: 14 }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              POD Dispute Executive Override Queue
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              Overrule support agent flags or issue executive approvals for disputed package deliveries
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ExportButton reportType="logistics" label="Export Logistics Excel" />
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#e11d48",
              background: "#fff1f2",
              border: "1px solid #fda4af",
              padding: "6px 14px",
              borderRadius: 20
            }}
          >
            {disputedPods.length} Pending Overrides
          </span>
        </div>
      </div>

      {/* Queue Body */}
      {disputedPods.length === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
          <ShieldCheck size={36} style={{ marginBottom: 8, opacity: 0.5, color: "#16a34a" }} />
          <div>No pending POD disputes in queue. All delivery confirmations are verified.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {disputedPods.map((pod) => (
            <div
              key={pod.id}
              style={{
                padding: 16,
                background: "#fff1f2",
                border: "1px solid #ffe4e6",
                borderRadius: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                    Shipment #{pod.shipmentId}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: "#fecdd3",
                      color: "#9f1239"
                    }}
                  >
                    DISPUTED
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                  Recipient: <strong style={{ color: "#0f172a" }}>{pod.recipientName || "Unknown Receiver"}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#be123c", fontStyle: "italic", marginTop: 2, fontWeight: 500 }}>
                  Dispute Reason: "{pod.notes || "Recipient reported delivery condition discrepancy."}"
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setInspectShipmentId(pod.shipmentId)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Eye size={14} color="#2563eb" />
                  Inspect POD
                </button>

                <button
                  onClick={() => handleAdminOverride(pod.shipmentId, "VERIFIED")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#ffffff",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <CheckCircle2 size={14} />
                  Executive Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POD Inspection Modal */}
      <PodViewerModal
        isOpen={!!inspectShipmentId}
        onClose={() => setInspectShipmentId(null)}
        shipmentId={inspectShipmentId}
      />
    </div>
  );
}

export default PodDisputeOverrideQueue;
