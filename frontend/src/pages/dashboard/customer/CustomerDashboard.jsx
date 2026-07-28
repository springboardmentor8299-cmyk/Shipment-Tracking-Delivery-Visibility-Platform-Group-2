import { useEffect, useState } from "react";

import CustomerSidebar from "../../../components/CustomerSidebar";
import CustomerNavbar from "../../../components/CustomerNavbar";
import CustomerStatCard from "../../../components/CustomerStatCard";
import CustomerShipmentTable from "../../../components/CustomerShipmentTable";
import CustomerTracking from "./CustomerTracking";
import CustomerProfile from "./CustomerProfile";

import { getCustomerDashboard } from "../../../services/customerService";

import { FaBoxOpen, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";

import "../../../styles/StatCard.css";

function CustomerDashboard() {
    const [section, setSection] = useState("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTrackingId, setSelectedTrackingId] = useState(null);

    const [stats, setStats] = useState({
        totalShipments: 0,
        active: 0,
        delivered: 0,
        pending: 0
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
            pending: prevStats.pending + 1
        }));
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#f1f5f9" }}>
            <CustomerSidebar onSelect={setSection} activeSection={section} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <CustomerNavbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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

                    {section === "support" && <h2>Support Coming Soon...</h2>}

                    {section === "notifications" && <h2>Notifications Coming Soon...</h2>}
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboard;