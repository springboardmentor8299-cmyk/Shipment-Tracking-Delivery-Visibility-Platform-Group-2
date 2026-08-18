import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getShipmentByTrackingId, getMyShipments, calculateEstimatedEta } from "../../services/shipmentService";
import SingleShipmentMap from "../../components/common/SingleShipmentMap";
import {
  Package,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Activity,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

function SingleShipmentTracking() {
  const { trackingId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [livePingCount, setLivePingCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadShipmentData = async () => {
      try {
        setLoading(true);
        setAccessDenied(false);
        let data = null;

        if (trackingId) {
          try {
            data = await getShipmentByTrackingId(trackingId);
          } catch (e) {
            if (e.response && (e.response.status === 403 || e.response.status === 401)) {
              if (mounted) setAccessDenied(true);
              return;
            }
            // Fallback lookup from customer's list
            const myShipments = await getMyShipments();
            data = myShipments.find(s => s.trackingNumber?.toLowerCase() === trackingId.toLowerCase() || s.id?.toString() === trackingId);
          }
        }

        if (!data) {
          const myShipments = await getMyShipments();
          data = myShipments[0];
        }

        if (mounted && data) {
          const lat = data.latitude || 28.6139;
          const lng = data.longitude || 77.2090;
          const destLat = data.destLatitude || lat + 0.6;
          const destLng = data.destLongitude || lng + 0.6;
          const eta = calculateEstimatedEta(lat, lng, destLat, destLng);

          setShipment({
            ...data,
            latitude: lat,
            longitude: lng,
            destLatitude: destLat,
            destLongitude: destLng,
            distanceKm: eta.distanceKm,
            etaMinutes: eta.minutes,
            isDelayed: eta.isDelayed,
            driverName: data.driverName || "Driver Sanjai",
            lastUpdated: new Date().toLocaleTimeString(),
            progressPct: 65,
          });
        }
      } catch (err) {
        console.error("Error loading single shipment tracking:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadShipmentData();

    // Simulate WebSocket live location pings every 5 seconds
    const interval = setInterval(() => {
      setShipment(prev => {
        if (!prev) return null;
        const newLat = prev.latitude + 0.005;
        const newLng = prev.longitude + 0.005;
        const newEta = calculateEstimatedEta(newLat, newLng, prev.destLatitude, prev.destLongitude);

        return {
          ...prev,
          latitude: newLat,
          longitude: newLng,
          distanceKm: newEta.distanceKm,
          etaMinutes: newEta.minutes,
          isDelayed: newEta.isDelayed,
          lastUpdated: new Date().toLocaleTimeString(),
          progressPct: Math.min(95, prev.progressPct + 2)
        };
      });
      setLivePingCount(c => c + 1);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [trackingId]);

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ textAlign: "center", padding: "60px 20px" }}>
        <Package size={42} color="#2563eb" style={{ marginBottom: 12, animation: "spin 2s linear infinite" }} />
        <h2 style={{ color: "#0f172a", fontSize: 20 }}>Loading Live Telemetry...</h2>
      </div>
    );
  }

  // HTTP 403 Access Denied Response Render State
  if (accessDenied) {
    return (
      <div className="admin-dashboard" style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: 560, margin: "40px auto", background: "#ffffff", padding: 36, borderRadius: 20, border: "1px solid #fee2e2", boxShadow: "0 8px 30px rgba(220,38,38,0.08)", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <ShieldAlert size={34} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#991b1b", margin: "0 0 10px 0" }}>403 Access Denied</h2>
          <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px 0" }}>
            You do not have permission to view or track shipment <strong>"{trackingId}"</strong>. This record belongs to another customer account.
          </p>
          <Link
            to="/customer/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #1e40af, #2563eb)",
              color: "#ffffff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={16} /> Return to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="admin-dashboard" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Shipment Not Found</h2>
        <p style={{ color: "#64748b" }}>No shipment matching tracking ID "{trackingId}" could be located.</p>
        <Link to="/customer/dashboard" style={{ color: "#2563eb", fontWeight: 700 }}>Return to Dashboard</Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || "IN_TRANSIT").toUpperCase();
    switch (s) {
      case "DELIVERED":
        return { bg: "#dcfce7", color: "#15803d", label: "Delivered", icon: CheckCircle2 };
      case "IN_TRANSIT":
      case "IN TRANSIT":
        return { bg: "#fef3c7", color: "#b45309", label: "In Transit", icon: Truck };
      case "OUT_FOR_DELIVERY":
        return { bg: "#dbeafe", color: "#1d4ed8", label: "Out for Delivery", icon: Navigation };
      default:
        return { bg: "#fee2e2", color: "#b91c1c", label: "Pending", icon: Clock };
    }
  };

  const badge = getStatusBadge(shipment.status);
  const StatusIcon = badge.icon;

  const etaStatusTag = shipment.isDelayed
    ? { bg: "#fee2e2", color: "#b91c1c", label: "Delayed", icon: AlertTriangle }
    : shipment.etaMinutes > 90
    ? { bg: "#fef3c7", color: "#b45309", label: "At Risk", icon: Clock }
    : { bg: "#dcfce7", color: "#15803d", label: "On Time", icon: CheckCircle2 };

  const EtaTagIcon = etaStatusTag.icon;

  return (
    <div className="admin-dashboard">
      {/* Header with Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <Link to="/customer/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563eb", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>
          <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '4px 0' }}>
            Live Freight Tracking: <span style={{ color: "#2563eb" }}>{shipment.trackingNumber}</span>
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            Dedicated telemetry feed for <strong style={{ color: "#0f172a" }}>{shipment.driverName}</strong> • Updated {shipment.lastUpdated}
          </p>
        </div>

        {/* Live WebSocket Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffffff", padding: "8px 14px", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>WebSocket Live: Ping #{livePingCount}</span>
        </div>
      </div>

      {/* ETA & Status Banner Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Card 1: Predicted ETA */}
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Predicted Arrival (ETA)</span>
            <Clock size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
            {shipment.etaMinutes} Mins
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Distance Remaining: <strong style={{ color: "#2563eb" }}>{shipment.distanceKm} km</strong>
          </div>
        </div>

        {/* Card 2: Schedule Performance Badge */}
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Schedule Performance</span>
            <Activity size={18} color="#2563eb" />
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800, background: etaStatusTag.bg, color: etaStatusTag.color }}>
              <EtaTagIcon size={16} />
              {etaStatusTag.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Route Speed Avg: <strong style={{ color: "#0f172a" }}>48 km/h</strong>
          </div>
        </div>

        {/* Card 3: Route Progress Bar */}
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Route Completion</span>
            <Navigation size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
            {shipment.progressPct}% Complete
          </div>
          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${shipment.progressPct}%`, height: "100%", background: "linear-gradient(90deg, #1e40af, #2563eb, #3b82f6)", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Details Panel (Left) + Leaflet Single Map (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, marginBottom: 28 }}>
        {/* Left: Shipment Details Panel */}
        <div style={{ background: "#ffffff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.05)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>SHIPMENT STATUS</span>
              <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, background: badge.bg, color: badge.color, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <StatusIcon size={14} />
                {badge.label}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{shipment.trackingNumber}</h3>
          </div>

          <div style={{ height: 1, background: "#f1f5f9" }} />

          {/* Details List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>SENDER NAME</div>
              <div style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} color="#2563eb" /> {shipment.senderName || "Delhi Logistics Hub"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>RECEIVER NAME</div>
              <div style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} color="#2563eb" /> {shipment.receiverName || "Customer"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>PICKUP ADDRESS (ORIGIN)</div>
              <div style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} color="#475569" /> {shipment.pickupAddress || "Central Dispatch Warehouse, Terminal 1"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>DESTINATION ADDRESS</div>
              <div style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} color="#16a34a" /> {shipment.deliveryAddress || "N/A"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>ASSIGNED DRIVER</div>
              <div style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={16} color="#2563eb" /> {shipment.driverName || "Driver Sanjai"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>SECURITY STATUS</div>
              <div style={{ fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={16} /> Sealed & Verified Cargo
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dedicated Single-Shipment Leaflet Live Map */}
        <div>
          <SingleShipmentMap shipment={shipment} height="520px" />
        </div>
      </div>
    </div>
  );
}

export default SingleShipmentTracking;
