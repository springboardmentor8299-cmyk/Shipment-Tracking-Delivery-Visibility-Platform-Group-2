import {
    FaTachometerAlt,
    FaBoxOpen,
    FaMapMarkedAlt,
    FaUser,
    FaBell,
    FaSignOutAlt,
    FaBars
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Sidebar.css";

function CustomerSidebar({ onSelect, activeSection }) {

    const [collapsed, setCollapsed] = useState(false);

    const navigate = useNavigate();

    const select = (key) => {
        if (onSelect) {
            onSelect(key);
        }
    };

    return (

        <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

            {/* Header */}

            <div className="sidebar-header">

                <button
                    className="menu-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <FaBars />
                </button>

                {!collapsed && <h2>ShipTrack</h2>}

            </div>

            {/* Menu */}

            <ul>

                <li
                    className={activeSection === "dashboard" ? "active" : ""}
                    onClick={() => select("dashboard")}
                >
                    <FaTachometerAlt />
                    {!collapsed && <span>Dashboard</span>}
                </li>


                <li
                    className={activeSection === "tracking" ? "active" : ""}
                    onClick={() => select("tracking")}
                >
                    <FaMapMarkedAlt />
                    {!collapsed && <span>Track Shipment</span>}
                </li>

                <li
                    className={activeSection === "profile" ? "active" : ""}
                    onClick={() => select("profile")}
                >
                    <FaUser />
                    {!collapsed && <span>My Profile</span>}
                </li>

                <li
                    className={activeSection === "support" ? "active" : ""}
                    onClick={() => select("support")}
                >
                    <FaBell />
                    {!collapsed && <span>Support</span>}
                </li>

                <li
                    className={activeSection === "notifications" ? "active" : ""}
                    onClick={() => select("notifications")}
                >
                    <FaBell />
                    {!collapsed && <span>Notifications</span>}
                </li>

            </ul>

            {/* Logout */}

            <div
                className="logout"
                style={{ cursor: "pointer" }}
                onClick={() => {

                    localStorage.clear();

                    navigate("/login");

                }}
            >

                <FaSignOutAlt />

                {!collapsed && <span>Logout</span>}

            </div>

        </div>

    );

}

export default CustomerSidebar;