import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css";

function LoginPage() {

    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
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

            authLogin(response.token, response.role);

            alert("Login Successful");

            switch (response.role) {

                case "ADMINISTRATOR":
                    navigate("/admin");
                    break;

                case "LOGISTICS_OPERATOR":
                    navigate("/operator");
                    break;

                case "SUPPORT_AGENT":
                    navigate("/support");
                    break;

                case "BUSINESS_CLIENT":
                    navigate("/business");
                    break;

                case "CUSTOMER":
                    navigate("/customer");
                    break;

                default:
                    navigate("/login");
            }

        } catch (error) {

            console.error(error);

            if (error.response) {
                alert(error.response.data.message || error.response.data);
            } else {
                alert("Invalid Email or Password");
            }

        }
    };

    return (

        <div className="login-container">

            <div className="login-card">

                <h1>ShipTrack Pro</h1>

                <h2>Welcome Back</h2>

                <p>Login to continue.</p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="login-button"
                    >
                        Login
                    </button>

                </form>

                <div className="register-link">
                    Don't have an account?
                    <Link to="/register">
                        Register
                    </Link>
                </div>

            </div>

        </div>

    );
}

export default LoginPage;