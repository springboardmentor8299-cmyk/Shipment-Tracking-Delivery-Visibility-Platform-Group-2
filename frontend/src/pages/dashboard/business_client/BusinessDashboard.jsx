import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import BusinessSidebar from "../../../components/business_client/BusinessSidebar";
import BusinessNavbar from "../../../components/business_client/BusinessNavbar";
import BusinessShipmentTable from "../../../components/business_client/BusinessShipmentTable";

import StatCard from "../../../components/StatCard";
import QuickActions from "../../../components/QuickActions";
import RecentActivities from "../../../components/RecentActivities";

import Tracking from "../../tracking/Tracking";
import Delivery from "../../delivery/Delivery";

import Reports from "../../reports/Reports";

import {
  FaBoxOpen,
  FaTruck,
  FaMapMarkedAlt,
  FaCheckCircle,
} from "react-icons/fa";

import { getBusinessDashboard } from "../../../services/businessService";

import "../../../styles/StatCard.css";

import Notifications from "../../notification/Notifications";

function BusinessDashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeDeliveries: 0,
    shipmentsInTransit: 0,
    deliveredToday: 0,
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
      const data = await getBusinessDashboard();

      setStats(data);
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
      <BusinessSidebar
        role="BUSINESS_CLIENT"
        onSelect={setSection}
        activeSection={section}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <BusinessNavbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "25px",
          }}
        >
          {section === "dashboard" && (
            <>
              <h1>Welcome Business Client 💼</h1>

              <p>Track your shipments and monitor deliveries.</p>

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
                  title="In Transit"
                  value={stats.shipmentsInTransit}
                  icon={<FaMapMarkedAlt />}
                  color="#8B5CF6"
                />

                <StatCard
                  title="Delivered Today"
                  value={stats.deliveredToday}
                  icon={<FaCheckCircle />}
                  color="#22C55E"
                />
              </div>

              <BusinessShipmentTable searchTerm={searchTerm} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "25px",
                  marginTop: "30px",
                  marginBottom: "30px",
                }}
              ></div>
            </>
          )}

          {section === "delivery" && <Delivery />}

          {section === "dashboard" && null}

          {section === "reports" && <Reports />}

          {section === "notifications" && <Notifications />}
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;
