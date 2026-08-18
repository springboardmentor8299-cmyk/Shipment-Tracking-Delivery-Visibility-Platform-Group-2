import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  overview: (
    <path
      d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-5H4v5Zm10-11h6V4h-6v5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  shipments: (
    <path
      d="M3 21h18M6 21V10l6-4 6 4v11M10 21v-6h4v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  track: (
    <path
      d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  logout: (
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const ADMIN_LINKS = [
  { label: "Overview", to: "/admin", icon: "overview", end: true },
  { label: "Shipments", to: "/admin/shipments", icon: "shipments" },
];

const CUSTOMER_LINKS = [
  { label: "Overview", to: "/customer", icon: "overview", end: true },
  { label: "My shipments", to: "/customer/shipments", icon: "shipments" },
  { label: "Track a shipment", to: "/customer/track", icon: "track" },
];

export default function Sidebar({ variant = "admin" }) {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = variant === "admin" ? ADMIN_LINKS : CUSTOMER_LINKS;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#E4E9F2] bg-white">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-[#E4E9F2]">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#2E7DD1] to-[#5EC8F2]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
            <path
              d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className="text-[16px] font-semibold text-[#0A1830] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          CargoFlow
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-[#0A1830] text-white"
                  : "text-[#4B5875] hover:bg-[#F5F8FC] hover:text-[#0A1830]"
              }`
            }
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
              {ICONS[link.icon]}
            </svg>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#E4E9F2]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F8FC] text-[13px] font-semibold text-[#2E7DD1]">
            {username ? username[0].toUpperCase() : "?"}
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[#0A1830] truncate">
              {username || "User"}
            </div>
            <div className="text-[11px] text-[#8A94A6]">{role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium text-[#4B5875] hover:bg-[#F5F8FC] hover:text-[#0A1830] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
            {ICONS.logout}
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}