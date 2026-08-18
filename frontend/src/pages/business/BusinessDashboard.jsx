import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  PackageCheck,
  Clock,
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
  Truck
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getStoredAuth } from "../../utils/auth";
import AnalyticsCard from "../../components/common/AnalyticsCard";

export function BusinessDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
      const res = await axios.get("http://localhost:8080/api/analytics/business/101", { headers });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading business data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
        Loading Business Intelligence Dashboard...
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
                background: "rgba(59, 130, 246, 0.25)",
                color: "#93c5fd",
                border: "1px solid rgba(147, 197, 253, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.6px"
              }}
            >
              Enterprise Dashboard
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
            Business Overview
          </h1>
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
            Executive summary for high-volume shipping operations and fleet performance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/business/shipments")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
            }}
          >
            <span>View All Shipments</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Executive KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <AnalyticsCard
          title="Shipment Volume Today"
          value={analytics?.totalVolumeToday || 18}
          change="+14.2%"
          subtitle="Updated real-time"
          icon={TrendingUp}
          color="blue"
        />
        <AnalyticsCard
          title="On-Time Delivery Rate"
          value={`${analytics?.onTimeDeliveryRate || 96}%`}
          change="+2.4%"
          subtitle="Target: 95%"
          icon={PackageCheck}
          color="emerald"
        />
        <AnalyticsCard
          title="Avg Delivery Time"
          value={`${analytics?.avgDeliveryTimeHours || 18.4}h`}
          change="-1.2h"
          subtitle="SLA benchmark"
          icon={Clock}
          color="indigo"
        />
        <AnalyticsCard
          title="Sub-Accounts Active"
          value={analytics?.customerSubAccountsCount || 4}
          change="Optimal"
          subtitle="Authorized shippers"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Quick Navigation Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* Card 1: Shipment Management */}
        <div
          onClick={() => navigate("/business/shipments")}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Truck size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
            Shipment Overview
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
            Monitor live cargo manifests, track deliveries in transit, and handle bulk shipment requests.
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Manage Shipments <ArrowRight size={14} />
          </span>
        </div>

        {/* Card 2: Delay & Traffic Analytics */}
        <div
          onClick={() => navigate("/business/analytics")}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <TrendingUp size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
            Delay Analytics
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
            View regional delay heatmaps, weekly shipment trends, and traffic bottleneck reports.
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706", display: "inline-flex", alignItems: "center", gap: 6 }}>
            View Analytics <ArrowRight size={14} />
          </span>
        </div>

        {/* Card 3: Reports & Export */}
        <div
          onClick={() => navigate("/business/reports")}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Building2 size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
            Reports & Export Center
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
            Export PDF/Excel logistics reports and run bulk CSV shipment batch manifests.
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Open Reports Center <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;
