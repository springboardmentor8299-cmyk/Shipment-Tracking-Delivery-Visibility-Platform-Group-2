import { Link } from "react-router-dom";
import "../styles/Hero.css";

function Hero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-container">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot"></span>
            Smart logistics and shipment visibility
          </div>

          <h1>
            Track every shipment.
            <span> Deliver with confidence.</span>
          </h1>

          <p className="landing-hero-description">
            Create shipments, monitor delivery progress, manage logistics
            operations and access complete tracking history through one secure
            and reliable platform.
          </p>

          <div className="landing-hero-buttons">
            <Link to="/register" className="landing-hero-primary-button">
              Get Started
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/login" className="landing-hero-secondary-button">
              <span className="landing-hero-search-icon">⌖</span>
              Track Shipment
            </Link>
          </div>

          <div className="landing-hero-benefits">
            <div className="landing-hero-benefit">
              <span>✓</span>
              Secure JWT authentication
            </div>

            <div className="landing-hero-benefit">
              <span>✓</span>
              Role-based dashboards
            </div>

            <div className="landing-hero-benefit">
              <span>✓</span>
              Delivery status history
            </div>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-hero-glow landing-hero-glow-one"></div>
          <div className="landing-hero-glow landing-hero-glow-two"></div>

          <div className="landing-hero-dashboard">
            <div className="landing-hero-dashboard-header">
              <div>
                <span className="landing-hero-dashboard-label">
                  LIVE SHIPMENT
                </span>

                <h3>Delivery Overview</h3>
              </div>

              <div className="landing-hero-live-status">
                <span></span>
                Active
              </div>
            </div>

            <div className="landing-hero-route">
              <div className="landing-hero-location">
                <span className="landing-hero-location-icon start">A</span>

                <div>
                  <small>Pickup location</small>
                  <strong>New Delhi</strong>
                </div>
              </div>

              <div className="landing-hero-route-line">
                <span className="landing-hero-route-progress"></span>

                <div className="landing-hero-truck">🚚</div>
              </div>

              <div className="landing-hero-location destination">
                <span className="landing-hero-location-icon end">B</span>

                <div>
                  <small>Delivery location</small>
                  <strong>Chandigarh</strong>
                </div>
              </div>
            </div>

            <div className="landing-hero-progress-section">
              <div className="landing-hero-progress-header">
                <span>Shipment progress</span>
                <strong>72%</strong>
              </div>

              <div className="landing-hero-progress-bar">
                <span></span>
              </div>
            </div>

            <div className="landing-hero-status-grid">
              <div className="landing-hero-status-card">
                <span className="landing-hero-status-icon blue">📦</span>

                <div>
                  <small>Tracking number</small>
                  <strong>STP202600184</strong>
                </div>
              </div>

              <div className="landing-hero-status-card">
                <span className="landing-hero-status-icon purple">🚛</span>

                <div>
                  <small>Current status</small>
                  <strong>In Transit</strong>
                </div>
              </div>

              <div className="landing-hero-status-card">
                <span className="landing-hero-status-icon green">📅</span>

                <div>
                  <small>Expected delivery</small>
                  <strong>18 July 2026</strong>
                </div>
              </div>

              <div className="landing-hero-status-card">
                <span className="landing-hero-status-icon orange">📍</span>

                <div>
                  <small>Last update</small>
                  <strong>Ambala, Haryana</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero-floating-card landing-hero-floating-card-one">
            <span className="landing-hero-floating-icon">✓</span>

            <div>
              <strong>Shipment Updated</strong>
              <small>Status changed to In Transit</small>
            </div>
          </div>

          <div className="landing-hero-floating-card landing-hero-floating-card-two">
            <span className="landing-hero-floating-icon package">📦</span>

            <div>
              <strong>Fast Delivery</strong>
              <small>Secure and reliable logistics</small>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-hero-trusted">
        <span>Built for modern logistics management</span>

        <div className="landing-hero-trusted-items">
          <div>Secure Access</div>
          <div>Shipment Visibility</div>
          <div>Role Management</div>
          <div>Smart Reports</div>
        </div>
      </div>
    </section>
  );
}

export default Hero;