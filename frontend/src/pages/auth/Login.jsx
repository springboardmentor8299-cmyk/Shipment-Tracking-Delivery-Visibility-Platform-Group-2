import "../../styles/login.css";

import { useState } from "react";
import { login, googleLogin } from "../../services/authService";
import { applyAuthResponse } from "../../utils/Applyauth";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { Link, useNavigate } from "react-router-dom";

import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import logo from "../../assets/logo.jpg";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData);

      applyAuthResponse(response, navigate);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || error.response.data);
      } else {
        alert(error.message);
      }
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      const response = await googleLogin(idToken);
      applyAuthResponse(response, navigate);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || error.response.data);
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-card">
          <div className="logo-section">
            <img src={logo} alt="ShipTrack" className="login-logo" />

            <h1>ShipTrack</h1>

            <p>Secure Shipment Tracking Platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaUser />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <FaLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <GoogleSignInButton onSuccess={handleGoogleSuccess} />
          </form>

          <p className="bottom-text">
            First time here?
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
