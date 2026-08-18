import { useEffect, useState } from "react";
import CustomerDashboardCards from "../../components/customer/CustomerDashboardCards";
import MyShipmentTable from "../../components/customer/MyShipmentTable";
import GraphicalAnalytics from "../../components/common/GraphicalAnalytics";
import RequestShipment from "../../components/customer/RequestShipment";
import { getStoredUser } from "../../utils/auth";
import { getAllShipments } from "../../services/shipmentService";
import "../../styles/Dashboard.css";

function CustomerDashboard() {
    const user = getStoredUser();
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getAllShipments();
                setShipments(data);
            } catch (err) {
                console.error("Error loading customer shipments:", err);
            }
        };
        loadData();
    }, []);

    return (
        <div className="customer-dashboard">
            <div className="customer-dashboard-header">
                <div className="customer-dashboard-greeting">
                    <span className="greeting-text">
                        Welcome back, <strong className="greeting-username">{user?.username || "Customer"}</strong>
                    </span>
                </div>
                <p className="customer-dashboard-subtitle">
                    Manage your logistics operations efficiently.
                </p>
                <p className="customer-dashboard-desc">
                    Track, manage, and view real-time delivery schedules for your packages.
                </p>
            </div>

                    <div style={{ display: 'grid', gap: 16 }}>
                        <CustomerDashboardCards />
                        <RequestShipment onRequested={() => { /* refresh list if needed */ }} />
                        <GraphicalAnalytics shipments={shipments} />
                        <MyShipmentTable />
                    </div>
        </div>
    );
}

export default CustomerDashboard;