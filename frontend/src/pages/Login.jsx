import "../styles/auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("/auth/login", loginData);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("name", response.data.fullName);

            alert(response.data.message);

            switch (response.data.role) {

    case "ADMIN":
        navigate("/admin-dashboard", { replace: true });
        break;

    case "CUSTOMER":
        navigate("/customer-dashboard", { replace: true });
        break;

    case "DRIVER":
        navigate("/driver-dashboard", { replace: true });
        break;

    default:
        navigate("/", { replace: true });
}

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Login Failed");
            }

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <div className="logo">📦</div>

                <h2>CargoFlow</h2>

                <p className="subtitle">
                    Smart Logistics. Real-Time Tracking.
                </p>

                <p className="subtitle">
                    Welcome back! Please login.
                </p>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>

    );

}

export default Login;