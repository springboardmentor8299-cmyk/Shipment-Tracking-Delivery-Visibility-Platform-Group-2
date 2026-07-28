import React from "react";
import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

import {
  FaTruck,
  FaShip,
  FaPlane,
  FaBars,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight
} from "react-icons/fa";

function LandingPage() {

    const navigate = useNavigate();

  return (

    <div className="landing-page">

      {/* ===========================
            TOP HEADER
      ============================ */}
<header class="header-wrapper">
      <div className="top-header">

        <div className="top-left">

          <span>
            <FaPhoneAlt /> +91 93138 49474
          </span>

          <span>
            <FaEnvelope /> support@shiptrack.com
          </span>

        </div>

        <div className="top-right">

          <span>
            <FaMapMarkerAlt /> Bangalore, India
          </span>

        </div>

      </div>

      {/* ===========================
            NAVBAR
      ============================ */}

      <nav className="navbar">

        <div className="logo">

          <FaTruck className="logo-icon" />

          <h2>
            ShipTrack
          </h2>

        </div>

        <ul className="nav-links">

          <li>
            <a href="#home">Home</a>
          </li>

          <li>
            <a href="#about">About</a>
          </li>

          <li>
            <a href="#services">Services</a>
          </li>

          <li>
            <a href="#tracking">Tracking</a>
          </li>

          <li>
            <a href="#contact">Contact</a>
          </li>

        </ul>

        <div className="nav-buttons">
            <button 
                className="login-btn" 
                onClick={() => navigate("/login")}
            >
                Login
            </button>

            <button 
                className="register-btn" 
                onClick={() => navigate("/register")}
            >
                Register
            </button>
        </div>

        <FaBars className="menu-icon" />

      </nav>
</header>
      {/* ===========================
              HERO SECTION
      ============================ */}

      <section
        id="home"
        className="hero-section"
      >

        <div className="hero-left">

          <span className="hero-tag">

            Modern Logistics Platform

          </span>

          <h1>

            Smart Logistics &
            <br />

            Shipment Tracking
            <br />

            Made Easy

          </h1>

          <p>

            ShipTrack helps customers, logistics operators,
            business clients and support agents manage
            shipments with real-time tracking, secure
            delivery and intelligent logistics solutions.

          </p>

          <div className="hero-buttons">

            <button className="primary-btn">

              Track Shipment

              <FaArrowRight />

            </button>

            <button className="secondary-btn">

              Learn More

            </button>

          </div>

          {/* FEATURES */}

          <div className="hero-features">

            <div className="feature-box">

              <FaTruck />

              <h4>

                Fast Delivery

              </h4>

            </div>

            <div className="feature-box">

              <FaShip />

              <h4>

                Ocean Freight

              </h4>

            </div>

            <div className="feature-box">

              <FaPlane />

              <h4>

                Air Cargo

              </h4>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="hero-right">

          <img
            src="https://images.unsplash.com/photo-1565891741441-64926e441838?w=900"
            alt="Truck"
          />

        </div>

      </section>

      {/* ===========================
            COMPANY STATS
      ============================ */}

      <section className="stats-section">

        <div className="stat-card">

          <h2>

            50K+

          </h2>

          <p>

            Deliveries Completed

          </p>

        </div>

        <div className="stat-card">

          <h2>

            120+

          </h2>

          <p>

            Logistics Partners

          </p>

        </div>

        <div className="stat-card">

          <h2>

            25+

          </h2>

          <p>

            Countries Served

          </p>

        </div>

        <div className="stat-card">

          <h2>

            99%

          </h2>

          <p>

            Customer Satisfaction

          </p>

        </div>

      </section>

           {/* ===========================
              ABOUT SECTION
      ============================ */}

      <section
        id="about"
        className="about-section"
      >

        <div className="about-image">

          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900"
            alt="Warehouse"
          />

        </div>

        <div className="about-content">

          <span className="section-title">

            ABOUT SHIPTRACK

          </span>

          <h2>

            Delivering Logistics
            <br />

            Solutions Worldwide

          </h2>

          <p>

            ShipTrack is an intelligent logistics platform
            designed to simplify shipment management,
            package tracking, delivery operations,
            customer support, and business logistics.

          </p>

          <div className="about-grid">

            <div className="about-card">

              <FaTruck className="about-icon"/>

              <div>

                <h4>

                  Road Freight

                </h4>

                <p>

                  Fast domestic deliveries.

                </p>

              </div>

            </div>

            <div className="about-card">

              <FaShip className="about-icon"/>

              <div>

                <h4>

                  Ocean Freight

                </h4>

                <p>

                  Global shipping services.

                </p>

              </div>

            </div>

            <div className="about-card">

              <FaPlane className="about-icon"/>

              <div>

                <h4>

                  Air Freight

                </h4>

                <p>

                  Quick international transport.

                </p>

              </div>

            </div>

          </div>

          <button className="primary-btn">

            Discover More

          </button>

        </div>

      </section>

      {/* ===========================
              SERVICES
      ============================ */}

      <section
        id="services"
        className="services-section"
      >

        <span className="section-title">

          OUR SERVICES

        </span>

        <h2>

          Everything You Need
          <br />

          For Logistics

        </h2>

        <div className="services-grid">

          <div className="service-card">

            <FaTruck className="service-icon"/>

            <h3>

              Customer Portal

            </h3>

            <p>

              Track your shipments,
              delivery status,
              and shipment history.

            </p>

          </div>

          <div className="service-card">

            <FaShip className="service-icon"/>

            <h3>

              Business Client

            </h3>

            <p>

              Manage bulk shipments,
              invoices,
              and logistics reports.

            </p>

          </div>

          <div className="service-card">

            <FaPlane className="service-icon"/>

            <h3>

              Logistics Operator

            </h3>

            <p>

              Update deliveries,
              shipment status,
              and assigned routes.

            </p>

          </div>

          <div className="service-card">

            <FaEnvelope className="service-icon"/>

            <h3>

              Support Agent

            </h3>

            <p>

              Resolve customer issues,
              manage tickets,
              and provide assistance.

            </p>

          </div>

        </div>

      </section>

      {/* ===========================
            WHY CHOOSE US
      ============================ */}

      <section className="why-section">

        <span className="section-title">

          WHY CHOOSE US

        </span>

        <h2>

          Trusted Logistics
          <br />

          Partner

        </h2>

        <div className="why-grid">

          <div className="why-card">

            <h3>

              🚚 Fast Delivery

            </h3>

            <p>

              On-time deliveries with optimized routes.

            </p>

          </div>

          <div className="why-card">

            <h3>

              📍 Live Tracking

            </h3>

            <p>

              Monitor your shipment in real time.

            </p>

          </div>

          <div className="why-card">

            <h3>

              🔒 Secure Shipment

            </h3>

            <p>

              Safe and reliable transportation.

            </p>

          </div>

          <div className="why-card">

            <h3>

              🌍 Worldwide Network

            </h3>

            <p>

              Delivering across multiple countries.

            </p>

          </div>

        </div>

      </section>
            {/* ===========================
            TESTIMONIALS
      ============================ */}

      <section className="testimonial-section">

        <span className="section-title">

          TESTIMONIALS

        </span>

        <h2>

          What Our Customers Say

        </h2>

        <div className="testimonial-grid">

          <div className="testimonial-card">

            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvKmILfjjopBXVT5Qo7k4J8fhFAPVFFw0Z1nse29T6xA&s=10"
              alt="customer"
            />

            <h3>

              Vincenzo Cassano

            </h3>

            <h4>

              customer

            </h4>

            <p>

              ShipTrack has completely transformed
              our shipment management.
              Real-time tracking is incredibly accurate.

            </p>

          </div>

          <div className="testimonial-card">

            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTripxPn0LX5gAQySm12TmyK3aVj-8lm8IE7yFw8-TmWQ&s=10"
              alt="customer"
            />

            <h3>

              Anna Go

            </h3>

            <h4>

              Customer

            </h4>

            <p>

              Very easy to track packages.
              Customer support was excellent
              and delivery was on time.

            </p>

          </div>

          <div className="testimonial-card">

            <img
              src="https://wimg.heraldcorp.com/content/default/2016/11/13/20161113000315_0.jpg"
              alt="customer"
            />

            <h3>

              Je-Ha Kim

            </h3>

            <h4>

              customer

            </h4>

            <p>

              The dashboard makes delivery
              operations simple and efficient.

            </p>

          </div>

        </div>

      </section>

      {/* ===========================
            CALL TO ACTION
      ============================ */}

      <section 
        id="tracking"
        className="cta-section">

        <div className="cta-content">

          <h2>

            Ready To Ship Smarter?

          </h2>

          <p>

            Join thousands of customers and businesses
            using ShipTrack to simplify logistics.

          </p>

          <div className="cta-buttons">

            <button className="primary-btn">

              Get Started

            </button>

            <button className="secondary-btn">

              Track Shipment

            </button>

          </div>

        </div>

      </section>

      {/* ===========================
            CONTACT
      ============================ */}

      <section
        id="contact"
        className="contact-section"
      >

        <span className="section-title">

          CONTACT US

        </span>

        <h2>

          We'd Love To Hear From You

        </h2>

        <div className="contact-container">

          <div className="contact-info">

            <div>

              <FaPhoneAlt />

              <span>

                +91 93138 49474

              </span>

            </div>

            <div>

              <FaEnvelope />

              <span>

                support@shiptrack.com

              </span>

            </div>

            <div>

              <FaMapMarkerAlt />

              <span>

                Bangalore, Karnataka, India

              </span>

            </div>

          </div>

          <form className="contact-form">

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="email"
              placeholder="Email Address"
            />

            <textarea
              rows="5"
              placeholder="Your Message"
            />

            <button
              type="submit"
              className="primary-btn"
            >

              Send Message

            </button>

          </form>

        </div>

      </section>

      {/* ===========================
              FOOTER
      ============================ */}

      <footer className="footer">

        <div className="footer-grid">

          <div>

            <h2>

              ShipTrack

            </h2>

            <p>

              Smart Logistics &
              Shipment Tracking Platform.

            </p>

          </div>

          <div>

            <h3>

              Quick Links

            </h3>

            <ul>

              <li>

                Home

              </li>

              <li>

                About

              </li>

              <li>

                Services

              </li>

              <li>

                Contact

              </li>

            </ul>

          </div>

          <div>

            <h3>

              Services

            </h3>

            <ul>

              <li>

                Shipment Tracking

              </li>

              <li>

                Business Logistics

              </li>

              <li>

                Customer Support

              </li>

              <li>

                Delivery Management

              </li>

            </ul>

          </div>

          <div>

            <h3>

              Contact

            </h3>

            <p>

              support@shiptrack.com

            </p>

            <p>

              +91 93138 49474

            </p>

            <p>

              Bangalore, India

            </p>

          </div>

        </div>

        <hr />

        <p className="copyright">

          © 2026 ShipTrack.
          All Rights Reserved.

        </p>

      </footer>

    </div>
  );

}

export default LandingPage;