import { Mail, Phone, MapPin } from "lucide-react";

function Contact() {
  return (
    <section id="contact" className="landing-section contact-section">
      <div className="app-container">
        <div className="section-heading">
          <h2>Get in touch</h2>
          <p>
            Have questions? We'd love to hear from you. Contact our support team anytime.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="icon-shell" style={{ background: "#e7f1ff", color: "#2563eb" }}>
              <Mail size={28} />
            </div>
            <h3>Email Us</h3>
            <p>support@shiptrack-pro.com</p>
            <p>We'll respond within 24 hours.</p>
          </div>

          <div className="contact-card">
            <div className="icon-shell" style={{ background: "#fff3cd", color: "#d97706" }}>
              <Phone size={28} />
            </div>
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
            <p>Mon-Fri, 9AM-6PM EST</p>
          </div>

          <div className="contact-card">
            <div className="icon-shell" style={{ background: "#d1fae5", color: "#059669" }}>
              <MapPin size={28} />
            </div>
            <h3>Office</h3>
            <p>123 Logistics Avenue</p>
            <p>New York, NY 10001</p>
          </div>
        </div>

        <div className="contact-form-card">
          <h3>Send us a message</h3>
          <form>
            <div className="form-field">
              <label>Name</label>
              <input type="text" placeholder="Your name" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" />
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea placeholder="Your message here..." rows={5} />
            </div>
            <button type="submit" className="btn btn-primary button-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
