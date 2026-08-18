import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Truck, PenTool, MapPin, LogOut, Bell } from "lucide-react";
import { clearAuthData, getStoredUser } from "../../utils/auth";
import "../../styles/Sidebar.css";

const navItems = [
  { label: "Driver Console", to: "/operator/dashboard", icon: LayoutDashboard },
  { label: "Assigned Runs", to: "/operator/runs", icon: Truck },
  { label: "POD Capture", to: "/operator/pod", icon: PenTool },
  { label: "Notifications", to: "/operator/notifications", icon: Bell },
];

export function OperatorSidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthData();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
          <Truck size={22} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">CargoFlow</span>
          <span className="sidebar-brand-sub">Field Operator</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">DISPATCH & DELIVERY</span>
        {navItems.map(({ label, to, icon: Icon }, idx) => (
          <NavLink
            key={idx}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
          >
            <span className="sidebar-link-icon">
              <Icon size={18} />
            </span>
            <span className="sidebar-link-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.username ? user.username[0].toUpperCase() : "O"}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || "Driver Sam"}</div>
            <div className="sidebar-user-role">Logistics Operator</div>
          </div>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default OperatorSidebar;
