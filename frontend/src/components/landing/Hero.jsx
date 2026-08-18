import { Link } from "react-router-dom";
import { Truck, ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";
import heroImage from "../../assets/cargoflow-hero-banner.png";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        {/* Full-width Top Navigation Bar */}
        <nav className="hero-navbar">
          <div className="brand-logo">
            <div className="brand-mark-box">
              <Truck size={24} color="#ffffff" strokeWidth={2.2} />
            </div>
            <div>
              <p className="brand-title">CargoFlow</p>
              <span className="brand-subtitle">Smart Logistics Platform</span>
            </div>
          </div>

          <ul className="nav-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>

          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline-light">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </div>
        </nav>

        {/* Hero Main Content - Full Height Grid */}
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-pulse" />
              <span> Real-time Live Tracking & ETA Engine</span>
            </div>

            <h1 className="hero-title">
              Next-Gen Delivery Monitoring & Intelligent ETA Prediction
            </h1>

            <p className="hero-description">
              Track freight live with OpenStreetMap & Leaflet interactive routes. Experience automated ETA calculations, driver location pings, and proactive delay warnings in one unified control center.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                <span>Start Live Tracking</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                <span>Access Control Center</span>
              </Link>
            </div>

            <div className="hero-highlights-grid">
              <div className="hero-highlight-card">
                <MapPin size={20} color="#60a5fa" />
                <div>
                  <strong>Leaflet & OSM Live Maps</strong>
                  <span>Interactive route polylines & driver pings</span>
                </div>
              </div>
              <div className="hero-highlight-card">
                <Clock size={20} color="#60a5fa" />
                <div>
                  <strong>Dynamic ETA Engine</strong>
                  <span>Haversine distance & delay detection</span>
                </div>
              </div>
              <div className="hero-highlight-card">
                <ShieldCheck size={20} color="#60a5fa" />
                <div>
                  <strong>Enterprise Security</strong>
                  <span>Role-based access for Admin & Customer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-shell">
              <img src={heroImage} alt="CargoFlow 3D Live Delivery Monitoring" className="hero-banner-img" />
              <div className="hero-image-overlay-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;