import { useEffect, useState } from "react";
import { getAllShipments } from "../../services/shipmentService";
import { CheckCircle2, Truck, Clock, Package, Eye, Navigation, MapPin } from "lucide-react";
import PodViewerModal from "../pod/PodViewerModal";
import RouteReplayMapModal from "../common/RouteReplayMapModal";
import { getStoredUser } from "../../utils/auth";

function MyShipmentTable({ searchTerm = "" }) {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = getStoredUser();

    // Modal states
    const [podShipmentId, setPodShipmentId] = useState(null);
    const [podTrackingNo, setPodTrackingNo] = useState("");
    const [replayShipmentId, setReplayShipmentId] = useState(null);
    const [replayTrackingNo, setReplayTrackingNo] = useState("");

    useEffect(() => {
        const loadShipments = async () => {
            try {
                const data = await getAllShipments();
                setShipments(data || []);
            } catch (error) {
                console.error("Shipment loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadShipments();
    }, []);

    // Filter shipments for customer or by search term
    const filteredShipments = shipments.filter(s => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return true;
        return (
            (s.trackingNumber || "").toLowerCase().includes(q) ||
            (s.receiverName || "").toLowerCase().includes(q) ||
            (s.senderName || "").toLowerCase().includes(q) ||
            (s.deliveryAddress || "").toLowerCase().includes(q) ||
            (s.status || "").toLowerCase().includes(q)
        );
    });

    const getStatusBadge = (statusStr) => {
        const s = (statusStr || "").toUpperCase();
        if (s === "DELIVERED") {
            return { bg: "#dcfce7", color: "#166534", border: "#86efac", icon: CheckCircle2, label: "DELIVERED" };
        }
        if (s === "IN_TRANSIT") {
            return { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", icon: Truck, label: "IN TRANSIT" };
        }
        if (s === "OUT_FOR_DELIVERY") {
            return { bg: "#f3e8ff", color: "#7e22ce", border: "#d8b4fe", icon: Navigation, label: "OUT FOR DELIVERY" };
        }
        return { bg: "#fef3c7", color: "#b45309", border: "#fde68a", icon: Clock, label: "PENDING" };
    };

    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: "24px 28px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
            }}
        >
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>My Shipments Log</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                        View live status & inspect proof of delivery (POD)
                    </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>
                    Total: {filteredShipments.length} Shipments
                </span>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Tracking ID</th>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Driver / Sender</th>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Receiver</th>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Destination</th>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Status</th>
                            <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Actions & POD</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: 14 }}>
                                    Loading your shipments...
                                </td>
                            </tr>
                        ) : filteredShipments.length > 0 ? (
                            filteredShipments.map((shipment) => {
                                const badge = getStatusBadge(shipment.status);
                                const BadgeIcon = badge.icon;

                                return (
                                    <tr key={shipment.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                                        <td style={{ padding: "16px 18px", fontSize: 14, fontWeight: 800, color: "#2563eb", whiteSpace: "nowrap" }}>
                                            #{shipment.trackingNumber}
                                        </td>

                                        <td style={{ padding: "16px 18px", fontSize: 14, color: "#334155", fontWeight: 600 }}>
                                            {shipment.senderName || "Logistics Driver"}
                                        </td>

                                        <td style={{ padding: "16px 18px", fontSize: 14, color: "#334155", fontWeight: 600 }}>
                                            {shipment.receiverName || currentUser?.username || "Customer"}
                                        </td>

                                        <td style={{ padding: "16px 18px", fontSize: 13, color: "#475569" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <MapPin size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                                                <span>{shipment.deliveryAddress || "Standard Destination"}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    padding: "6px 14px",
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    border: `1px solid ${badge.border}`
                                                }}
                                            >
                                                <BadgeIcon size={13} />
                                                {badge.label}
                                            </span>
                                        </td>

                                        <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <button
                                                    onClick={() => { setReplayShipmentId(shipment.id); setReplayTrackingNo(shipment.trackingNumber); }}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        padding: "7px 14px",
                                                        borderRadius: 10,
                                                        border: "1.5px solid #cbd5e1",
                                                        background: "#ffffff",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        color: "#334155",
                                                        cursor: "pointer",
                                                        transition: "all 0.15s"
                                                    }}
                                                >
                                                    <Navigation size={14} color="#2563eb" />
                                                    Replay Route
                                                </button>

                                                <button
                                                    onClick={() => { setPodShipmentId(shipment.id); setPodTrackingNo(shipment.trackingNumber); }}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        padding: "7px 14px",
                                                        borderRadius: 10,
                                                        border: "1.5px solid #bfdbfe",
                                                        background: "#eff6ff",
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        color: "#1d4ed8",
                                                        cursor: "pointer",
                                                        transition: "all 0.15s"
                                                    }}
                                                >
                                                    <Eye size={14} color="#2563eb" />
                                                    POD Evidence
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                                        <Package size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
                                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#475569" }}>No shipments found</p>
                                        <span style={{ fontSize: 13 }}>Search another tracking number or request a new shipment.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* POD Viewer Modal */}
            <PodViewerModal
                isOpen={!!podShipmentId}
                onClose={() => setPodShipmentId(null)}
                shipmentId={podShipmentId}
                trackingNumber={podTrackingNo}
            />

            {/* Route Replay Map Modal */}
            <RouteReplayMapModal
                isOpen={!!replayShipmentId}
                onClose={() => setReplayShipmentId(null)}
                shipmentId={replayShipmentId}
                trackingNumber={replayTrackingNo}
            />
        </div>
    );
}

export default MyShipmentTable;