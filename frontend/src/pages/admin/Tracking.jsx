import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllShipments } from "../../services/shipmentService";
import ShipmentMap from "../../components/common/ShipmentMap";
import { Search, MapPin, User, Package, CheckCircle2, Clock, Truck as TruckIcon, ExternalLink } from "lucide-react";

function Trackings() {
  const [query, setQuery] = useState("");
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchShipments = async () => {
      const result = await getAllShipments();
      if (mounted) setShipments(result);
    };
    fetchShipments();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = shipments.filter((shipment) =>
    query.trim() === "" ? true : shipment.trackingNumber?.toLowerCase().includes(query.toLowerCase())
  );

  const displayedShipments = filtered.length ? filtered : shipments;

  const shipmentsWithLocation = displayedShipments.filter(
    (s) => s.latitude != null && s.longitude != null
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return { bg: "#dcfce7", color: "#15803d", label: "Delivered", icon: CheckCircle2 };
      case "IN_TRANSIT":
        return { bg: "#fef3c7", color: "#b45309", label: "In Transit", icon: TruckIcon };
      default:
        return { bg: "#fee2e2", color: "#b91c1c", label: "Pending", icon: Clock };
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="customer-dashboard-header">
        <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Shipment Tracking Overview</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>Multi-shipment overview feed. Click any shipment to drill down into its dedicated live tracking view.</p>
      </div>

      <div style={{ marginBottom: 24, maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', gap: 10, boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracking ID..."
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14, color: '#0f172a' }}
          />
        </div>
      </div>

      {/* Multi-Shipment Overview Map */}
      <div style={{ marginBottom: 28, borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.05)' }}>
        <ShipmentMap shipments={shipmentsWithLocation} />
      </div>

      {/* Shipment Cards Grid with Drill-Down Action Link */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {displayedShipments.map((shipment) => {
          const badge = getStatusBadge(shipment.status);
          const BadgeIcon = badge.icon;

          return (
            <div key={shipment.id} style={{ padding: 22, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={18} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{shipment.trackingNumber}</h3>
                  </div>

                  <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, display: "flex", alignItems: "center", gap: 5 }}>
                    <BadgeIcon size={13} />
                    {badge.label}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#475569", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={15} color="#94a3b8" />
                    <span>Receiver: <strong style={{ color: "#0f172a" }}>{shipment.receiverName || "N/A"}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#94a3b8" />
                    <span>Address: {shipment.deliveryAddress || "N/A"}</span>
                  </div>
                  {shipment.etaMinutes && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#2563eb", fontWeight: 700 }}>
                      <Clock size={15} />
                      <span>ETA: {shipment.etaMinutes} mins ({shipment.distanceKm || '12.5'} km)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Click-through button to jump into Single Shipment Live View */}
              <Link
                to={`/admin/tracking/${shipment.trackingNumber}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#f1f5f9",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2563eb";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#2563eb";
                }}
              >
                <span>Live Tracking & Route</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Trackings;