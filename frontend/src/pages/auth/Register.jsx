import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import "../../styles/Register.css";
import logo from "../../assets/logo.jpg";

import { register } from "../../services/authService";

function Register() {

    const navigate = useNavigate();

   const [formData, setFormData] = useState({

        name:"",

        username:"",

        password:"",

        confirmPassword:"",

        role:"CUSTOMER"

    });

    const handleChange = (e) => {

            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });

        };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {

            alert("Passwords do not match");
            return;

        }

        try {

            const response = await register({

                name: formData.name,

                username: formData.username,

                password: formData.password,

                role: formData.role

            });

            if (response.name) {
                localStorage.setItem("name", response.name);
                window.dispatchEvent(new Event("nameChanged"));
            }
            // trigger activities refresh (backend records user registration)
            window.dispatchEvent(new Event('activities:update'));
            alert(response.message);

        } catch (error) {

            console.log(error);

            if (error.response) {

                alert(error.response.data.message || error.response.data);

            } else {

                alert(error.message);

            }

        }

    };

    return (

        <div className="register-page">

            <div className="register-overlay">

                <div className="register-card">

                    <div className="logo-section">

                        <img
                            src={logo}
                            alt="ShipTrack"
                            className="register-logo"
                        />

                        <h2>Create Your Account</h2>

                        <p>
                            Join ShipTrack and start tracking shipments smarter.
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="input-box">

                            <FaUser className="icon"/>

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="input-box">

                            <FaEnvelope className="icon"/>

                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="password-row">

                            <div className="input-box">

                                <FaLock className="icon"/>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="input-box">

                                <FaLock className="icon"/>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <select
                            className="role-select"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >

                            <option value="CUSTOMER">Customer</option>
                            <option value="BUSINESS_CLIENT">Business Client</option>
                            <option value="LOGISTICS_OPERATOR">Logistics Operator</option>
                            <option value="SUPPORT_AGENT">Support Agent</option>
                            <option value="ADMIN">Admin</option>

                        </select>

                        <button
                            type="submit"
                            className="register-btn"
                        >
                            Register
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            className="google-btn"
                        >
                            <FcGoogle />
                            Continue with Google
                        </button>

                        <div className="bottom-link">

                            Already have an account?

                            <Link to="/login">
                                Login
                            </Link>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default Register;