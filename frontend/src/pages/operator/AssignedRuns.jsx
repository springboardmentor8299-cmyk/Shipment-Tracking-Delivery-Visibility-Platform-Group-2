import { useEffect, useState } from "react";
import { Truck, Search, MapPin, Package, Navigation, CheckCircle2, RefreshCw } from "lucide-react";
import { getAllShipments, updateShipmentStatus } from "../../services/shipmentService";
import { getStoredUser } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";

function AssignedRuns() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [runsSearch, setRunsSearch] = useState("");
  const [runsFilter, setRunsFilter] = useState("ALL"); // ALL, PENDING, IN_TRANSIT, DELIVERED
  const { addNotification } = useNotifications();
  const currentUser = getStoredUser();

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const data = await getAllShipments();
      setShipments(data || []);
    } catch (err) {
      console.error("Failed to load assigned runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleUpdateStatus = async (shipment, newStatus) => {
    setUpdatingId(shipment.id);
    try {
      await updateShipmentStatus(shipment.id, newStatus);

      // Update local state instantly
      setShipments(prev =>
        prev.map(s => (s.id === shipment.id ? { ...s, status: newStatus } : s))
      );

      // Route Notification to ADMIN
      addNotification({
        title: `Operator Updated Shipment #${shipment.trackingNumber}`,
        message: `Field logistics operator ${currentUser?.username || 'Driver'} updated shipment #${shipment.trackingNumber} status to ${newStatus.replace('_', ' ')}.`,
        category: "STATUS_UPDATE",
        trackingNumber: shipment.trackingNumber,
        recipientRole: "ADMIN"
      });

      // Route Notification to CUSTOMER
      addNotification({
        title: `Delivery Status Update: #${shipment.trackingNumber}`,
        message: `Your shipment #${shipment.trackingNumber} status is now ${newStatus.replace('_', ' ')}.`,
        category: "STATUS_UPDATE",
        trackingNumber: shipment.trackingNumber,
        recipientRole: "CUSTOMER",
        targetCustomer: shipment.receiverName || ""
      });

    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Unable to update shipment status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter operator assigned shipments
  const operatorUsername = (currentUser?.username || "").toLowerCase();
  const operatorEmail = (currentUser?.email || "").toLowerCase();

  const assignedShipments = shipments.filter(s => {
    const sender = (s.senderName || "").toLowerCase();
    const driver = (s.driverName || "").toLowerCase();
    const opEmail = (s.operatorEmail || "").toLowerCase();
    const opId = s.assignedOperatorId ? String(s.assignedOperatorId) : "";
    const currentUserId = currentUser?.id ? String(currentUser.id) : "";

    if (!operatorUsername && !operatorEmail && !currentUserId) return true;

    return (opId && opId === currentUserId) ||
           (opEmail && opEmail === operatorEmail) ||
           (sender && operatorUsername && sender.includes(operatorUsername)) ||
           (sender && operatorEmail && sender.includes(operatorEmail)) ||
           (driver && operatorUsername && driver.includes(operatorUsername)) ||
           (driver && operatorEmail && driver.includes(operatorEmail));
  });

  const filteredRuns = assignedShipments.filter(s => {
    const q = runsSearch.trim().toLowerCase();
    const matchesSearch = !q || (s.trackingNumber || "").toLowerCase().includes(q) ||
                                 (s.receiverName || "").toLowerCase().includes(q) ||
                                 (s.deliveryAddress || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (runsFilter === "ALL") return true;
    return (s.status || "").toUpperCase() === runsFilter;
  });

  const getStatusBadgeStyle = (statusStr) => {
    const st = (statusStr || "").toUpperCase();
    if (st === "DELIVERED") return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    if (st === "IN_TRANSIT") return { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" };
    if (st === "OUT_FOR_DELIVERY") return { bg: "#f3e8ff", color: "#7e22ce", border: "#d8b4fe" };
    return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
  };

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
              Assigned Field Operator: {currentUser?.username || "Driver Sam"}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
            Assigned Delivery Runs
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#475569", fontWeight: 500 }}>
            Manage active freight runs assigned to your account & update delivery status in real-time.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 12,
            border: "1.5px solid #cbd5e1",
            background: "#ffffff",
            color: "#334155",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          <RefreshCw size={15} /> Refresh Runs
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 20, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Total Assigned Runs</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{assignedShipments.length}</div>
        </div>

        <div style={{ padding: 20, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
          <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 700 }}>In Transit</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>
            {assignedShipments.filter(s => (s.status || "").toUpperCase() === "IN_TRANSIT").length}
          </div>
        </div>

        <div style={{ padding: 20, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
          <div style={{ fontSize: 13, color: "#7e22ce", fontWeight: 700 }}>Out for Delivery</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#7e22ce", marginTop: 4 }}>
            {assignedShipments.filter(s => (s.status || "").toUpperCase() === "OUT_FOR_DELIVERY").length}
          </div>
        </div>

        <div style={{ padding: 20, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
          <div style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>Delivered</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", marginTop: 4 }}>
            {assignedShipments.filter(s => (s.status || "").toUpperCase() === "DELIVERED").length}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
          {[
            { id: "ALL", label: "All Runs" },
            { id: "PENDING", label: "Pending" },
            { id: "IN_TRANSIT", label: "In Transit" },
            { id: "DELIVERED", label: "Delivered" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRunsFilter(f.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: runsFilter === f.id ? "#ffffff" : "transparent",
                color: runsFilter === f.id ? "#2563eb" : "#64748b",
                boxShadow: runsFilter === f.id ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 280 }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 13 }} />
          <input
            type="text"
            placeholder="Search run by tracking ID or receiver..."
            value={runsSearch}
            onChange={(e) => setRunsSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: 12,
              border: "1.5px solid #cbd5e1",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {/* Assigned Runs Cards List */}
      <div style={{ display: "grid", gap: 16 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 }}>Loading assigned runs...</div>
        ) : filteredRuns.length === 0 ? (
          <div style={{ padding: 40, background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", textAlign: "center", color: "#94a3b8" }}>
            <Truck size={40} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>No assigned delivery runs found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Check back when Admin assigns new shipments to your operator account.</div>
          </div>
        ) : (
          filteredRuns.map(s => {
            const badge = getStatusBadgeStyle(s.status);
            const isCurrentUpdating = updatingId === s.id;

            return (
              <div
                key={s.id}
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16
                }}
              >
                {/* Top Row: Tracking ID + Status Pill */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>#{s.trackingNumber}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Assigned Driver: <strong>{s.senderName || currentUser?.username || "Driver Sam"}</strong></div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Middle Row: Route Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#f8fafc", padding: 14, borderRadius: 14, fontSize: 13 }}>
                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Receiver / Customer</span>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{s.receiverName}</div>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Delivery Destination</span>
                    <div style={{ fontWeight: 600, color: "#334155", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={14} color="#2563eb" /> {s.deliveryAddress}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Operator Delivery Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Update Delivery Status:</span>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={isCurrentUpdating || s.status === "IN_TRANSIT"}
                      onClick={() => handleUpdateStatus(s, "IN_TRANSIT")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: s.status === "IN_TRANSIT" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        background: s.status === "IN_TRANSIT" ? "#2563eb" : "#ffffff",
                        color: s.status === "IN_TRANSIT" ? "#ffffff" : "#1e40af",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: s.status === "IN_TRANSIT" ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Truck size={14} /> In Transit
                    </button>

                    <button
                      disabled={isCurrentUpdating || s.status === "OUT_FOR_DELIVERY"}
                      onClick={() => handleUpdateStatus(s, "OUT_FOR_DELIVERY")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: s.status === "OUT_FOR_DELIVERY" ? "1.5px solid #7e22ce" : "1px solid #cbd5e1",
                        background: s.status === "OUT_FOR_DELIVERY" ? "#7e22ce" : "#ffffff",
                        color: s.status === "OUT_FOR_DELIVERY" ? "#ffffff" : "#7e22ce",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: s.status === "OUT_FOR_DELIVERY" ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Navigation size={14} /> Out for Delivery
                    </button>

                    <button
                      disabled={isCurrentUpdating || s.status === "DELIVERED"}
                      onClick={() => handleUpdateStatus(s, "DELIVERED")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: s.status === "DELIVERED" ? "1.5px solid #16a34a" : "1px solid #cbd5e1",
                        background: s.status === "DELIVERED" ? "#16a34a" : "#ffffff",
                        color: s.status === "DELIVERED" ? "#ffffff" : "#15803d",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: s.status === "DELIVERED" ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={14} /> Mark Delivered
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AssignedRuns;
