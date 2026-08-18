import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import ProfileMenu from "./ProfileMenu";
import { getStoredUser } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";
import { Bell, CheckCircle2, Truck, Package, AlertCircle, ArrowRight } from "lucide-react";
import "../../styles/TopBar.css";

function TopBar() {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, clearNotifications, getNotificationsForUser } = useNotifications();
  const user = getStoredUser();
  const navigate = useNavigate();

  const userNotifs = getNotificationsForUser ? getNotificationsForUser(user) : notifications;
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const toggle = () => setOpen((s) => !s);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getNotificationsPath = () => {
    const roleUpper = (user?.role || "").toUpperCase();
    if (roleUpper.includes("ADMIN")) return "/admin/notifications";
    if (roleUpper.includes("BUSINESS")) return "/business/notifications";
    if (roleUpper.includes("OPERATOR")) return "/operator/notifications";
    if (roleUpper.includes("SUPPORT")) return "/support/notifications";
    return "/customer/notifications";
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "POD_CONFIRMED":
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "STATUS_UPDATE":
        return <Truck size={14} className="text-amber-500" />;
      case "SHIPMENT_REQUEST":
        return <Package size={14} className="text-blue-500" />;
      default:
        return <AlertCircle size={14} className="text-purple-500" />;
    }
  };

  return (
    <header className="topbar-header">
      <div className="topbar-container">
        {/* Left: Welcome back greeting */}
        <div className="topbar-greeting">
          <div className="topbar-greeting-row">
            <span className="topbar-greeting-text">
              Welcome back, <strong className="topbar-username">{user?.username || "User"}</strong>
            </span>
          </div>
          <p className="topbar-date">{formattedDate}</p>
        </div>

        {/* Center: Search */}
        <div className="topbar-search-wrap">
          <SearchBar />
        </div>

        {/* Right: Actions */}
        <div className="topbar-actions">
          {/* Notification */}
          <div className="topbar-notif-wrap">
            <button onClick={toggle} className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="topbar-notif-badge">{unreadCount}</span>
              )}
            </button>

            {open && (
              <div className="topbar-notif-dropdown">
                <div className="topbar-notif-header">
                  <strong>Notifications ({userNotifs.length})</strong>
                  <button onClick={clearNotifications} className="topbar-notif-clear">Clear all</button>
                </div>

                {userNotifs.length === 0 ? (
                  <div className="topbar-notif-empty">No new notifications</div>
                ) : (
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {userNotifs.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setOpen(false);
                          navigate(getNotificationsPath());
                        }}
                        className={`topbar-notif-item ${!n.read ? "bg-blue-50/60 font-semibold" : "opacity-80"}`}
                        style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}
                      >
                        <div style={{ marginTop: 2 }}>{getCategoryIcon(n.category)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => {
                    setOpen(false);
                    navigate(getNotificationsPath());
                  }}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  View All Notifications <ArrowRight size={13} />
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
