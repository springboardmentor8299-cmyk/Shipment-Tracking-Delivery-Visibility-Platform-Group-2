import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Truck, Package, MapPin, Shield } from "lucide-react";
import { registerUser } from "../../services/authService";
import "../../styles/Auth.css";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      const registrationData = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      const response = await registerUser(registrationData);
      console.log("Registration Response:", response.data);
      alert("Registration Successful! Please login with your credentials.");
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      if (error.response) alert(JSON.stringify(error.response.data));
      else alert("Cannot connect to backend.");
    } finally {
      setLoading(false);
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
            <h4 className="auth-left-subtitle">Join Our Platform</h4>
            <p className="auth-left-desc">
              Create an account to start tracking and managing shipments
              with real-time visibility and analytics.
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

        {/* Right Panel – Register form */}
        <div className="auth-right">
          <div className="auth-card">
            <h2>Create Account</h2>
            <p className="auth-card-sub">Fill in your details to get started</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <span className="form-error">{errors.username}</span>
                )}
              </div>

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
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
                    placeholder="Enter password (min. 6 characters)"
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
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;