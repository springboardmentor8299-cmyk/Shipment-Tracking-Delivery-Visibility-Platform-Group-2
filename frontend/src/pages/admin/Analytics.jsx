import { useEffect, useState } from "react";
import GraphicalAnalytics from "../../components/common/GraphicalAnalytics";
import DashboardCards from "../../components/admin/DashboardCards";
import { getAllShipments } from "../../services/shipmentService";

function Analytics() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const data = await getAllShipments();
        setShipments(data);
      } catch (err) {
        console.error("Failed to load analytics shipments:", err);
      }
    };
    loadShipments();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="customer-dashboard-header">
        <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Analytics & Insights</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>Visualize shipment performance, delivery speed, and operational fleet metrics.</p>
      </div>

      <DashboardCards />
      <GraphicalAnalytics shipments={shipments} />
    </div>
  );
}

export default Analytics;
