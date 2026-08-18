import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { getStoredUser } from "../utils/auth";
import { Bell, CheckCircle2, Truck, Package, AlertCircle, Shield, Check, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, getNotificationsForUser } = useNotifications();
  const user = getStoredUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState("ALL"); // ALL, UNREAD, SHIPMENT, REQUESTS

  const userNotifs = getNotificationsForUser ? getNotificationsForUser(user) : notifications;

  const filteredNotifs = userNotifs.filter(n => {
    if (tab === "UNREAD") return !n.read;
    if (tab === "SHIPMENT") return n.category === "STATUS_UPDATE" || n.category === "POD_CONFIRMED";
    if (tab === "REQUESTS") return n.category === "SHIPMENT_REQUEST";
    return true;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case "POD_CONFIRMED":
        return { label: "POD Confirmed", bg: "#dcfce7", color: "#166534", icon: CheckCircle2 };
      case "STATUS_UPDATE":
        return { label: "Status Update", bg: "#fef3c7", color: "#b45309", icon: Truck };
      case "SHIPMENT_REQUEST":
        return { label: "Shipment Request", bg: "#eff6ff", color: "#1d4ed8", icon: Package };
      default:
        return { label: "System Notification", bg: "#f3e8ff", color: "#7e22ce", icon: AlertCircle };
    }
  };

  const handleTrackClick = (trackingNumber) => {
    const roleUpper = (user?.role || "").toUpperCase();
    if (roleUpper.includes("ADMIN")) {
      navigate(`/admin/tracking/${trackingNumber}`);
    } else {
      navigate(`/customer/track/${trackingNumber}`);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 48 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
          color: "#ffffff",
          borderRadius: 24,
          padding: "28px 32px",
          marginBottom: 24,
          boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Role: {user?.role || "User"}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
            Notifications Center
          </h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
            Targeted updates & activity alerts for {user?.username || "your account"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={markAllAsRead}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Check size={16} /> Mark All Read
          </button>
          <button
            onClick={clearNotifications}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#ffffff", padding: 6, borderRadius: 14, border: "1px solid #e2e8f0" }}>
        {[
          { id: "ALL", label: `All Notifications (${userNotifs.length})` },
          { id: "UNREAD", label: `Unread (${userNotifs.filter(n => !n.read).length})` },
          { id: "SHIPMENT", label: "Shipment Updates" },
          { id: "REQUESTS", label: "System Requests" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: tab === t.id ? "#2563eb" : "transparent",
              color: tab === t.id ? "#ffffff" : "#64748b",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: "grid", gap: 12 }}>
        {filteredNotifs.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              color: "#94a3b8"
            }}
          >
            <Bell size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>No notifications in this category</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>You're all caught up! New updates will appear here automatically.</div>
          </div>
        ) : (
          filteredNotifs.map(n => {
            const badge = getCategoryBadge(n.category);
            const IconComponent = badge.icon;

            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: n.read ? "#ffffff" : "#f0f9ff",
                  border: n.read ? "1px solid #e2e8f0" : "1.5px solid #93c5fd",
                  boxShadow: n.read ? "0 2px 8px rgba(15,23,42,0.03)" : "0 4px 14px rgba(37,99,235,0.08)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: badge.bg,
                    color: badge.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <IconComponent size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{n.title}</h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: badge.bg,
                          color: badge.color
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(n.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
                    {n.message}
                  </p>

                  {n.trackingNumber && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(n.trackingNumber);
                      }}
                      style={{
                        marginTop: 10,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      Track Shipment #{n.trackingNumber} <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
