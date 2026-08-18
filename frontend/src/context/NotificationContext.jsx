import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

const initialNotifications = [
  {
    id: "notif-1",
    title: "Shipment Dispatched",
    message: "Cargo shipment #SH1001 is now IN_TRANSIT towards destination.",
    category: "STATUS_UPDATE",
    recipientRole: "CUSTOMER",
    targetCustomer: "John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    trackingNumber: "SH1001"
  },
  {
    id: "notif-2",
    title: "New Shipment Request",
    message: "Customer John Doe submitted shipment request #SH1005 for admin approval.",
    category: "SHIPMENT_REQUEST",
    recipientRole: "ADMIN",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    trackingNumber: "SH1005"
  },
  {
    id: "notif-3",
    title: "Shipment Assigned for Delivery",
    message: "New shipment #SH1006 assigned to driver_sam for delivery run.",
    category: "STATUS_UPDATE",
    recipientRole: "LOGISTICS_OPERATOR",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    trackingNumber: "SH1006"
  },
  {
    id: "notif-4",
    title: "POD Proof Uploaded",
    message: "Digital signature and photo evidence captured for shipment #SH1002.",
    category: "POD_CONFIRMED",
    recipientRole: "ADMIN",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    trackingNumber: "SH1002"
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("cargoflow_notifications");
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cargoflow_notifications", JSON.stringify(notifications));
    } catch (err) {
      console.error("Failed to save notifications:", err);
    }
  }, [notifications]);

  const addNotification = ({
    title,
    message,
    category = "GENERAL",
    trackingNumber = "",
    recipientRole = "ALL",
    targetCustomer = ""
  }) => {
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      title,
      message,
      category,
      recipientRole,
      targetCustomer,
      timestamp: new Date().toISOString(),
      read: false,
      trackingNumber
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getNotificationsForUser = (user) => {
    if (!user) return notifications;
    const roleUpper = (user.role || "").toUpperCase();
    const usernameLower = (user.username || "").toLowerCase();

    return notifications.filter(n => {
      const targetRole = (n.recipientRole || "ALL").toUpperCase();

      if (targetRole === "ALL") return true;

      if (roleUpper.includes("ADMIN")) {
        return targetRole === "ADMIN" || targetRole === "ADMINISTRATOR";
      }

      if (roleUpper.includes("OPERATOR") || roleUpper.includes("DRIVER")) {
        return targetRole === "LOGISTICS_OPERATOR" || targetRole === "OPERATOR" || targetRole === "DRIVER";
      }

      if (roleUpper.includes("BUSINESS")) {
        return targetRole === "BUSINESS_CLIENT" || targetRole === "BUSINESS";
      }

      if (roleUpper.includes("SUPPORT")) {
        return targetRole === "SUPPORT_AGENT" || targetRole === "SUPPORT";
      }

      // CUSTOMER
      if (targetRole === "CUSTOMER") {
        if (!n.targetCustomer) return true;
        return n.targetCustomer.toLowerCase() === usernameLower || usernameLower.includes(n.targetCustomer.toLowerCase());
      }

      return true;
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        getNotificationsForUser,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export default NotificationContext;
