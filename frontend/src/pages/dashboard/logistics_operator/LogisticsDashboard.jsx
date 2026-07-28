import { useEffect, useState } from "react";

import OperatorSidebar from "../../../components/operator/OperatorSidebar";
import OperatorNavbar from "../../../components/operator/OperatorNavbar";
import OperatorShipmentTable from "../../../components/operator/OperatorShipmentTable";

import StatCard from "../../../components/StatCard";
import QuickActions from "../../../components/QuickActions";
import RecentActivities from "../../../components/RecentActivities";

import Tracking from "../../tracking/Tracking";
import Delivery from "../../delivery/Delivery";

import { getOperatorDashboard } from "../../../services/operatorService";

import {
    FaBoxOpen,
    FaTruck,
    FaMapMarkerAlt,
    FaCheckCircle
} from "react-icons/fa";

import "../../../styles/StatCard.css";

function LogisticsDashboard() {

    const [stats, setStats] = useState({

        totalShipments: 0,
        activeDeliveries: 0,
        routesAssigned: 0,
        deliveredToday: 0

    });

    const [section, setSection] = useState("dashboard");

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
            deliveredToday: data.deliveredToday

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
                background: "#f1f5f9"
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
                    overflow: "hidden"
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
                        padding: "25px"
                    }}
                >

                    {/* Dashboard */}

                    {section === "dashboard" && (

                        <>

                            <h1>Welcome Logistics Operator 🚚</h1>

                            <p>
                                Manage shipments and delivery operations.
                            </p>

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

                            <OperatorShipmentTable
                                searchTerm={searchTerm}
                            />

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

                        </>

                    )}

                    {/* Shipments */}

                    {section === "shipments" && (

                        <OperatorShipmentTable
                            searchTerm={searchTerm}
                        />

                    )}

                    {/* Tracking */}

                    {section === "tracking" && (

                        <Tracking />

                    )}

                    {/* Delivery */}

                    {section === "delivery" && (

                        <Delivery />

                    )}

                    {/* Routes */}

                    {section === "routes" && (

                        <h2>🚚 Routes Module Coming Soon...</h2>

                    )}

                    {/* Proof of Delivery */}

                    {section === "proof" && (

                        <h2>📷 Proof Of Delivery Coming Soon...</h2>

                    )}

                    {/* Notifications */}

                    {section === "notifications" && (

                        <h2>🔔 Notifications Coming Soon...</h2>

                    )}

                </div>

            </div>

        </div>

    );

}

export default LogisticsDashboard;