import React, { useEffect, useState } from "react";
import { X, Play, Pause, RotateCcw, MapPin, Clock, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix default marker icon issues in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

export function RouteReplayMapModal({ isOpen, onClose, shipmentId, trackingNumber }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchHistory();
    }
  }, [isOpen, shipmentId]);

  useEffect(() => {
    let timer;
    if (isPlaying && history.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, history]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/routes/${shipmentId}/history`);
      setHistory(res.data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching route history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const positions = history.map((pt) => [pt.latitude, pt.longitude]);
  const activePosition = positions[currentIndex] || positions[0] || [28.6139, 77.209];
  const activeWaypoint = history[currentIndex];

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 10, background: "#e0e7ff", color: "#4f46e5", borderRadius: 12 }}>
              <Navigation size={22} />
            </div>
            <div>
              <h3 className="modal-title">Route History & Map Replay</h3>
              <p className="modal-subtitle">Tracking #{trackingNumber || shipmentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
            Loading Route Polyline History...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
            <MapPin size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>No route history waypoints recorded yet.</p>
          </div>
        ) : (
          <div>
            {/* Controls Bar */}
            <div style={{ padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? "Pause" : "Play Run"}</span>
                </button>
                <button
                  onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
                  style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}
                >
                  <RotateCcw size={16} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  Waypoint {currentIndex + 1} of {history.length}
                </span>
              </div>

              {activeWaypoint && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#4f46e5" }}>{activeWaypoint.locationName}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                    {new Date(activeWaypoint.timestamp).toLocaleString()} ({activeWaypoint.status})
                  </div>
                </div>
              )}
            </div>

            {/* Leaflet Map Canvas */}
            <div className="leaflet-map-wrapper">
              <MapContainer center={activePosition} zoom={6} style={{ height: "340px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {positions.length > 1 && (
                  <Polyline positions={positions.slice(0, currentIndex + 1)} color="#4f46e5" weight={5} opacity={0.9} />
                )}

                {positions.map((pos, idx) => (
                  <Marker key={idx} position={pos}>
                    <Popup>
                      <div style={{ fontSize: 12 }}>
                        <strong>Waypoint #{idx + 1}</strong>
                        <div>{history[idx]?.locationName}</div>
                        <span style={{ color: "#64748b" }}>{history[idx]?.status}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Timeline List */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Waypoint Timeline
              </h4>
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`timeline-item ${currentIndex === idx ? "active" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={14} color="#4f46e5" />
                      <span>{item.locationName}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#f1f5f9", fontWeight: 700 }}>{item.status}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 12, fontWeight: 700, fontSize: 13, color: "#334155", cursor: "pointer" }}
          >
            Close Replay
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteReplayMapModal;
