import { FaTrash } from "react-icons/fa";
import { getTypeMeta, timeAgo } from "../utils/notificationTypes";
import "./NotificationList.css";

// compact: smaller rows for the navbar dropdown. Full pages pass compact={false}.
export default function NotificationList({
    notifications,
    onMarkRead,
    onDelete,
    compact = false,
    emptyMessage = "You're all caught up — no notifications.",
}) {
    if (!notifications || notifications.length === 0) {
        return <p className="notif-empty">{emptyMessage}</p>;
    }

    return (
        <ul className={`notif-list ${compact ? "notif-list-compact" : ""}`}>
            {notifications.map((n) => {
                const meta = getTypeMeta(n.type);
                const Icon = meta.icon;

                return (
                    <li
                        key={n.id}
                        className={`notif-item ${n.read ? "" : "notif-unread"}`}
                        onClick={() => !n.read && onMarkRead?.(n.id)}
                    >
                        <span className="notif-icon" style={{ background: `${meta.color}1a`, color: meta.color }}>
                            <Icon />
                        </span>

                        <div className="notif-body">
                            <div className="notif-top-row">
                                <span className="notif-title">{n.title}</span>
                                <span className="notif-time">{timeAgo(n.createdAt)}</span>
                            </div>
                            <p className="notif-message">{n.message}</p>
                            {n.trackingId && <span className="notif-tracking-id">{n.trackingId}</span>}
                        </div>

                        {!n.read && <span className="notif-dot" title="Unread" />}

                        {onDelete && (
                            <button
                                type="button"
                                className="notif-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(n.id);
                                }}
                                title="Delete"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
