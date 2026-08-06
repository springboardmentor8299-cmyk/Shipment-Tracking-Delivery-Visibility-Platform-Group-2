import "../../styles/login.css";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import { resetPassword } from "../../services/authService";
import logo from "../../assets/logo.jpg";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing or invalid. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
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
            <p>Choose a new password</p>
          </div>

          {success ? (
            <p style={{ textAlign: "center", color: "#333", lineHeight: 1.6 }}>
              Your password has been reset. Redirecting you to Sign In...
            </p>
          ) : !token ? (
            <div>
              <p style={{ textAlign: "center", color: "#dc2626", lineHeight: 1.6 }}>
                This reset link is missing or invalid.
              </p>
              <p className="bottom-text">
                <Link to="/forgot-password">Request a new link</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />

                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="input-box">
                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 14 }}>
                  {error}
                </p>
              )}

              <button type="submit" className="login-btn" disabled={submitting}>
                {submitting ? "Resetting..." : "Reset Password"}
              </button>

              <p className="bottom-text">
                <Link to="/login">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
