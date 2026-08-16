import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./OperatorDashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function OperatorDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const getStoredToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("jwtToken");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setIsLoadingStats(true);
        setStatsError("");

        const token = getStoredToken();

        const response = await fetch(
          `${API_BASE_URL}/api/shipments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session has expired or you do not have permission to view shipment statistics."
          );
        }

        if (!response.ok) {
          throw new Error("Unable to load shipment statistics.");
        }

        const responseData = await response.json();

        const shipmentList = Array.isArray(responseData)
          ? responseData
          : responseData.content ||
            responseData.shipments ||
            responseData.data ||
            [];

        setShipments(shipmentList);
      } catch (error) {
        console.error("Unable to load operator dashboard:", error);
        setStatsError(
          error.message ||
            "Something went wrong while loading shipment statistics."
        );
        setShipments([]);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchShipments();
  }, []);

  const statistics = useMemo(() => {
    const normalizedShipments = shipments.map((shipment) => ({
      ...shipment,
      normalizedStatus: String(
        shipment.status || shipment.shipmentStatus || ""
      ).toUpperCase(),
    }));

    const deliveredToday = normalizedShipments.filter((shipment) => {
      if (shipment.normalizedStatus !== "DELIVERED") {
        return false;
      }

      const deliveredValue =
        shipment.deliveredAt ||
        shipment.deliveryTime ||
        shipment.lastLocationUpdate ||
        shipment.updatedAt ||
        shipment.createdAt;

      if (!deliveredValue) {
        return false;
      }

      const deliveredDate = new Date(deliveredValue);
      const today = new Date();

      return (
        deliveredDate.getFullYear() === today.getFullYear() &&
        deliveredDate.getMonth() === today.getMonth() &&
        deliveredDate.getDate() === today.getDate()
      );
    }).length;

    return {
      total: normalizedShipments.length,
      inTransit: normalizedShipments.filter(
        (shipment) => shipment.normalizedStatus === "IN_TRANSIT"
      ).length,
      outForDelivery: normalizedShipments.filter(
        (shipment) =>
          shipment.normalizedStatus === "OUT_FOR_DELIVERY"
      ).length,
      delivered: normalizedShipments.filter(
        (shipment) => shipment.normalizedStatus === "DELIVERED"
      ).length,
      deliveredToday,
    };
  }, [shipments]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatValue = (value) =>
    isLoadingStats ? "—" : value;

  return (
    <div className="operator-dashboard-page">
      <div className="operator-dashboard-glow operator-glow-one"></div>
      <div className="operator-dashboard-glow operator-glow-two"></div>

      <header className="operator-dashboard-topbar">
        <Link to="/operator" className="operator-dashboard-brand">
          <div className="operator-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Logistics Operator Portal</small>
          </div>
        </Link>

        <button
          type="button"
          className="operator-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </header>

      <main className="operator-dashboard-main">
        <section className="operator-dashboard-hero">
          <div className="operator-hero-content">
            <div className="operator-dashboard-badge">
              <span></span>
              LOGISTICS OPERATOR WORKSPACE
            </div>

            <h1>Operator Dashboard</h1>

            <p>
              Manage assigned shipments, update delivery locations,
              monitor estimated arrival times and keep customers
              informed throughout the complete delivery journey.
            </p>

            <div className="operator-hero-actions">
              <Link
                to="/operator/shipments"
                className="operator-primary-button"
              >
                Manage Shipments
                <span>→</span>
              </Link>

              <Link
                to="/operator/shipments?view=progress"
                className="operator-secondary-button"
              >
                View Delivery Progress
              </Link>
            </div>
          </div>

          <div className="operator-hero-visual">
            <div className="operator-control-card">
              <div className="operator-control-header">
                <div>
                  <span>OPERATIONS CENTER</span>
                  <strong>Fleet Activity</strong>
                </div>

                <div className="operator-live-indicator">
                  <span></span>
                  Live
                </div>
              </div>

              <div className="operator-control-body">
                <div className="operator-map-grid"></div>
                <div className="operator-fleet-route route-one"></div>
                <div className="operator-fleet-route route-two"></div>

                <div className="operator-location-point operator-point-one">
                  <span></span>
                </div>

                <div className="operator-location-point operator-point-two">
                  <span></span>
                </div>

                <div className="operator-location-point operator-point-three">
                  <span></span>
                </div>

                <div className="operator-fleet-truck operator-truck-one">
                  🚚
                </div>

                <div className="operator-fleet-truck operator-truck-two">
                  📦
                </div>

                <div className="operator-control-status">
                  <div>
                    <small>Network Status</small>
                    <strong>Fleet Monitoring Active</strong>
                  </div>

                  <div className="operator-signal-bars">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              <div className="operator-control-footer">
                <div>
                  <span>Location Updates</span>
                  <strong>Live monitoring</strong>
                </div>

                <div>
                  <span>Delivery Network</span>
                  <strong>Connected</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {statsError && (
          <div className="operator-dashboard-error" role="alert">
            {statsError}
          </div>
        )}

        <section className="operator-statistics-section">
          <div className="operator-statistics-grid">
            <Link
              to="/operator/shipments"
              className="operator-stat-card"
            >
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-blue">📦</div>
                <span className="operator-stat-trend">All</span>
              </div>

              <span className="operator-stat-label">
                Assigned Shipments
              </span>
              <strong>{getStatValue(statistics.total)}</strong>
              <p>Total shipments currently available for processing.</p>
            </Link>

            <Link
              to="/operator/shipments?status=IN_TRANSIT"
              className="operator-stat-card"
            >
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-purple">↗</div>
                <span className="operator-stat-trend">Moving</span>
              </div>

              <span className="operator-stat-label">In Transit</span>
              <strong>{getStatValue(statistics.inTransit)}</strong>
              <p>
                Shipments currently moving between delivery locations.
              </p>
            </Link>

            <Link
              to="/operator/shipments?status=OUT_FOR_DELIVERY"
              className="operator-stat-card"
            >
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-orange">⌖</div>
                <span className="operator-stat-trend">Priority</span>
              </div>

              <span className="operator-stat-label">
                Out For Delivery
              </span>
              <strong>
                {getStatValue(statistics.outForDelivery)}
              </strong>
              <p>Shipments currently scheduled for final delivery.</p>
            </Link>

            <Link
              to="/operator/shipments?status=DELIVERED"
              className="operator-stat-card"
            >
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-green">✓</div>
                <span className="operator-stat-trend">Completed</span>
              </div>

              <span className="operator-stat-label">
                Delivered Today
              </span>
              <strong>
                {getStatValue(
                  statistics.deliveredToday ||
                    statistics.delivered
                )}
              </strong>
              <p>
                Shipments successfully delivered during the current
                day.
              </p>
            </Link>
          </div>
        </section>

        <section className="operator-dashboard-section">
          <div className="operator-section-header">
            <div>
              <span className="operator-section-label">
                QUICK ACTIONS
              </span>
              <h2>Manage delivery operations</h2>
              <p>
                Access shipment management, location updates and
                delivery monitoring tools from one workspace.
              </p>
            </div>

            <div className="operator-secure-badge">
              <span>✓</span>
              Secure Operator Access
            </div>
          </div>

          <div className="operator-dashboard-cards">
            <Link
              to="/operator/shipments"
              className="operator-dashboard-card operator-shipments-card"
            >
              <div className="operator-card-top">
                <div className="operator-card-icon">📦</div>
                <span className="operator-card-number">01</span>
              </div>

              <div className="operator-card-content">
                <span className="operator-card-label">
                  ASSIGNED DELIVERIES
                </span>
                <h3>Manage Shipments</h3>
                <p>
                  View assigned shipments, delivery addresses,
                  tracking numbers and current shipment statuses.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>View shipments</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments?view=update"
              className="operator-dashboard-card operator-location-card"
            >
              <div className="operator-card-top">
                <div className="operator-card-icon">⌖</div>
                <span className="operator-card-number">02</span>
              </div>

              <div className="operator-card-content">
                <span className="operator-card-label">
                  LIVE LOCATION
                </span>
                <h3>Update Shipment</h3>
                <p>
                  Select a shipment and update its coordinates,
                  delivery status and latest location information.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Select shipment to update</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments?view=eta"
              className="operator-dashboard-card operator-eta-card"
            >
              <div className="operator-card-top">
                <div className="operator-card-icon">⏱</div>
                <span className="operator-card-number">03</span>
              </div>

              <div className="operator-card-content">
                <span className="operator-card-label">
                  DELIVERY ESTIMATION
                </span>
                <h3>ETA Monitoring</h3>
                <p>
                  View estimated arrival times, expected delivery
                  schedules and predicted shipment delays.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Monitor shipment ETA</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments?view=progress"
              className="operator-dashboard-card operator-progress-card"
            >
              <div className="operator-card-top">
                <div className="operator-card-icon">🚚</div>
                <span className="operator-card-number">04</span>
              </div>

              <div className="operator-card-content">
                <span className="operator-card-label">
                  DELIVERY WORKFLOW
                </span>
                <h3>Delivery Progress</h3>
                <p>
                  Track shipment movement from pickup and transit
                  through final delivery completion.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Track delivery progress</span>
                <strong>→</strong>
              </div>
            </Link>
          </div>
        </section>

        <section className="operator-dashboard-info-grid">
          <article className="operator-info-card">
            <div className="operator-info-icon">📍</div>
            <div>
              <span>LIVE GPS UPDATES</span>
              <h3>Keep shipment locations current</h3>
              <p>
                Update shipment coordinates during transit so
                customers can view accurate delivery progress.
              </p>
            </div>
          </article>

          <article className="operator-info-card">
            <div className="operator-info-icon">⚡</div>
            <div>
              <span>FAST DELIVERY WORKFLOW</span>
              <h3>Complete updates efficiently</h3>
              <p>
                Quickly manage shipment status, delivery location and
                ETA information from one place.
              </p>
            </div>
          </article>

          <article className="operator-info-card">
            <div className="operator-info-icon">🔒</div>
            <div>
              <span>SECURE OPERATIONS</span>
              <h3>Protected operator workspace</h3>
              <p>
                Role-based authentication ensures that shipment
                operations remain secure and authorized.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default OperatorDashboard;