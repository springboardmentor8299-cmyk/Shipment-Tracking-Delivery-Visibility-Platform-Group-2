import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="landing-footer" id="contact">
      <div className="landing-footer-container">
        <div className="landing-footer-main">
          <div className="landing-footer-brand-section">
            <Link to="/" className="landing-footer-brand">
              <span className="landing-footer-logo">🚚</span>

              <span>
                ShipTrack<span>-Pro</span>
              </span>
            </Link>

            <p>
              A smart logistics management platform designed for shipment
              creation, delivery tracking, status management and performance
              reporting.
            </p>

            <div className="landing-footer-status">
              <span className="landing-status-dot"></span>
              Logistics platform available
            </div>
          </div>

          <div className="landing-footer-column">
            <h3>Platform</h3>

            <a href="#features">Features</a>
            <a href="#tracking">Tracking</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
          </div>

          <div className="landing-footer-column">
            <h3>Services</h3>

            <span>Shipment Management</span>
            <span>Delivery Tracking</span>
            <span>Analytics Reports</span>
            <span>Delivery History</span>
          </div>

          <div className="landing-footer-column">
            <h3>Contact</h3>

            <a href="mailto:support@shiptrackpro.com">
              support@shiptrackpro.com
            </a>

            <span>Customer Support</span>
            <span>Secure Platform</span>
            <span>India</span>
          </div>
        </div>

        <div className="landing-footer-divider"></div>

        <div className="landing-footer-bottom">
          <p>© 2026 ShipTrack-Pro. All Rights Reserved.</p>

          <div className="landing-footer-bottom-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;