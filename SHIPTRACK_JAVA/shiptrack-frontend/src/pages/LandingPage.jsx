import LandingNavbar
from "../components/LandingNavbar";

import { useNavigate } from "react-router-dom";
import LandingFooter from "../components/LandingFooter";

function LandingPage() {

    const navigate = useNavigate();

    return (

        <div>

            <LandingNavbar />

            {}

            <section
                className="text-white d-flex align-items-center"
                style={{
                    minHeight: "100vh",
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2000')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative"
                }}
            >

                {}

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)"
                    }}
                ></div>

                <div
                    className="container position-relative"
                    style={{ zIndex: 2 }}
                >

                    <div className="row align-items-center">

                        {}

                        <div className="col-lg-7 text-start">

                            <h1
                                className="display-3 fw-bold mb-4"
                            >
                                ShipTrack
                            </h1>

                            <p
                                className="lead mb-4"
                            >
                                Smart Shipment Tracking &
                                Logistics Management Platform
                            </p>

                            <p
                                className="fs-5 mb-5"
                            >
                                Track shipments in real-time,
                                manage deliveries efficiently,
                                and streamline logistics
                                operations with ease.
                            </p>


                        </div>

                        {}




                    </div>

                </div>

            </section>

            {}

            <section
                id="features"
                className="py-5 bg-light"
            >

                <div className="container">

                    <h2
                        className="text-center mb-5"
                    >
                        Why Choose ShipTrack?
                    </h2>

                    <div
                        className="row g-4"
                        data-aos="fade-up"
                    >

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h3>📦</h3>
                                    <h5>
                                        Shipment Management
                                    </h5>
                                    <p>
                                        Create, update,
                                        and manage shipments
                                        effortlessly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h3>📍</h3>
                                    <h5>
                                        Real-Time Tracking
                                    </h5>
                                    <p>
                                        Track shipment
                                        progress instantly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h3>📊</h3>
                                    <h5>
                                        Analytics Dashboard
                                    </h5>
                                    <p>
                                        Powerful analytics
                                        and shipment insights.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </section>

            {}

            <section
                id="how-it-works"
                className="py-5"
            >

                <div className="container">

                    <h2
                        className="text-center mb-5"
                    >
                        How It Works
                    </h2>

                    <div
                        className="row text-center"
                        data-aos="zoom-in"
                    >

                        <div className="col-md-3">
                            <h1>1️⃣</h1>
                            <h5>Create Shipment</h5>
                        </div>

                        <div className="col-md-3">
                            <h1>2️⃣</h1>
                            <h5>Generate Tracking Number</h5>
                        </div>

                        <div className="col-md-3">
                            <h1>3️⃣</h1>
                            <h5>Track Shipment</h5>
                        </div>

                        <div className="col-md-3">
                            <h1>4️⃣</h1>
                            <h5>Deliver Successfully</h5>
                        </div>

                    </div>

                </div>

            </section>

            {}

            <section
                className="py-5"
                style={{
                    background:
                        "linear-gradient(135deg,#0d6efd,#0dcaf0)"
                }}
            >

                <div className="container">

                    <div
                        className="row text-center"
                        data-aos="fade-up"
                    >

                        <div className="col-md-3 mb-3">

                            <div className="card shadow">

                                <div className="card-body">

                                    <h1>
                                        10K+
                                    </h1>

                                    <p>
                                        Shipments Delivered
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="col-md-3 mb-3">

                            <div className="card shadow">

                                <div className="card-body">

                                    <h1>
                                        500+
                                    </h1>

                                    <p>
                                        Clients
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="col-md-3 mb-3">

                            <div className="card shadow">

                                <div className="card-body">

                                    <h1>
                                        99.9%
                                    </h1>

                                    <p>
                                        Success Rate
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="col-md-3 mb-3">

                            <div className="card shadow">

                                <div className="card-body">

                                    <h1>
                                        24/7
                                    </h1>

                                    <p>
                                        Support
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {}

            <section
                id="testimonials"
                data-aos="fade-right"
                className="py-5 bg-light"
            >

                <div className="container">

                    <h2 className="text-center mb-5">
                        Trusted By Businesses Worldwide
                    </h2>

                    <div className="row">

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h4>⭐⭐⭐⭐⭐</h4>
                                    <p>
                                        ShipTrack transformed our
                                        logistics workflow.
                                    </p>
                                    <strong>Rahul Sharma</strong>
                                    <p>Logistics Manager</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h4>⭐⭐⭐⭐⭐</h4>
                                    <p>
                                        Real-time tracking improved
                                        customer trust.
                                    </p>
                                    <strong>Priya Patel</strong>
                                    <p>Business Owner</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card shadow h-100">
                                <div className="card-body text-center">
                                    <h4>⭐⭐⭐⭐⭐</h4>
                                    <p>
                                        Easy to use and highly reliable.
                                    </p>
                                    <strong>Amit Verma</strong>
                                    <p>Supply Chain Lead</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {}

            <section
                className="py-5"
                data-aos="fade-left"
            >

                <div className="container">

                    <h2
                        className="text-center mb-5"
                    >
                        Frequently Asked Questions
                    </h2>

                    <div
                        className="accordion"
                        id="faqAccordion"
                    >

                        <div className="accordion-item">

                            <h2 className="accordion-header">

                                <button
                                    className="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#faq1"
                                >
                                    How can I track my shipment?
                                </button>

                            </h2>

                            <div
                                id="faq1"
                                className="accordion-collapse collapse show"
                                data-bs-parent="#faqAccordion"
                            >

                                <div className="accordion-body">

                                    Enter your tracking number
                                    in the Track Shipment page
                                    to view the latest shipment
                                    status and history.

                                </div>

                            </div>

                        </div>

                        <div className="accordion-item">

                            <h2 className="accordion-header">

                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#faq2"
                                >
                                    Is ShipTrack secure?
                                </button>

                            </h2>

                            <div
                                id="faq2"
                                className="accordion-collapse collapse"
                                data-bs-parent="#faqAccordion"
                            >

                                <div className="accordion-body">

                                    Yes. ShipTrack uses JWT
                                    Authentication and
                                    Role-Based Access Control
                                    for secure operations.

                                </div>

                            </div>

                        </div>

                        <div className="accordion-item">

                            <h2 className="accordion-header">

                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#faq3"
                                >
                                    Can businesses manage
                                    multiple shipments?
                                </button>

                            </h2>

                            <div
                                id="faq3"
                                className="accordion-collapse collapse"
                                data-bs-parent="#faqAccordion"
                            >

                                <div className="accordion-body">

                                    Yes. Businesses can create,
                                    update, track and monitor
                                    multiple shipments through
                                    a single dashboard.

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {}

            <section
                id="contact"
                className="py-5 bg-dark text-white"
                data-aos="zoom-in"
            >

                <div className="container">

                    <h2
                        className="text-center mb-5"
                    >
                        Contact Us
                    </h2>

                    <div className="row">

                        <div className="col-md-6">

                            <h4>
                                Get In Touch
                            </h4>

                            <p>
                                We'd love to hear from you.
                                Reach out for support,
                                partnerships, or inquiries.
                            </p>

                            <p>
                                📧 support@shiptrack.com
                            </p>

                            <p>
                                📞 +91 9876543210
                            </p>

                            <p>
                                📍 Bengaluru, India
                            </p>

                        </div>

                        <div className="col-md-6">

                            <form>

                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Your Name"
                                />

                                <input
                                    type="email"
                                    className="form-control mb-3"
                                    placeholder="Your Email"
                                />

                                <textarea
                                    className="form-control mb-3"
                                    rows="4"
                                    placeholder="Your Message"
                                ></textarea>

                                <button
                                    className="btn btn-primary"
                                >
                                    Send Message
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </section>


            {}

            <section
                className="py-5 text-center"
            >

                <div className="container">

                    <h2 className="mb-4">
                        Ready to Streamline
                        Your Logistics?
                    </h2>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Get Started
                    </button>

                </div>

            </section>
<LandingFooter />
        </div>
    );
}

export default LandingPage;