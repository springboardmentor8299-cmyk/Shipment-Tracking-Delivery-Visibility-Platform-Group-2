import {
    FaTachometerAlt,
    FaBoxOpen,
    FaMapMarkedAlt,
    FaTruck,
    FaRoute,
    FaCamera,
    FaBell,
    FaSignOutAlt,
    FaBars
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Sidebar.css";

function OperatorSidebar({ onSelect, activeSection }) {

    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const select = (key) => {
        if (onSelect) onSelect(key);
    };

    return (

        <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

            <div className="sidebar-header">

                <button
                    className="menu-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <FaBars />
                </button>

                {!collapsed && <h2>ShipTrack</h2>}

            </div>

            <ul>

                <li
                    className={activeSection === "dashboard" ? "active" : ""}
                    onClick={() => select("dashboard")}
                >
                    <FaTachometerAlt />
                    {!collapsed && <span>Dashboard</span>}
                </li>

                <li
                    className={activeSection === "shipments" ? "active" : ""}
                    onClick={() => select("shipments")}
                >
                    <FaBoxOpen />
                    {!collapsed && <span>Shipments</span>}
                </li>

                <li
                    className={activeSection === "tracking" ? "active" : ""}
                    onClick={() => select("tracking")}
                >
                    <FaMapMarkedAlt />
                    {!collapsed && <span>Tracking</span>}
                </li>

                <li
                    className={activeSection === "delivery" ? "active" : ""}
                    onClick={() => select("delivery")}
                >
                    <FaTruck />
                    {!collapsed && <span>Delivery</span>}
                </li>

                <li
                    className={activeSection === "routes" ? "active" : ""}
                    onClick={() => select("routes")}
                >
                    <FaRoute />
                    {!collapsed && <span>Routes</span>}
                </li>

                <li
                    className={activeSection === "proof" ? "active" : ""}
                    onClick={() => select("proof")}
                >
                    <FaCamera />
                    {!collapsed && <span>Proof Of Delivery</span>}
                </li>

                <li
                    className={activeSection === "notifications" ? "active" : ""}
                    onClick={() => select("notifications")}
                >
                    <FaBell />
                    {!collapsed && <span>Notifications</span>}
                </li>

            </ul>

            <div
                className="logout"
                onClick={() => navigate("/logout")}
                style={{ cursor: "pointer" }}
            >
                <FaSignOutAlt />
                {!collapsed && <span>Logout</span>}
            </div>

        </div>

    );
}

export default OperatorSidebar;