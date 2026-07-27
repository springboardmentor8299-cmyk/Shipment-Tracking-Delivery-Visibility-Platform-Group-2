import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./OperatorDashboard.css";

function OperatorDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
              Manage assigned shipments, update delivery locations, monitor
              estimated arrival times and keep customers informed throughout
              the complete delivery journey.
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
                to="/operator/shipments"
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

        <section className="operator-statistics-section">
          <div className="operator-statistics-grid">
            <article className="operator-stat-card">
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-blue">📦</div>
                <span className="operator-stat-trend">Active</span>
              </div>

              <span className="operator-stat-label">Assigned Shipments</span>
              <strong>24</strong>
              <p>Total shipments currently assigned for processing.</p>
            </article>

            <article className="operator-stat-card">
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-purple">↗</div>
                <span className="operator-stat-trend">Moving</span>
              </div>

              <span className="operator-stat-label">In Transit</span>
              <strong>15</strong>
              <p>Shipments currently moving between delivery locations.</p>
            </article>

            <article className="operator-stat-card">
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-orange">⌖</div>
                <span className="operator-stat-trend">Priority</span>
              </div>

              <span className="operator-stat-label">Out For Delivery</span>
              <strong>6</strong>
              <p>Shipments scheduled for final delivery today.</p>
            </article>

            <article className="operator-stat-card">
              <div className="operator-stat-card-top">
                <div className="operator-stat-icon stat-green">✓</div>
                <span className="operator-stat-trend">Completed</span>
              </div>

              <span className="operator-stat-label">Delivered Today</span>
              <strong>3</strong>
              <p>Shipments successfully delivered during the current day.</p>
            </article>
          </div>
        </section>

        <section className="operator-dashboard-section">
          <div className="operator-section-header">
            <div>
              <span className="operator-section-label">QUICK ACTIONS</span>
              <h2>Manage delivery operations</h2>
              <p>
                Access shipment management, location updates and delivery
                monitoring tools from one workspace.
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
                  View assigned shipments, delivery addresses, tracking
                  numbers and current shipment statuses.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>View shipments</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments"
              className="operator-dashboard-card operator-location-card"
            >
              <div className="operator-card-top">
                <div className="operator-card-icon">⌖</div>
                <span className="operator-card-number">02</span>
              </div>

              <div className="operator-card-content">
                <span className="operator-card-label">LIVE LOCATION</span>

                <h3>Update Shipment</h3>

                <p>
                  Update shipment coordinates, delivery status and latest
                  location information during transit.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Update location</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments"
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
                  Monitor estimated arrival times, expected delivery schedules
                  and predicted shipment delays.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Monitor ETA</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/operator/shipments"
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
                  Track shipment movement from pickup and transit through final
                  delivery completion.
                </p>
              </div>

              <div className="operator-card-footer">
                <span>Track progress</span>
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
                Update shipment coordinates during transit so customers can
                view accurate delivery progress.
              </p>
            </div>
          </article>

          <article className="operator-info-card">
            <div className="operator-info-icon">⚡</div>

            <div>
              <span>FAST DELIVERY WORKFLOW</span>
              <h3>Complete updates efficiently</h3>
              <p>
                Quickly manage shipment status, delivery location and ETA
                information from one place.
              </p>
            </div>
          </article>

          <article className="operator-info-card">
            <div className="operator-info-icon">🔒</div>

            <div>
              <span>SECURE OPERATIONS</span>
              <h3>Protected operator workspace</h3>
              <p>
                Role-based authentication ensures that shipment operations
                remain secure and authorized.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default OperatorDashboard;