import { NavLink, useNavigate } from "react-router-dom";
import { Package, MapPin, User, LogOut, Home, Truck, Bell, HelpCircle } from "lucide-react";
import { clearAuthData } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Sidebar.css";

const links = [
	{ label: "Dashboard", to: "/customer/dashboard", icon: Home },
	{ label: "My Shipments", to: "/customer/shipments", icon: Package },
	{ label: "Track Shipment", to: "/customer/track", icon: MapPin },
	{ label: "Support", to: "/customer/support", icon: HelpCircle },
	{ label: "Notifications", to: "/customer/notifications", icon: Bell },
	{ label: "Profile", to: "/customer/profile", icon: User },
];

function CustomerSidebar() {
	const navigate = useNavigate();
	const { username, role } = useAuth();

	const handleLogout = () => {
		clearAuthData();
		navigate('/login', { replace: true });
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
					<span className="sidebar-brand-sub">Customer Portal</span>
				</div>
			</div>

			<div className="sidebar-divider"></div>

			{/* Navigation */}
			<nav className="sidebar-nav">
				<span className="sidebar-nav-label">MENU</span>
				{links.map(({ label, to, icon: Icon }) => (
					<NavLink
						key={to}
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
						<div className="sidebar-user-name">{username || 'User'}</div>
						<div className="sidebar-user-role">{role || 'Customer'}</div>
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

export default CustomerSidebar;