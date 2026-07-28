import "../../styles/Login.css";

import { useState } from "react";
import { login } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";

import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import logo from "../../assets/logo.jpg";

function Login() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await login(formData);

            localStorage.setItem("token", response.token);
            localStorage.setItem("username", response.username);
            localStorage.setItem("name", response.name || "");
            localStorage.setItem("role", response.role);
            window.dispatchEvent(new Event("nameChanged"));

            switch(response.role){

                case "ADMIN":
                    navigate("/admin");
                    break;

                case "CUSTOMER":
                    navigate("/customer");
                    break;

                case "BUSINESS_CLIENT":
                    navigate("/business_client");
                    break;

                case "LOGISTICS_OPERATOR":
                    navigate("/logistics_operator");
                    break;

                case "SUPPORT_AGENT":
                    navigate("/support_agent");
                    break;

                default:
                    navigate("/login");
            }

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

                        <img
                            src={logo}
                            alt="ShipTrack"
                            className="login-logo"
                        />

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

                            <span
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {
                                    showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                }
                            </span>

                        </div>

                        <div className="forgot">

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                        >
                            Sign In
                        </button>

                    </form>

                    <p className="bottom-text">

                        First time here?

                        <Link to="/register">
                            Register
                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );

}

export default Login;