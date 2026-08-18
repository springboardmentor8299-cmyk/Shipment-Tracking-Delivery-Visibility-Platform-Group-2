import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Truck, Package, MapPin, Shield, KeyRound, CheckCircle, X } from "lucide-react";
import { loginUser, forgotPassword } from "../../services/authService";
import { saveAuthData } from "../../utils/auth";
import { getDashboardRouteForRole } from "../../utils/navigation";
import "../../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotData, setForgotData] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
    if (forgotErrors[e.target.name]) setForgotErrors({ ...forgotErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      const response = await loginUser(formData);
      const { token, role, email, username, id } = response.data;
      saveAuthData({ token, role, email, username, id });
      const redirectPath = getDashboardRouteForRole(role);
      if (redirectPath === "/login") {
        alert("Login successful, but the user role is not recognized.");
        return;
      }
      alert("Login Successful");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) alert(error.response.data?.message || JSON.stringify(error.response.data));
      else alert("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!forgotData.email) errs.email = "Registered Email is required";
    if (!forgotData.newPassword) errs.newPassword = "New Password is required";
    if (forgotData.newPassword && forgotData.newPassword.length < 4) {
      errs.newPassword = "Password must be at least 4 characters long";
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) return setForgotErrors(errs);

    setForgotLoading(true);
    try {
      const res = await forgotPassword({
        email: forgotData.email,
        newPassword: forgotData.newPassword
      });

      alert(res.data?.message || "Password reset successfully! You can now login with your new password.");
      setFormData({ email: forgotData.email, password: "" });
      setShowForgotModal(false);
      setForgotData({ email: "", newPassword: "", confirmPassword: "" });
      setForgotErrors({});
    } catch (err) {
      console.error("Forgot Password Error:", err);
      const errMsg = err.response?.data?.message || err.response?.data || "Failed to reset password. Please verify your email address.";
      setForgotErrors({ email: typeof errMsg === "string" ? errMsg : "Reset failed" });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Panel – Dark blue sidebar theme */}
        <div className="auth-left">
          <div className="auth-left-content">
            {/* Floating shapes background */}
            <div className="auth-bg-shape auth-bg-shape--1"></div>
            <div className="auth-bg-shape auth-bg-shape--2"></div>
            <div className="auth-bg-shape auth-bg-shape--3"></div>

            {/* Branding with truck icon */}
            <div className="auth-brand">
              <div className="auth-brand-icon">
                <Truck size={26} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span className="auth-brand-name">CargoFlow</span>
            </div>

            <h1 className="auth-left-title">ShipTrack Pro</h1>
            <h4 className="auth-left-subtitle">Shipment Tracking & Delivery</h4>
            <p className="auth-left-desc">
              Securely manage shipments, track deliveries in real time,
              and gain complete logistics visibility.
            </p>

            {/* Feature highlights */}
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon"><Package size={18} /></div>
                <span>Real-time Tracking</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><MapPin size={18} /></div>
                <span>GPS Location</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><Shield size={18} /></div>
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel – Login form */}
        <div className="auth-right">
          <div className="auth-card">
            <h2>Welcome Back</h2>
            <p className="auth-card-sub">Sign in to your account to continue</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password}</span>
                )}
              </div>

              {/* Dedicated Forgot Password Row */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, marginTop: -6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotData({ email: formData.email, newPassword: "", confirmPassword: "" });
                    setForgotErrors({});
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 0",
                    fontFamily: "inherit"
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
              <div>
                Forgot your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setForgotData({ email: formData.email, newPassword: "", confirmPassword: "" });
                    setForgotErrors({});
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 14,
                    textDecoration: "underline",
                    fontFamily: "inherit"
                  }}
                >
                  Reset Password
                </button>
              </div>
              <div>
                Don't have an account?
                <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="auth-modal-backdrop">
          <div className="auth-modal-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Reset Password</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Update your account password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Account Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  placeholder="Enter registered email"
                />
                {forgotErrors.email && <span className="form-error">{forgotErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-input"
                    name="newPassword"
                    value={forgotData.newPassword}
                    onChange={handleForgotChange}
                    placeholder="Enter new password"
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {forgotErrors.newPassword && <span className="form-error">{forgotErrors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  name="confirmPassword"
                  value={forgotData.confirmPassword}
                  onChange={handleForgotChange}
                  placeholder="Confirm new password"
                />
                {forgotErrors.confirmPassword && <span className="form-error">{forgotErrors.confirmPassword}</span>}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    flex: 1.5,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

