import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, AlertOctagon, Search, ShieldCheck, LogOut, Headset } from "lucide-react";
import { clearAuthData, getStoredUser } from "../../utils/auth";
import "../../styles/Sidebar.css";

const navItems = [
  { label: "Support Center", to: "/support/dashboard", icon: LayoutDashboard },
  { label: "Dispute Queue", to: "/support/disputes", icon: AlertOctagon },
  { label: "Global Lookup", to: "/support/lookup", icon: Search },
];

export function SupportSidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthData();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}>
          <Headset size={22} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">CargoFlow</span>
          <span className="sidebar-brand-sub">Support Agent</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">CUSTOMER CLAIMS</span>
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
          <div className="sidebar-avatar">{user?.username ? user.username[0].toUpperCase() : "S"}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || "Support Amy"}</div>
            <div className="sidebar-user-role">Customer Service Agent</div>
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

export default SupportSidebar;
