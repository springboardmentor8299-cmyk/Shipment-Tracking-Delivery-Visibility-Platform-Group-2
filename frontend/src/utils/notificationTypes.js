import {
    FaBoxOpen,
    FaClock,
    FaTruck,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";

// (i) Shipment updates  (ii) ETA notifications
// (iii) Delivery alerts (iv) Delay warnings
export const NOTIFICATION_TYPES = {
    SHIPMENT_UPDATE: { label: "Shipment Update", icon: FaBoxOpen, color: "#2563eb" },
    ETA_UPDATE: { label: "ETA Update", icon: FaClock, color: "#7c3aed" },
    DELIVERY_ALERT: { label: "Delivery Alert", icon: FaTruck, color: "#16a34a" },
    DELAY_WARNING: { label: "Delay Warning", icon: FaExclamationTriangle, color: "#dc2626" },
    SYSTEM: { label: "System", icon: FaInfoCircle, color: "#64748b" },
};

export const getTypeMeta = (type) => NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SYSTEM;

// Lightweight relative-time formatter (just this file's concern — no new
// date-library dependency for one string).
export function timeAgo(isoString) {
    if (!isoString) return "";
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString();
}
