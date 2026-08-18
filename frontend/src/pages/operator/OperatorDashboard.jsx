import { useEffect, useState } from "react";
import { Truck, PenTool, CheckCircle2, ArrowRight, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllShipments } from "../../services/shipmentService";
import { getStoredUser } from "../../utils/auth";

export function OperatorDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllShipments();
        setShipments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const inTransitCount = shipments.filter(s => (s.status || "").toUpperCase() === "IN_TRANSIT").length;
  const deliveredCount = shipments.filter(s => (s.status || "").toUpperCase() === "DELIVERED").length;
  const pendingCount = shipments.filter(s => (s.status || "").toUpperCase() === "PENDING" || (s.status || "").toUpperCase() === "REQUESTED").length;

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderRadius: 24,
          padding: "28px 32px",
          marginBottom: 24,
          boxShadow: "0 10px 25px rgba(15,23,42,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "rgba(59, 130, 246, 0.25)", color: "#93c5fd", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
            FIELD OPERATOR CONSOLE
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 4px 0" }}>
            Welcome back, {user?.username || "Driver Sam"}
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            Monitor assigned runs, update live package status, and capture Proof of Delivery (POD).
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/operator/runs")}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
            }}
          >
            <Truck size={18} /> View Assigned Runs
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div style={{ padding: 22, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={22} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Total Runs</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{shipments.length}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 22, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={22} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>In Transit</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#b45309" }}>{inTransitCount}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 22, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#dcfce7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Delivered</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{deliveredCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div
          onClick={() => navigate("/operator/runs")}
          style={{
            padding: 28,
            borderRadius: 20,
            background: "#ffffff",
            border: "1.5px solid #bfdbfe",
            boxShadow: "0 4px 16px rgba(37,99,235,0.06)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Truck size={24} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Assigned Runs</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px 0", lineHeight: 1.5 }}>
            View all shipments assigned to your operator account. Update delivery status to In Transit, Out for Delivery, or Delivered.
          </p>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Open Assigned Runs <ArrowRight size={16} />
          </span>
        </div>

        <div
          onClick={() => navigate("/operator/pod")}
          style={{
            padding: 28,
            borderRadius: 20,
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <PenTool size={24} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>POD Capture</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px 0", lineHeight: 1.5 }}>
            Capture receiver digital signature, photo evidence, and recipient OTP verification for completed package deliveries.
          </p>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#7c3aed", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Open POD Capture <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default OperatorDashboard;
