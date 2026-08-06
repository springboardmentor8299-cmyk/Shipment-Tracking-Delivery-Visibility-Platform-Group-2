import "../../styles/login.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";

import { forgotPassword } from "../../services/authService";
import logo from "../../assets/logo.jpg";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await forgotPassword(username);
      // Always show the same success state, whether or not the account
      // exists — the backend intentionally never reveals that either.
      setSubmitted(true);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || err.response.data);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-card">
          <div className="logo-section">
            <img src={logo} alt="ShipTrack" className="login-logo" />
            <h1>ShipTrack</h1>
            <p>Reset your password</p>
          </div>

          {submitted ? (
            <div>
              <p
                style={{ textAlign: "center", color: "#333", lineHeight: 1.6 }}
              >
                If an account with that username exists, we've sent a password
                reset link to it. The link expires in 30 minutes.
              </p>

              <p className="bottom-text">
                <Link to="/login">Back to Sign In</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: "#666", fontSize: 14, marginBottom: 18 }}>
                Enter your username and we'll email you a link to reset your
                password.
              </p>

              <div className="input-box">
                <FaUser />

                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 14 }}>
                  {error}
                </p>
              )}

              <button type="submit" className="login-btn" disabled={submitting}>
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="bottom-text">
                Remembered your password?
                <Link to="/login">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
