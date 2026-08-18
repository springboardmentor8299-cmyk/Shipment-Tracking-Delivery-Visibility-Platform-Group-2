function FAQ() {
  return (
    <section id="faq" className="landing-section">
      <div className="app-container">
        <div className="section-heading">
          <h2>Frequently Asked Questions</h2>
          <p>Answers for customers and operations teams using ShipTrack-Pro.</p>
        </div>

        <div className="faq-grid">
          <article className="faq-card">
            <h4>Can I track shipments in real time?</h4>
            <p>Yes. ShipTrack-Pro updates delivery status automatically so your customers and operations teams see accurate progress.</p>
          </article>

          <article className="faq-card">
            <h4>Do I need separate dashboards for admins and customers?</h4>
            <p>Yes. The platform supports role-based dashboards so each user sees only the actions and data they need.</p>
          </article>

          <article className="faq-card">
            <h4>Is registration required for tracking?</h4>
            <p>Customers can register to view shipment details securely, while admins get access to management and analytics tools.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
