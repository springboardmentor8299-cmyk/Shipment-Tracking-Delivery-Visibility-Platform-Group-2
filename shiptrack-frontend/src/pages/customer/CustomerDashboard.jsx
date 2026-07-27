import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="customer-dashboard-page">
      <div className="customer-dashboard-glow customer-glow-one"></div>
      <div className="customer-dashboard-glow customer-glow-two"></div>

      <header className="customer-dashboard-topbar">
        <Link to="/customer/dashboard" className="customer-dashboard-brand">
          <div className="customer-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Customer Portal</small>
          </div>
        </Link>

        <button
          type="button"
          className="customer-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </header>

      <main className="customer-dashboard-main">
        <section className="customer-dashboard-hero">
          <div className="customer-hero-content">
            <div className="customer-dashboard-badge">
              <span></span>
              CUSTOMER WORKSPACE
            </div>

            <h1>Customer Dashboard</h1>

            <p>
              Create shipments, track your deliveries, and review your complete
              delivery history from one secure workspace.
            </p>

            <div className="customer-hero-actions">
              <Link
                to="/customer/create-shipment"
                className="customer-primary-button"
              >
                Create New Shipment
                <span>→</span>
              </Link>

              <Link
                to="/customer/shipments"
                className="customer-secondary-button"
              >
                Track Shipments
              </Link>
            </div>
          </div>

          <div className="customer-hero-visual">
            <div className="customer-route-card">
              <div className="customer-route-card-header">
                <div>
                  <span>LIVE DELIVERY NETWORK</span>
                  <strong>Shipment Journey</strong>
                </div>

                <div className="customer-live-indicator">
                  <span></span>
                  Live
                </div>
              </div>

              <div className="customer-route-map">
                <div className="customer-map-grid"></div>

                <div className="customer-route-line"></div>

                <div className="customer-route-point customer-route-start">
                  <span></span>
                  <div>
                    <small>Origin</small>
                    <strong>Shipment Created</strong>
                  </div>
                </div>

                <div className="customer-route-point customer-route-middle">
                  <span></span>
                  <div>
                    <small>Current Status</small>
                    <strong>In Transit</strong>
                  </div>
                </div>

                <div className="customer-route-point customer-route-end">
                  <span></span>
                  <div>
                    <small>Destination</small>
                    <strong>Final Delivery</strong>
                  </div>
                </div>

                <div className="customer-delivery-truck">🚚</div>
              </div>

              <div className="customer-route-footer">
                <div>
                  <span>Secure Tracking</span>
                  <strong>24/7 visibility</strong>
                </div>

                <div>
                  <span>Status Updates</span>
                  <strong>Real-time</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="customer-dashboard-section">
          <div className="customer-section-header">
            <div>
              <span className="customer-section-label">QUICK ACTIONS</span>
              <h2>Manage your shipments</h2>
              <p>
                Access the most important customer features directly from your
                dashboard.
              </p>
            </div>

            <div className="customer-secure-badge">
              <span>✓</span>
              Secure Portal
            </div>
          </div>

          <div className="customer-dashboard-cards">
            <Link
              to="/customer/create-shipment"
              className="customer-dashboard-card customer-create-card"
            >
              <div className="customer-card-top">
                <div className="customer-card-icon">＋</div>
                <span className="customer-card-number">01</span>
              </div>

              <div className="customer-card-content">
                <span className="customer-card-label">NEW SHIPMENT</span>
                <h3>Create Shipment</h3>
                <p>
                  Enter sender, receiver, and delivery details to create a new
                  shipment request.
                </p>
              </div>

              <div className="customer-card-footer">
                <span>Start creating</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/customer/shipments"
              className="customer-dashboard-card customer-track-card"
            >
              <div className="customer-card-top">
                <div className="customer-card-icon">⌖</div>
                <span className="customer-card-number">02</span>
              </div>

              <div className="customer-card-content">
                <span className="customer-card-label">ACTIVE DELIVERIES</span>
                <h3>My Shipments</h3>
                <p>
                  View your active shipments, tracking numbers, routes, and
                  current delivery status.
                </p>
              </div>

              <div className="customer-card-footer">
                <span>View shipments</span>
                <strong>→</strong>
              </div>
            </Link>

            <Link
              to="/customer/history"
              className="customer-dashboard-card customer-history-card"
            >
              <div className="customer-card-top">
                <div className="customer-card-icon">↺</div>
                <span className="customer-card-number">03</span>
              </div>

              <div className="customer-card-content">
                <span className="customer-card-label">PAST ACTIVITY</span>
                <h3>Delivery History</h3>
                <p>
                  Review delivered, cancelled, and previously completed
                  shipment records.
                </p>
              </div>

              <div className="customer-card-footer">
                <span>Open history</span>
                <strong>→</strong>
              </div>
            </Link>
          </div>
        </section>

        <section className="customer-dashboard-info-grid">
          <article className="customer-info-card">
            <div className="customer-info-icon">🔒</div>

            <div>
              <span>Secure Access</span>
              <h3>Your shipment data is protected</h3>
              <p>
                Secure authentication keeps your shipment and delivery
                information accessible only to your account.
              </p>
            </div>
          </article>

          <article className="customer-info-card">
            <div className="customer-info-icon">⚡</div>

            <div>
              <span>Fast Tracking</span>
              <h3>Find shipments instantly</h3>
              <p>
                Use your tracking number to quickly view the latest delivery
                progress and shipment status.
              </p>
            </div>
          </article>

          <article className="customer-info-card">
            <div className="customer-info-icon">✓</div>

            <div>
              <span>Reliable Delivery</span>
              <h3>Complete shipment visibility</h3>
              <p>
                Follow each shipment from creation through transit until its
                final delivery.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;