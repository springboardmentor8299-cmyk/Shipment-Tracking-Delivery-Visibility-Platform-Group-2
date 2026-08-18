import React, { useEffect, useState } from "react";
import { X, ShieldCheck, AlertCircle, MapPin, Calendar, User, FileCheck, CheckCircle2, Clock } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";

export function PodViewerModal({ isOpen, onClose, shipmentId, trackingNumber }) {
  const [podData, setPodData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchPod();
    }
  }, [isOpen, shipmentId]);

  const fetchPod = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const res = await axios.get(`http://localhost:8080/api/pod/${shipmentId}`, {
        headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}
      });
      setPodData(res.data);
    } catch (err) {
      console.error("Error fetching POD:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDisputed = podData?.status === "DISPUTED";
  const isVerified = podData?.status === "VERIFIED";

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 10, background: "#dbeafe", color: "#2563eb", borderRadius: 12 }}>
              <FileCheck size={22} />
            </div>
            <div>
              <h3 className="modal-title">Proof of Delivery (POD)</h3>
              <p className="modal-subtitle">Tracking #{trackingNumber || shipmentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Loading Proof of Delivery...</div>
        ) : !podData || podData.status === "NO_RECORD" ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
            <Clock size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No Proof of Delivery captured yet for this shipment.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Status Banner */}
            <div style={{
              padding: 16,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${isDisputed ? "#fecdd3" : isVerified ? "#bbf7d0" : "#bfdbfe"}`,
              background: isDisputed ? "#fff1f2" : isVerified ? "#f0fdf4" : "#eff6ff",
              color: isDisputed ? "#9f1239" : isVerified ? "#166534" : "#1e40af"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isDisputed ? <AlertCircle size={22} color="#e11d48" /> : <CheckCircle2 size={22} color="#16a34a" />}
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>POD Verification Status: {podData.status}</h4>
                  <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.9 }}>{podData.notes || "Standard delivery confirmation record."}</p>
                </div>
              </div>
              {podData.verifiedBy && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", background: "#ffffff", borderRadius: 20, border: "1px solid #cbd5e1" }}>
                  Verified by: {podData.verifiedBy}
                </span>
              )}
            </div>

            {/* Metadata Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #f1f5f9", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155" }}>
                <User size={16} color="#94a3b8" />
                <span>Recipient: <strong>{podData.recipientName || "N/A"}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155" }}>
                <Calendar size={16} color="#94a3b8" />
                <span>Delivered: <strong>{podData.capturedAt ? new Date(podData.capturedAt).toLocaleString() : "N/A"}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155" }}>
                <User size={16} color="#94a3b8" />
                <span>Agent ID: <strong>{podData.deliveryAgentId || "Sam (Driver)"}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155" }}>
                <MapPin size={16} color="#94a3b8" />
                <span>Geotag: <strong>{podData.geoLat ? `${podData.geoLat.toFixed(4)}, ${podData.geoLng.toFixed(4)}` : "GPS Locked"}</strong></span>
              </div>
            </div>

            {/* Signature Section */}
            {podData.signatureUrl && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Recipient Digital Signature
                </h4>
                <div style={{ padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", justifyContent: "center" }}>
                  {podData.signatureUrl.startsWith("data:image/svg") ? (
                    <div dangerouslySetInnerHTML={{ __html: podData.signatureUrl.replace("data:image/svg+xml;utf8,", "") }} />
                  ) : (
                    <img src={podData.signatureUrl} alt="Signature" style={{ maxHeight: 90, objectFit: "contain" }} />
                  )}
                </div>
              </div>
            )}

            {/* Delivery Photos Section */}
            {podData.photoUrls && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Delivery Photos
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {podData.photoUrls.split(",").map((url, idx) => (
                    <img key={idx} src={url} alt={`Delivery Photo ${idx + 1}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 14, border: "1px solid #e2e8f0" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 12, fontWeight: 700, fontSize: 13, color: "#334155", cursor: "pointer" }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

export default PodViewerModal;
