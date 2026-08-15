import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import OperatorSidebar from "../../../components/operator/OperatorSidebar";
import OperatorNavbar from "../../../components/operator/OperatorNavbar";
import OperatorShipmentTable from "../../../components/operator/OperatorShipmentTable";

import StatCard from "../../../components/StatCard";
import QuickActions from "../../../components/QuickActions";

import Tracking from "../../tracking/Tracking";
import Delivery from "../../delivery/Delivery";

import RouteManagement from "../../../components/RouteManagement";
import ProofOfDelivery from "../../pod/ProofOfDelivery";
import DriverManagement from "../../../components/operator/DriverManagement";

import { getOperatorDashboard } from "../../../services/operatorService";

import {
  FaBoxOpen,
  FaTruck,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

import "../../../styles/StatCard.css";
import Notifications from "../../notification/Notifications";

function LogisticsDashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeDeliveries: 0,
    routesAssigned: 0,
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
      const data = await getOperatorDashboard();

      setStats({
        totalShipments: data.totalShipments,
        activeDeliveries: data.activeDeliveries,
        routesAssigned: data.routesAssigned,
        deliveredToday: data.deliveredToday,
      });
    } catch (error) {
      console.error("Failed to load dashboard", error);
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
      <OperatorSidebar
        role="LOGISTICS_OPERATOR"
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
        <OperatorNavbar
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
          {/* Dashboard */}

          {section === "dashboard" && (
            <>
              <h1>Welcome Logistics Operator 🚚</h1>

              <p>Manage shipments and delivery operations.</p>

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
                  title="Assigned Routes"
                  value={stats.routesAssigned}
                  icon={<FaMapMarkerAlt />}
                  color="#8B5CF6"
                />

                <StatCard
                  title="Delivered Today"
                  value={stats.deliveredToday}
                  icon={<FaCheckCircle />}
                  color="#22C55E"
                />
              </div>

              <OperatorShipmentTable searchTerm={searchTerm} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "25px",
                  marginTop: "30px",
                  marginBottom: "30px",
                }}
              >
                <QuickActions />
              </div>
            </>
          )}

          {/* Shipments */}

          {section === "shipments" && (
            <OperatorShipmentTable searchTerm={searchTerm} />
          )}

          {/* Tracking */}

          {section === "tracking" && <Tracking />}

          {section === "delivery" && <Delivery />}

          {section === "routes" && <RouteManagement />}

          {section === "drivers" && <DriverManagement />}

          {section === "proof" && <ProofOfDelivery />}

          {section === "notifications" && <Notifications />}
        </div>
      </div>
    </div>
  );
}

export default LogisticsDashboard;
