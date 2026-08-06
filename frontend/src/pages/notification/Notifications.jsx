import { useEffect, useMemo, useState } from "react";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../services/notificationService";
import { NOTIFICATION_TYPES } from "../../utils/notificationTypes";
import NotificationList from "../../components/NotificationList";
import NotificationPreferences from "../../components/NotificationPreferences";
import "./Notifications.css";

const FILTERS = [{ key: "ALL", label: "All" }, ...Object.entries(NOTIFICATION_TYPES).map(([key, meta]) => ({
    key,
    label: meta.label,
}))];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState("list");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [unreadOnly, setUnreadOnly] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setError(
                err?.response?.data?.message ||
                    "Could not load notifications. This needs a matching backend at /api/notifications — see note below.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await markAsRead(id);
        } catch (err) {
            console.error("Failed to mark read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllAsRead();
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    };

    const handleDelete = async (id) => {
        const prevState = notifications;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        try {
            await deleteNotification(id);
        } catch (err) {
            console.error("Failed to delete notification:", err);
            setNotifications(prevState);
        }
    };

    const filtered = useMemo(() => {
        return notifications.filter((n) => {
            if (filter !== "ALL" && n.type !== filter) return false;
            if (unreadOnly && n.read) return false;
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                if (!n.title?.toLowerCase().includes(q) && !n.message?.toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [notifications, filter, unreadOnly, search]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="notifpage-wrapper">
            <h1>Notifications</h1>
            <p className="notifpage-subtitle">
                Shipment updates, ETA changes, delivery alerts, and delay warnings, all in one place.
            </p>

            <div className="notifpage-tabs">
                <button
                    className={activeTab === "list" ? "notifpage-tab active" : "notifpage-tab"}
                    onClick={() => setActiveTab("list")}
                >
                    All Notifications {unreadCount > 0 && <span className="notifpage-tab-badge">{unreadCount}</span>}
                </button>
                <button
                    className={activeTab === "preferences" ? "notifpage-tab active" : "notifpage-tab"}
                    onClick={() => setActiveTab("preferences")}
                >
                    Preferences
                </button>
            </div>

            {activeTab === "preferences" ? (
                <NotificationPreferences />
            ) : (
                <div className="notifpage-card">
                    <div className="notifpage-toolbar">
                        <input
                            type="text"
                            className="notifpage-search"
                            placeholder="Search notifications"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <label className="notifpage-unread-toggle">
                            <input
                                type="checkbox"
                                checked={unreadOnly}
                                onChange={(e) => setUnreadOnly(e.target.checked)}
                            />
                            Unread only
                        </label>

                        {unreadCount > 0 && (
                            <button className="notifpage-mark-all-btn" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notifpage-filters">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={filter === f.key ? "notifpage-filter active" : "notifpage-filter"}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {error && <p className="notifpage-error">{error}</p>}

                    {loading ? (
                        <p className="notifpage-muted">Loading…</p>
                    ) : (
                        <NotificationList
                            notifications={filtered}
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                            emptyMessage="No notifications match this filter."
                        />
                    )}
                </div>
            )}
        </div>
    );
}
