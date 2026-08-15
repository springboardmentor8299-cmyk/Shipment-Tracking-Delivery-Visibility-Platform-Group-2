import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SupportSidebar from "../../../components/support_agent/SupportSidebar";
import SupportNavbar from "../../../components/support_agent/SupportNavbar";
import SupportShipmentTable from "../../../components/support_agent/SupportShipmentTable";
import SupportTicketTable from "../../../components/support_agent/TicketTable";

import StatCard from "../../../components/StatCard";
import QuickActions from "../../../components/QuickActions";
import RecentActivities from "../../../components/RecentActivities";

import Tracking from "../../tracking/Tracking";
import Delivery from "../../delivery/Delivery";

import { getSupportDashboard } from "../../../services/supportService";
import SupportRequestTable from "../../../components/support_agent/SupportRequestTable";

import { FaBoxOpen, FaTruck, FaHeadset, FaCheckCircle } from "react-icons/fa";

import Notifications from "../../notification/Notifications";

import "../../../styles/StatCard.css";
import Reports from "../../reports/Reports";

function SupportDashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeDeliveries: 0,
    openTickets: 0,
    resolvedToday: 0,
  });

  // Section is stored in the URL (?section=xyz) instead of local state so
  // that every sidebar/navbar click creates a real browser history entry,
  // letting the Back button step through sections instead of jumping to login.
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") || "dashboard";
  const setSection = (key) => {
    setSearchParams(key === "dashboard" ? {} : { section: key });
  };

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getSupportDashboard();

      setStats(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f1f5f9",
      }}
    >
      <SupportSidebar onSelect={setSection} activeSection={section} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <SupportNavbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "25px",
          }}
        >
          {section === "dashboard" && (
            <>
              <h1>Welcome Support Agent 🎧</h1>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Monitor shipments and assist customers.
              </p>

              {/* Stat Cards Row */}
              <div className="stats-container">
                <StatCard
                  title="Total Shipments"
                  value={stats.totalShipments}
                  icon={<FaBoxOpen />}
                  color="#2563EB"
                />
                <StatCard
                  title="Active Deliveries"
                  value={stats.activeDeliveries}
                  icon={<FaTruck />}
                  color="#F59E0B"
                />
                <StatCard
                  title="Open Tickets"
                  value={stats.openTickets}
                  icon={<FaHeadset />}
                  color="#8B5CF6"
                />
                <StatCard
                  title="Resolved Today"
                  value={stats.resolvedToday}
                  icon={<FaCheckCircle />}
                  color="#22C55E"
                />
              </div>

              {/* Shipments Section */}
              <div style={{ marginTop: "25px" }}>
                <SupportShipmentTable searchTerm={searchTerm} />
              </div>

              {/* Support Requests & Quick Actions Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr", // 2/3 for table, 1/3 for quick actions
                  gap: "25px",
                  marginTop: "30px",
                  marginBottom: "30px",
                  alignItems: "start",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  {" "}
                  {/* Fixes CSS grid overflow */}
                  <SupportRequestTable showAssign={false} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <RecentActivities />
                </div>
              </div>
            </>
          )}

          {section === "shipments" && (
            <SupportShipmentTable searchTerm={searchTerm} />
          )}

          {section === "tracking" && <Tracking />}

          {section === "delivery" && <Delivery />}

          {section === "tickets" && <SupportTicketTable />}

          {section === "notifications" && <Notifications />}

          {section === "reports" && <Reports />}
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;
