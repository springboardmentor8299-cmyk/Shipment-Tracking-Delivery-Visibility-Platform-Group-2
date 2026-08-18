import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="landing-section cta-section">
      <div className="app-container text-center">
        <div className="section-heading">
          <h2>Ready to simplify shipment management?</h2>
          <p>
            Join ShipTrack-Pro and give every team the control it needs to
            deliver shipments faster, safer, and with complete visibility.
          </p>
        </div>

        <div className="cta-button-row">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline-primary btn-lg">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;