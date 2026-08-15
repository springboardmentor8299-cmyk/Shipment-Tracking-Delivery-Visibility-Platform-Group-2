import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CustomerSidebar from "../../../components/CustomerSidebar";
import CustomerNavbar from "../../../components/CustomerNavbar";
import CustomerStatCard from "../../../components/CustomerStatCard";
import CustomerShipmentTable from "../../../components/CustomerShipmentTable";
import CustomerTracking from "./CustomerTracking";
import CustomerProfile from "./CustomerProfile";
import CustomerNotifications from "./CustomerNotifications";

import { getCustomerDashboard } from "../../../services/customerService";

import { FaBoxOpen, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";

import CustomerSupport from "./support/CustomerSupport";

import "../../../styles/StatCard.css";

function CustomerDashboard() {
  // Section is stored in the URL (?section=xyz) instead of local state so
  // that every sidebar/navbar click creates a real browser history entry,
  // letting the Back button step through sections instead of jumping to login.
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") || "dashboard";
  const setSection = (key) => {
    setSearchParams(key === "dashboard" ? {} : { section: key });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState(null);

  const [stats, setStats] = useState({
    totalShipments: 0,
    active: 0,
    delivered: 0,
    pending: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getCustomerDashboard();
      setStats(response);
    } catch (error) {
      console.log(error);
    }
  };

  // Callback when a new shipment is created from the table modal
  const handleAddNewShipment = (newShipment) => {
    setStats((prevStats) => ({
      ...prevStats,
      totalShipments: prevStats.totalShipments + 1,
      pending: prevStats.pending + 1,
    }));
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9" }}>
      <CustomerSidebar onSelect={setSection} activeSection={section} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <CustomerNavbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNavigate={setSection}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: "25px" }}>
          {section === "dashboard" && (
            <>
              <h1>Welcome Customer 👋</h1>
              <p>Track your shipments and delivery status.</p>

              <div className="stats-container">
                <CustomerStatCard
                  title="Total Shipments"
                  value={stats.totalShipments}
                  icon={<FaBoxOpen />}
                  color="#2563EB"
                />
                <CustomerStatCard
                  title="In Transit"
                  value={stats.active}
                  icon={<FaTruck />}
                  color="#F59E0B"
                />
                <CustomerStatCard
                  title="Delivered"
                  value={stats.delivered}
                  icon={<FaCheckCircle />}
                  color="#22C55E"
                />
                <CustomerStatCard
                  title="Pending"
                  value={stats.pending}
                  icon={<FaClock />}
                  color="#EF4444"
                />
              </div>

              <CustomerShipmentTable
                searchTerm={searchTerm}
                onTrack={(trackingId) => {
                  setSelectedTrackingId(trackingId);
                  setSection("tracking");
                }}
                onAddShipment={handleAddNewShipment}
              />
            </>
          )}

          {section === "tracking" && (
            <CustomerTracking trackingId={selectedTrackingId} />
          )}

          {section === "profile" && <CustomerProfile />}

          {section === "support" && <CustomerSupport />}

          {section === "notifications" && <CustomerNotifications />}
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
