import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, TrendingUp, FileText, LogOut, Truck, Building2 } from "lucide-react";
import { clearAuthData, getStoredUser } from "../../utils/auth";
import "../../styles/Sidebar.css";

const navItems = [
  { label: "Dashboard", to: "/business/dashboard", icon: LayoutDashboard },
  { label: "Shipment Overview", to: "/business/shipments", icon: Package },
  { label: "Delay Analytics", to: "/business/analytics", icon: TrendingUp },
  { label: "Reports & Export", to: "/business/reports", icon: FileText },
];

export function BusinessSidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthData();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
          <Building2 size={22} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">CargoFlow</span>
          <span className="sidebar-brand-sub">Business Client</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">BUSINESS ENTERPRISE</span>
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
          <div className="sidebar-avatar">{user?.username ? user.username[0].toUpperCase() : "B"}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || "Business Client"}</div>
            <div className="sidebar-user-role">Enterprise Account</div>
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

export default BusinessSidebar;
