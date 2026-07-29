import { Link, useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();
    return (
        <section
            className="py-5"
            style={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--brand-bg-light)",
            }}
        >
            <div className="container">

                <div className="row align-items-center gy-5">

                    {/* LEFT SIDE */}

                    <div className="col-lg-6">

                        {/* <span
                            className="badge px-4 py-2 mb-4"
                            style={{
                                backgroundColor: "#E7F1FF",
                                color: "#0F4C81",
                                borderRadius: "50px",
                                fontSize: "15px",
                                fontWeight: "600",
                            }}
                        >
                            🚀 Next Generation Logistics Platform
                        </span> */}

                        <h1
                            className="fw-bold mb-4"
                            style={{
                                color: "var(--brand-primary)",
                                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                                lineHeight: "1.15",
                            }}
                        >
                            Track Every Shipment.
                            <br />
                            Deliver With Confidence.
                        </h1>

                        <p
                            className="lead"
                            style={{
                                color: "var(--brand-text-muted)",
                                maxWidth: "580px",
                                fontSize: "1.25rem",
                            }}
                        >
                            Manage shipments, monitor deliveries, optimize
                            routes, and improve logistics efficiency with one
                            powerful platform built for modern businesses.
                        </p>

                        <div className="d-flex flex-wrap gap-3 mt-5">

                            <Link
                                to="/register"
                                className="btn btn-lg px-4 py-3"
                                style={{
                                    backgroundColor: "var(--brand-primary)",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    minWidth: "190px",
                                    fontWeight: "600",
                                }}
                            >
                                Create Account
                            </Link>

                            <button
                                className="btn btn-lg px-4 py-3"
                                style={{
                                    border: "2px solid var(--brand-primary)",
                                    color: "var(--brand-primary)",
                                    borderRadius: "12px",
                                    minWidth: "190px",
                                    fontWeight: "600",
                                    backgroundColor: "var(--brand-bg-card)",
                                }}
                                onClick={() => navigate("/login")}
                            >
                                Track Shipment
                            </button>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="col-lg-6 d-flex justify-content-center">

                        <div
                            className="position-relative"
                            style={{
                                width: "100%",
                                maxWidth: "500px",
                            }}
                        >

                            {/* Background Circle */}

                            <div
                                style={{
                                    position: "absolute",
                                    width: "420px",
                                    height: "420px",
                                    borderRadius: "50%",
                                    background:
                                        "linear-gradient(135deg,var(--brand-primary-light),#D9EFFF)",
                                    top: "50%",
                                    left: "50%",
                                    transform:
                                        "translate(-50%, -50%)",
                                    zIndex: 1,
                                }}
                            ></div>

                            {/* Truck Image */}

                            <img
                                src="/images/delivery-truck.png"
                                alt="Delivery Truck"
                                className="img-fluid position-relative"
                                style={{
                                    maxWidth: "380px",
                                    width: "100%",
                                    objectFit: "contain",
                                    zIndex: 2,
                                    transform: "translateX(35px)",
                                }}
                            />

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default Hero;