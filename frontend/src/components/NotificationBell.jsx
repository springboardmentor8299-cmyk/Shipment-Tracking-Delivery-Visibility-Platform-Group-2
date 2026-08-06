import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../services/notificationService";
import NotificationList from "./NotificationList";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 20000;

export default function NotificationBell({ onViewAll }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const containerRef = useRef(null);
    const knownIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const load = async () => {
        try {
            const data = await getNotifications();
            const list = Array.isArray(data) ? data : [];

            // (vii) Push notifications — fire a real browser notification for
            // anything new since the last poll, once the user has granted
            // permission. Skipped on the very first load so opening the app
            // doesn't immediately fire a burst of notifications for old items.
            if (!isFirstLoadRef.current && "Notification" in window && Notification.permission === "granted") {
                const newOnes = list.filter((n) => !n.read && !knownIdsRef.current.has(n.id));
                newOnes.forEach((n) => {
                    new Notification(n.title, { body: n.message, tag: `notif-${n.id}` });
                });
            }

            knownIdsRef.current = new Set(list.map((n) => n.id));
            isFirstLoadRef.current = false;

            setNotifications(list);
            setError("");
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setError("Couldn't load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await markAsRead(id);
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllAsRead();
        } catch (err) {
            console.error("Failed to mark all notifications read:", err);
        }
    };

    return (
        <div className="notif-bell-container" ref={containerRef}>
            <div className="notification" onClick={() => setOpen((v) => !v)}>
                <FaBell />
                {unreadCount > 0 && <span>{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </div>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-dropdown-body">
                        {loading ? (
                            <p className="notif-empty">Loading…</p>
                        ) : error ? (
                            <p className="notif-empty">{error}</p>
                        ) : (
                            <NotificationList
                                notifications={notifications.slice(0, 6)}
                                onMarkRead={handleMarkRead}
                                compact
                            />
                        )}
                    </div>

                    {onViewAll && (
                        <button
                            className="notif-view-all-btn"
                            onClick={() => {
                                setOpen(false);
                                onViewAll();
                            }}
                        >
                            View all notifications
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
