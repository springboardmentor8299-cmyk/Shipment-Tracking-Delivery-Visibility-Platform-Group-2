import {
  FaTachometerAlt,
  FaHistory,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Sidebar.css";

function DriverSidebar({ onSelect, activeSection }) {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const select = (key) => {
    if (onSelect) {
      onSelect(key);
    }
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <button className="menu-btn" onClick={() => setCollapsed(!collapsed)}>
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
          {!collapsed && <span>My Shipment</span>}
        </li>

        <li
          className={activeSection === "history" ? "active" : ""}
          onClick={() => select("history")}
        >
          <FaHistory />
          {!collapsed && <span>Delivery History</span>}
        </li>

        <li
          className={activeSection === "notifications" ? "active" : ""}
          onClick={() => select("notifications")}
        >
          <FaBell />
          {!collapsed && <span>Notifications</span>}
        </li>

        <li
          className={activeSection === "profile" ? "active" : ""}
          onClick={() => select("profile")}
        >
          <FaUser />
          {!collapsed && <span>My Profile</span>}
        </li>
      </ul>

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

export default DriverSidebar;
