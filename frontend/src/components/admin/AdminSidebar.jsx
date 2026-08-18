import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  Truck,
  BarChart,
  FileText,
  AlertTriangle,
  LogOut,
  Bell,
} from "lucide-react";
import { clearAuthData } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Sidebar.css";

const navItems = [
  { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "POD Disputes", to: "/admin/disputes", icon: AlertTriangle },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Shipments", to: "/admin/shipments", icon: Package },
  { label: "Tracking", to: "/admin/tracking", icon: MapPin },
  { label: "Deliveries", to: "/admin/deliveries", icon: Truck },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart },
  { label: "Reports", to: "/admin/reports", icon: FileText },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const { username, role } = useAuth();

  const handleLogout = () => {
    clearAuthData();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Branding with crisp Truck icon before CargoFlow */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Truck size={22} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">CargoFlow</span>
          <span className="sidebar-brand-sub">Control Center</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">MENU</span>
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
            }
          >
            <span className="sidebar-link-icon">
              <Icon size={18} />
            </span>
            <span className="sidebar-link-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {username ? username[0].toUpperCase() : '?'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{username || 'Admin'}</div>
            <div className="sidebar-user-role">{role || 'Admin'}</div>
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

export default AdminSidebar;
