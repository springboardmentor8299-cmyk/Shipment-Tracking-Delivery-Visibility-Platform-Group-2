import { useEffect, useState } from "react";

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


import {
    FaBoxOpen,
    FaTruck,
    FaHeadset,
    FaCheckCircle
} from "react-icons/fa";

import "../../../styles/StatCard.css";
import Reports from "../../reports/Reports";

function SupportDashboard() {

    const [stats, setStats] = useState({

        totalShipments: 0,
        activeDeliveries: 0,
        openTickets: 0,
        resolvedToday: 0

    });

    const [section, setSection] = useState("dashboard");

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const response = await getSupportDashboard();

            setStats(response);

        }

        catch (error) {

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

            <SupportSidebar
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

                <SupportNavbar
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

                    {section === "dashboard" && (

                        <>

                            <h1>
                                Welcome Support Agent 🎧
                            </h1>

                            <p>
                                Monitor shipments and assist customers.
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

                            <SupportShipmentTable
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

                    {section === "shipments" && (

                        <SupportShipmentTable
                            searchTerm={searchTerm}
                        />

                    )}

                    {section === "tracking" && (

                        <Tracking />

                    )}

                    {section === "delivery" && (

                        <Delivery />

                    )}

                    {section === "tickets" && (

                        <SupportTicketTable />

                    )}

                    {section === "notifications" && (

                        <h2>
                            🔔 Notifications Module Coming Soon...
                        </h2>

                    )}

                    {section === "reports" && (

                       <Reports/>

                    )}

                </div>

            </div>

        </div>

    );

}

export default SupportDashboard;