import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import StatCard from "../../../components/StatCard";
import ShipmentTable from "../../../components/ShipmentTable";
import AnalyticsSection from "../../../components/AnalyticsSection";
import UsersTable from "../../../components/UsersTable";
import QuickActions from "../../../components/QuickActions";
import RecentActivities from "../../../components/RecentActivities";
import Tracking from "../../tracking/Tracking";
import Delivery from "../../delivery/Delivery";
import Reports from "../../../pages/reports/Reports";
import Analytics from "../../../pages/analytics/Analytics";

import { 
    useEffect, useState 
} from "react";

import {
     getDashboardStats
     } from "../../../services/adminService";

import {
    FaUsers,
    FaBoxOpen,
    FaTruck,
    FaCheckCircle
} from "react-icons/fa";

import "../../../styles/StatCard.css";

function AdminDashboard() {


    const [stats, setStats] = useState({

        totalUsers: 0,

        totalShipments: 0,

        activeDeliveries: 0,

        deliveredToday: 0

    });

    const [searchTerm, setSearchTerm] = useState("");
    const [section, setSection] = useState('dashboard');

    useEffect(() => {

        loadDashboard();

        }, []);

        const loadDashboard = async () => {

            try {

                const response = await getDashboardStats();

                setStats(response);

            }

            catch(error){

                console.log(error);

            }

        };

    return (

        <div
            style={{
                display: "flex",
                height: "100vh",
                background: "#f1f5f9"
            }}
        >

            {/* Sidebar */}

            <Sidebar onSelect={setSection} activeSection={section} />

            {/* Right Content */}

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >

                {/* Navbar */}

                <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                {/* Scrollable Content */}

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "25px"
                    }}
                >

                    {/* Dashboard view */}
                    {section === 'dashboard' && (
                        <>
                            <h1>Welcome Admin 👋</h1>

                            <p>
                                Manage shipments, users and logistics from one place.
                            </p>

                            {/* Statistics */}

                            <div className="stats-container">

                                <StatCard
                                    title="Total Users"
                                    value={stats.totalUsers}
                                    icon={<FaUsers />}
                                    color="#2563EB"
                                />

                                <StatCard
                                    title="Total Shipments"
                                    value={stats.totalShipments}
                                    icon={<FaBoxOpen />}
                                    color="#7C3AED"
                                />

                                <StatCard
                                    title="Active Deliveries"
                                    value={stats.activeDeliveries}
                                    icon={<FaTruck />}
                                    color="#F59E0B"
                                />

                                <StatCard
                                    title="Delivered Today"
                                    value={stats.deliveredToday}
                                    icon={<FaCheckCircle />}
                                    color="#22C55E"
                                />

                            </div>

                            {/* Shipment Table */}

                            <ShipmentTable searchTerm={searchTerm} />

                            {/* Charts */}

                            <AnalyticsSection />
                        </>
                    )}

                    {/* Shipments view */}
                    {section === 'shipments' && (
                        <ShipmentTable searchTerm={searchTerm} />
                    )}

                    {/* Users view */}
                    {section === 'users' && (
                        <UsersTable />
                    )}

                    {/* Tracking view */}
                    {section === 'tracking' && (
                        <Tracking />
                    )}

                    {section === 'delivery' && (
                        <Delivery />
                    )}

                    {section === 'analytics' && (
                        <Analytics />
                    )}

                    {section === 'reports' && (
                        <Reports />
                    )}

                    {/* Bottom Section (visible only on Dashboard view) */}
                    {section === 'dashboard' && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "25px",
                                marginTop: "30px",
                                marginBottom: "30px"
                            }}
                        >

                            <QuickActions />

                            <RecentActivities />

                        </div>
                    )}

                </div>

            </div>

        </div>

    );

}

export default AdminDashboard;