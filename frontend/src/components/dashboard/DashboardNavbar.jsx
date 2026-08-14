import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { connectToAdminAlerts, disconnectAdmin } from "../../services/socketService";

function DashboardNavbar() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const dropdownRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        if (!isAdmin) return;
        connectToAdminAlerts((data) => {
            if (data.type === "new_shipment" || data.type === "delay_alert") {
                setNotifications((prev) => [data, ...prev].slice(0, 20));
                setUnreadCount((prev) => prev + 1);
            }
        });

        return () => disconnectAdmin();
    }, [isAdmin]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setShowDropdown((prev) => !prev);
        if (showDropdown) setUnreadCount(0);
    };

    const handleNotifClick = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    };

    const name = user?.name || "Admin";
    const initial = name.charAt(0).toUpperCase();

    return (
        <nav className="dashboard-navbar">

            <div className="dashboard-logo">

                <i className="bi bi-box-seam-fill"></i>

                <span>ShipTrack-Pro</span>

            </div>

            <div className="dashboard-search">

                <i className="bi bi-search"></i>

                <input
                    type="text"
                    placeholder="Search shipment..."
                />

            </div>

            <div className="dashboard-profile" ref={dropdownRef}>

                {isAdmin && (
                    <div style={{ position: "relative" }}>
                        <button className="notification-btn" onClick={handleBellClick}>
                            <i className="bi bi-bell-fill"></i>
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>

                        {showDropdown && (
                            <div className="notification-dropdown">
                                <div className="notification-dropdown-header">
                                    <strong>Notifications</strong>
                                    {notifications.length > 0 && (
                                        <button
                                            className="btn btn-sm btn-link p-0"
                                            onClick={() => { setNotifications([]); setUnreadCount(0); }}
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                <div className="notification-dropdown-body">
                                    {notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <i className="bi bi-check-circle"></i>
                                            <span>No new notifications</span>
                                        </div>
                                    ) : (
                                        notifications.map((n, i) => (
                                            <div key={i} className="notification-item" onClick={() => handleNotifClick(i)}>
                                                <div className="notification-icon" style={n.type === "delay_alert" ? { backgroundColor: "#fde68a" } : undefined}>
                                                    <i className={`bi ${n.type === "delay_alert" ? "bi-exclamation-triangle" : "bi-box-seam"}`}></i>
                                                </div>
                                                <div className="notification-content">
                                                    {n.type === "delay_alert" ? (
                                                        <>
                                                            <div className="notification-title text-warning">Delivery Delay Alert</div>
                                                            <div className="notification-desc">
                                                                {n.delayReason || "Delay detected"} (Shipment #{n.shipmentId})
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="notification-title">New Shipment Created</div>
                                                            <div className="notification-desc">
                                                                {n.trackingNumber} &mdash; {n.senderName} &rarr; {n.receiverName}
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="notification-time">
                                                        {new Date(n.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                    onClick={toggleTheme}
                    title={theme === "light" ? "Dark Mode" : "Light Mode"}
                    style={{ width: "40px", height: "40px", padding: 0 }}
                >
                    <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`}></i>
                </button>

                <div className="profile">

                    <div className="avatar">
                        {initial}
                    </div>

                    <div>

                        <h6>{name}</h6>

                        <small>{user?.role || "Admin"}</small>

                    </div>

                </div>

                <button
                    className="btn btn-outline-secondary btn-sm ms-3"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default DashboardNavbar;
