import {
  FaTachometerAlt,
  FaBoxOpen,
  FaMapMarkedAlt,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Sidebar.css";

function BusinessSidebar({ onSelect, activeSection }) {
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
          {!collapsed && <span>Dashboard</span>}
        </li>

        <li
          className={activeSection === "reports" ? "active" : ""}
          onClick={() => select("reports")}
        >
          <FaFileAlt />
          {!collapsed && <span>Reports</span>}
        </li>

        <li
          className={activeSection === "settings" ? "active" : ""}
          onClick={() => select("settings")}
        >
          <FaCog />
          {!collapsed && <span>Settings</span>}
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

export default BusinessSidebar;
