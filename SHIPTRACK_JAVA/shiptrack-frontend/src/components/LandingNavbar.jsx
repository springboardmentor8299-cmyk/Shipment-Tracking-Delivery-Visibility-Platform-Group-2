import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function LandingNavbar() {

    const [scrolled, setScrolled] =
        useState(false);

    useEffect(() => {

        const handleScroll = () => {

            setScrolled(
                window.scrollY > 50
            );
        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );

    }, []);

    return (

        <nav
            className="navbar navbar-expand-lg navbar-dark fixed-top"
            style={{
                background: scrolled
                    ? "rgba(0,0,0,0.9)"
                    : "transparent",

                backdropFilter:
                    scrolled
                        ? "blur(10px)"
                        : "none",

                boxShadow:
                    scrolled
                        ? "0 2px 15px rgba(0,0,0,0.3)"
                        : "none",

                transition:
                    "all 0.3s ease"
            }}
        >

            <div className="container">

                <Link
                    className="navbar-brand fw-bold fs-3"
                    to="/"
                >
                    🚚 ShipTrack
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarContent"
                >

                    <ul className="navbar-nav mx-auto">

                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#features"
                            >
                                Features
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#how-it-works"
                            >
                                How It Works
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#testimonials"
                            >
                                Testimonials
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#contact"
                            >
                                Contact
                            </a>
                        </li>

                    </ul>

                    <div>

                        <Link
                            to="/login"
                            className="btn btn-outline-light me-2"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="btn btn-primary"
                        >
                            Register
                        </Link>

                    </div>

                </div>

            </div>

        </nav>
    );
}

export default LandingNavbar;