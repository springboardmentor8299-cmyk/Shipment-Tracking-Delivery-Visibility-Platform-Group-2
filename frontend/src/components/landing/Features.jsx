import { Package, MapPinned, ShieldCheck, BarChart3 } from "lucide-react";

function Features() {
  return (
    <section className="landing-section" id="features">
      <div className="app-container">
        <div className="section-heading">
          <h2>Why Choose ShipTrack-Pro?</h2>
          <p>
            Designed for modern logistics teams, our platform brings every delivery,
            customer update, and shipping detail into one place.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon feature-icon-blue">
              <Package size={28} />
            </div>
            <h5>Shipment Management</h5>
            <p>Create, update, and organize shipments with a clean, fast workflow.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon feature-icon-teal">
              <MapPinned size={28} />
            </div>
            <h5>Real-Time Tracking</h5>
            <p>See live shipment progress and route status for every delivery.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon feature-icon-cyan">
              <ShieldCheck size={28} />
            </div>
            <h5>Secure Authorization</h5>
            <p>Protect access with roles, JWT security, and safe login flows.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon feature-icon-indigo">
              <BarChart3 size={28} />
            </div>
            <h5>Dashboard Analytics</h5>
            <p>Monitor deliveries, customer performance, and logistics health.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Features;