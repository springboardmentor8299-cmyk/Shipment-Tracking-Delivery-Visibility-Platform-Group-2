import "../styles/Features.css";

const features = [
  {
    icon: "📍",
    title: "Live Shipment Tracking",
    description:
      "Monitor shipment movement and view the latest delivery status from one convenient platform.",
  },
  {
    icon: "🚚",
    title: "Shipment Management",
    description:
      "Create, organize and manage shipments through a simple and efficient workflow.",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    description:
      "Understand shipment performance through clear reports, statistics and visual dashboards.",
  },
  {
    icon: "🔐",
    title: "Secure Access",
    description:
      "Role-based access and JWT authentication keep accounts and shipment information protected.",
  },
  {
    icon: "🔔",
    title: "Status Visibility",
    description:
      "Stay informed about pending, in-transit, out-for-delivery and completed shipments.",
  },
  {
    icon: "🗂️",
    title: "Delivery History",
    description:
      "Access completed delivery records and review previous shipment information whenever required.",
  },
];

function Features() {
  return (
    <section className="landing-features" id="features">
      <div className="landing-features-container">
        <div className="landing-features-heading">
          <span className="landing-section-label">POWERFUL FEATURES</span>

          <h2>
            Everything you need to manage
            <span> modern deliveries</span>
          </h2>

          <p>
            ShipTrack-Pro combines shipment management, tracking, security and
            reporting in one reliable logistics platform.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature, index) => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-card-top">
                <span className="landing-feature-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="landing-feature-icon">{feature.icon}</div>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <div className="landing-feature-line"></div>
            </article>
          ))}
        </div>

        <div className="landing-process-banner" id="tracking">
          <div className="landing-process-content">
            <span className="landing-process-label">
              SIMPLE DELIVERY WORKFLOW
            </span>

            <h3>From shipment creation to successful delivery</h3>

            <p>
              Create a shipment, follow its status and review the complete
              delivery history from your account.
            </p>
          </div>

          <div className="landing-process-steps">
            <div className="landing-process-step">
              <span>1</span>
              <div>
                <strong>Create</strong>
                <small>Add shipment details</small>
              </div>
            </div>

            <div className="landing-process-arrow">→</div>

            <div className="landing-process-step">
              <span>2</span>
              <div>
                <strong>Track</strong>
                <small>Monitor shipment status</small>
              </div>
            </div>

            <div className="landing-process-arrow">→</div>

            <div className="landing-process-step">
              <span>3</span>
              <div>
                <strong>Deliver</strong>
                <small>Complete the delivery</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;