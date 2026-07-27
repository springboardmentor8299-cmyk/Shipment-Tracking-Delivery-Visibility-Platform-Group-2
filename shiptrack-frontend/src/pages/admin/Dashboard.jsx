import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { getDashboardStats } from "../../api/adminService";
import "./AdminDashboard.css";

function Dashboard() {
  const auth = useAuth();
  const { logout } = auth;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShipments: 0,
    pending: 0,
    pickedUp: 0,
    inTransit: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const getStoredUser = () => {
    const possibleKeys = ["user", "currentUser", "authUser"];

    for (const key of possibleKeys) {
      const storedValue = localStorage.getItem(key);

      if (storedValue) {
        try {
          return JSON.parse(storedValue);
        } catch {
          continue;
        }
      }
    }

    return null;
  };

  const getJwtUser = () => {
    const possibleTokenKeys = ["token", "jwtToken", "accessToken"];

    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key);

      if (!token) {
        continue;
      }

      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(
          decodeURIComponent(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
              .split("")
              .map(
                (character) =>
                  `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`
              )
              .join("")
          )
        );

        return decodedPayload;
      } catch {
        continue;
      }
    }

    return null;
  };

  const displayName = useMemo(() => {
    const contextUser =
      auth.user ||
      auth.currentUser ||
      auth.loggedInUser ||
      auth.authUser ||
      null;

    const storedUser = getStoredUser();
    const jwtUser = getJwtUser();

    const availableUser = contextUser || storedUser || jwtUser;

    const name =
      availableUser?.name ||
      availableUser?.fullName ||
      availableUser?.username ||
      availableUser?.firstName ||
      availableUser?.sub ||
      availableUser?.email?.split("@")[0];

    if (!name) {
      return "Administrator";
    }

    return name
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }, [auth]);

  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const completedPercentage =
    stats.totalShipments > 0
      ? Math.round((stats.delivered / stats.totalShipments) * 100)
      : 0;

  const activeShipments =
    stats.pending +
    stats.pickedUp +
    stats.inTransit +
    stats.outForDelivery;

  const statisticCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      type: "users",
      description: "Registered platform users",
    },
    {
      title: "Total Shipments",
      value: stats.totalShipments,
      icon: "📦",
      type: "shipments",
      description: "All created shipments",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: "⏳",
      type: "pending",
      description: "Waiting to be processed",
    },
    {
      title: "Picked Up",
      value: stats.pickedUp,
      icon: "📤",
      type: "picked",
      description: "Collected from sender",
    },
    {
      title: "In Transit",
      value: stats.inTransit,
      icon: "🚚",
      type: "transit",
      description: "Currently moving",
    },
    {
      title: "Out For Delivery",
      value: stats.outForDelivery,
      icon: "📍",
      type: "out-delivery",
      description: "Reaching the recipient",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      icon: "✓",
      type: "delivered",
      description: "Successfully completed",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: "✕",
      type: "cancelled",
      description: "Cancelled shipments",
    },
  ];

  const navigationCards = [
    {
      title: "Create Staff",
      description: "Create logistics operators and support agents.",
      icon: "➕",
      path: "/admin/create-staff",
      accent: "blue",
      buttonText: "Create staff",
    },
    {
      title: "Manage Users",
      description: "View and manage every registered platform user.",
      icon: "👥",
      path: "/admin/users",
      accent: "purple",
      buttonText: "View users",
    },
    {
      title: "Manage Shipments",
      description: "Monitor shipments and update delivery statuses.",
      icon: "📦",
      path: "/admin/shipments",
      accent: "orange",
      buttonText: "View shipments",
    },
    {
      title: "Reports & Analytics",
      description: "Review shipment performance and operational reports.",
      icon: "📊",
      path: "/admin/reports",
      accent: "green",
      buttonText: "View reports",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-background-shape admin-shape-one"></div>
      <div className="admin-background-shape admin-shape-two"></div>

      <header className="admin-topbar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-icon">🚚</span>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Administration Portal</small>
          </div>
        </Link>

        <div className="admin-topbar-actions">
          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboardStats}
            disabled={loading}
          >
            <span className={loading ? "admin-refreshing" : ""}>↻</span>
            Refresh
          </button>

          <div className="admin-profile">
            <div className="admin-profile-avatar">{firstLetter}</div>

            <div className="admin-profile-information">
              <strong>{displayName}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-dashboard">
        <section className="admin-welcome-section">
          <div className="admin-welcome-content">
            <div className="admin-welcome-badge">
              <span></span>
              ADMIN CONTROL CENTRE
            </div>

            <h1>
              Welcome back,
              
            </h1>

            <p>
              Monitor platform activity, manage users and track shipment
              performance from one centralized workspace.
            </p>

            <div className="admin-welcome-highlights">
              <div>
                <span className="admin-highlight-icon">⚡</span>

                <div>
                  <strong>{activeShipments}</strong>
                  <small>Active shipments</small>
                </div>
              </div>

              <div>
                <span className="admin-highlight-icon">✓</span>

                <div>
                  <strong>{completedPercentage}%</strong>
                  <small>Delivery success</small>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-overview-card">
            <div className="admin-overview-header">
              <div>
                <span>DELIVERY PERFORMANCE</span>
                <h2>Shipment Overview</h2>
              </div>

              <div className="admin-live-indicator">
                <span></span>
                Live
              </div>
            </div>

            <div className="admin-overview-progress">
              <div className="admin-progress-information">
                <span>Successfully delivered</span>
                <strong>{completedPercentage}%</strong>
              </div>

              <div className="admin-progress-track">
                <span
                  style={{
                    width: `${completedPercentage}%`,
                  }}
                ></span>
              </div>
            </div>

            <div className="admin-overview-metrics">
              <div>
                <span className="admin-metric-dot transit"></span>

                <div>
                  <strong>{activeShipments}</strong>
                  <small>Currently active</small>
                </div>
              </div>

              <div>
                <span className="admin-metric-dot delivered"></span>

                <div>
                  <strong>{stats.delivered}</strong>
                  <small>Delivered</small>
                </div>
              </div>

              <div>
                <span className="admin-metric-dot cancelled"></span>

                <div>
                  <strong>{stats.cancelled}</strong>
                  <small>Cancelled</small>
                </div>
              </div>
            </div>

            <div className="admin-overview-decoration">
              <span>🚚</span>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <span className="admin-section-label">PLATFORM SUMMARY</span>
              <h2>Dashboard statistics</h2>
            </div>

            <p>Current operational information from ShipTrack-Pro.</p>
          </div>

          <div className="admin-stats-grid">
            {statisticCards.map((statistic) => (
              <article
                className={`admin-stat-card admin-stat-${statistic.type}`}
                key={statistic.title}
              >
                <div className="admin-stat-top">
                  <span className="admin-stat-icon">{statistic.icon}</span>
                  <span className="admin-stat-arrow">↗</span>
                </div>

                <div className="admin-stat-value">
                  {loading ? <span className="admin-value-loader"></span> : statistic.value}
                </div>

                <h3>{statistic.title}</h3>
                <p>{statistic.description}</p>

                <div className="admin-stat-bottom-line"></div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section admin-management-section">
          <div className="admin-section-heading">
            <div>
              <span className="admin-section-label">QUICK MANAGEMENT</span>
              <h2>Administration tools</h2>
            </div>

            <p>Quickly access the main administrative operations.</p>
          </div>

          <div className="admin-navigation-grid">
            {navigationCards.map((item) => (
              <Link
                to={item.path}
                className={`admin-navigation-card admin-navigation-${item.accent}`}
                key={item.title}
              >
                <div className="admin-navigation-card-header">
                  <span className="admin-navigation-icon">{item.icon}</span>
                  <span className="admin-navigation-arrow">↗</span>
                </div>

                <div className="admin-navigation-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="admin-navigation-action">
                  <span>{item.buttonText}</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="admin-dashboard-footer">
          <p>© 2026 ShipTrack-Pro Administration Portal</p>

          <div>
            <span className="admin-system-dot"></span>
            All systems operational
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;