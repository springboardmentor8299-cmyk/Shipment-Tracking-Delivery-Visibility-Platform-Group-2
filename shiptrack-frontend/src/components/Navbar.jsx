import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="landing-navbar-wrapper">
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand" onClick={closeMenu}>
          <span className="landing-brand-icon">🚚</span>

          <span className="landing-brand-text">
            ShipTrack<span>-Pro</span>
          </span>
        </Link>

        <button
          type="button"
          className={`landing-menu-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`landing-nav-content ${menuOpen ? "open" : ""}`}>
          <ul className="landing-nav-links">
            <li>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>

            <li>
              <a href="#features" onClick={closeMenu}>
                Features
              </a>
            </li>

            <li>
              <a href="#tracking" onClick={closeMenu}>
                Tracking
              </a>
            </li>

            <li>
              <a href="#contact" onClick={closeMenu}>
                Contact
              </a>
            </li>
          </ul>

          <div className="landing-nav-buttons">
            <Link
              to="/login"
              className="landing-login-button"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="landing-register-button"
              onClick={closeMenu}
            >
              Create Account
              <span aria-hidden="true"></span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;