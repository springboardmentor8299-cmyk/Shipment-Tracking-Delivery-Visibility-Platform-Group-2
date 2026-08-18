import { useEffect, useState } from "react";
import DashboardCards from "../../components/admin/DashboardCards";
import CreateShipment from "../../components/admin/CreateShipment";
import ShipmentTable from "../../components/admin/ShipmentTable";
import GraphicalAnalytics from "../../components/common/GraphicalAnalytics";
import PlatformControlHeader from "../../components/admin/PlatformControlHeader";
import PodDisputeOverrideQueue from "../../components/admin/PodDisputeOverrideQueue";
import AdminRequests from "./Requests";
import { getStoredUser } from "../../utils/auth";
import { getAllShipments } from "../../services/shipmentService";
import "../../styles/Dashboard.css";

function AdminDashboard() {
  const user = getStoredUser();
  const [shipments, setShipments] = useState([]);

  const loadData = async () => {
    try {
      const data = await getAllShipments();
      setShipments(data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="admin-dashboard" style={{ paddingTop: 0 }}>
      {/* 1. Header Banner Component */}
      <PlatformControlHeader username={user?.username || "Admin"} />

      {/* 2. Admin Metric Cards & Analytics */}
      <DashboardCards />
      <GraphicalAnalytics shipments={shipments} />

      {/* 3. Dedicated POD Dispute Executive Override Queue Component */}
      <PodDisputeOverrideQueue onOverrideSuccess={loadData} />

      {/* 3b. Pending shipment requests from customers */}
      <AdminRequests />

      {/* 4. Shipment Management Components */}
      <CreateShipment onCreated={loadData} />
      <div style={{ marginTop: 24 }}>
        <ShipmentTable />
      </div>
    </div>
  );
}

export default AdminDashboard;
