import React, { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, ShieldCheck, MapPin, Activity } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";
import TrendChart from "../../components/common/TrendChart";
import DelayHeatmap from "../../components/common/DelayHeatmap";

export function DelayAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
      const res = await axios.get("http://localhost:8080/api/analytics/business/101", { headers });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading delay analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
        Loading Delay & Traffic Analytics...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)",
          color: "#ffffff",
          padding: "24px 28px",
          borderRadius: 24,
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          border: "1px solid #334155"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(245, 158, 11, 0.25)",
                color: "#fde68a",
                border: "1px solid rgba(253, 230, 138, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.6px"
              }}
            >
              Risk & Traffic Intelligence
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#ffffff",
              margin: "4px 0",
              letterSpacing: "-0.5px"
            }}
          >
            Delay Analytics
          </h1>
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
            Identify delay risk factors, bottleneck corridors, and real-time regional transit metrics.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "10px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <Activity size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>Network Status</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#34d399" }}>Optimal (96% SLA)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Trend Chart & Heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <TrendChart
            title="Weekly Shipment Volume & Dispatch Trend"
            type="line"
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            datasets={[
              {
                label: "Dispatch Volume",
                data: [24, 32, 28, 45, 38, 20, 15],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                fill: true,
                tension: 0.4
              }
            ]}
          />
        </div>

        <div style={{ flex: 1 }}>
          <DelayHeatmap data={analytics?.delayByRegion} />
        </div>
      </div>

      {/* Regional Operational Insights */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>
          Operational Route Recommendations
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={20} color="#16a34a" />
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>South India Corridor</h4>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
              Maintaining a 2.1% delay rate. Transit between Bengaluru, Chennai, and Hyderabad is operating at peak SLA efficiency.
            </p>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <AlertTriangle size={20} color="#d97706" />
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>West India Corridor</h4>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
              Moderate risk detected (6.8% delay rate) around Mumbai Port express routes due to monsoon traffic congestion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DelayAnalytics;
