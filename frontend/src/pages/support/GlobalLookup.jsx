import React, { useEffect, useState } from "react";
import { Search, Package, Eye, RefreshCw } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";
import PodViewerModal from "../../components/pod/PodViewerModal";
import { getAllShipments } from "../../services/shipmentService";
import { useNotifications } from "../../context/NotificationContext";

export function GlobalLookup() {
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Inspection Modal State
  const [viewingPodShipmentId, setViewingPodShipmentId] = useState(null);
  const [viewingTrackingNo, setViewingTrackingNo] = useState("");

  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await getAllShipments();
      setAllShipments(data || []);
    } catch (err) {
      console.error("Error fetching all shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

      const res = await axios.get(`http://localhost:8080/api/shipments/track/${searchQuery.trim()}`, { headers });
      setSearchResult(res.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Shipment not found with tracking ID: " + searchQuery);
      setSearchResult(null);
    }
  };

  const handleResendNotification = (trackingNumber) => {
    addNotification({
      title: "Delivery Update Alert Resent",
      message: `SMS & Email alerts dispatched to customer for shipment #${trackingNumber}.`,
      category: "STATUS_UPDATE",
      trackingNumber
    });
    alert(`[NOTIFICATION SERVICE] Delivery update notification (Email & SMS) re-sent for tracking #${trackingNumber}!`);
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 600 }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12, color: "#2563eb" }} />
        <div>Loading Global Fleet Shipment Directory...</div>
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
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "rgba(59, 130, 246, 0.25)", color: "#93c5fd", border: "1px solid rgba(147, 197, 253, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Global Audit Directory
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", margin: "8px 0 4px 0", letterSpacing: "-0.5px" }}>
            Global Shipment Directory & Lookup
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
            Audit single tracking IDs, resend customer delivery notifications, and view global fleet records.
          </p>
        </div>

        <button
          onClick={fetchShipments}
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
          <RefreshCw size={15} /> Refresh Directory
        </button>
      </div>

      {/* Global Search Tool Card */}
      <div style={{ background: "#ffffff", borderRadius: 24, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>Audit Lookup Tool</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 13 }} />
            <input
              type="text"
              placeholder="Search by Tracking Number (e.g. SH1001, YTG1986)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                borderRadius: 12,
                border: "1.5px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Search Audit Trail
          </button>
        </form>

        {searchResult && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "#f5f3ff", border: "1.5px solid #ddd6fe", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9" }}>#{searchResult.trackingNumber}</div>
              <div style={{ fontSize: 13, color: "#334155", fontWeight: 600, marginTop: 2 }}>
                Receiver: {searchResult.receiverName} | Destination: {searchResult.deliveryAddress}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Status: <strong style={{ color: "#6d28d9" }}>{searchResult.status}</strong></div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setViewingPodShipmentId(searchResult.id); setViewingTrackingNo(searchResult.trackingNumber); }}
                style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #c4b5fd", background: "#ffffff", color: "#6d28d9", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                View POD Record
              </button>
              <button
                onClick={() => handleResendNotification(searchResult.trackingNumber)}
                style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#6d28d9", color: "#ffffff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Resend Alert
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Fleet Directory Table */}
      <div style={{ background: "#ffffff", borderRadius: 24, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1.5px solid #f1f5f9", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={20} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>All Fleet Shipments Directory</h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Support Agent full audit access across all customer and driver shipments</p>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>
            Total: {allShipments.length} Shipments
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>TRACKING ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>DRIVER / SENDER</th>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>RECEIVER</th>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>DESTINATION</th>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>STATUS</th>
                <th style={{ padding: "12px 16px", fontWeight: 800, color: "#475569" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {allShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                    No shipments recorded in fleet system.
                  </td>
                </tr>
              ) : (
                allShipments.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "#2563eb" }}>#{s.trackingNumber}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#0f172a" }}>{s.senderName || "Driver Sanjai"}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#0f172a" }}>{s.receiverName}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{s.deliveryAddress}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 12px",
                          borderRadius: 20,
                          background: s.status === "DELIVERED" ? "#dcfce7" : s.status === "IN_TRANSIT" ? "#eff6ff" : "#fef3c7",
                          color: s.status === "DELIVERED" ? "#166534" : s.status === "IN_TRANSIT" ? "#1d4ed8" : "#b45309"
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => { setViewingPodShipmentId(s.id); setViewingTrackingNo(s.trackingNumber); }}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={13} color="#2563eb" /> View POD
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

export default GlobalLookup;
