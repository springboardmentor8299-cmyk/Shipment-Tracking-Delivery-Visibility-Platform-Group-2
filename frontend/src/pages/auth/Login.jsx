import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { login } from "../../services/authService";
import { saveToken } from "../../utils/token";
import { useAuth } from "../../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login: setAuthUser } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await login(formData);

            // Save JWT
            saveToken(response.token);

            // Save user information
            localStorage.setItem("name", response.name);
            localStorage.setItem("role", response.role);

            setAuthUser({
                token: response.token,
                name: response.name,
                role: response.role,
                id: response.id,
                email: response.email,
            });

            if (response.role === "ADMIN") {
                navigate("/admin");
            } else if (response.role === "SUPPORT_ASSISTANT") {
                navigate("/support");
            } else if (response.role === "DELIVERY_OPERATOR") {
                navigate("/delivery-operator");
            } else {
                navigate("/customer");
            }

        } catch (err) {

            if (err.response?.data?.message) {

                setError(err.response.data.message);

            } else {

                setError("Login Failed.");

            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout title="Welcome Back">

            <form onSubmit={handleSubmit}>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                <div className="mb-3">

                    <label className="form-label fw-semibold">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Enter your email"
                        required
                    />

                </div>

                <div className="mb-4">

                    <label className="form-label fw-semibold">
                        Password
                    </label>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>

                </div>

                <button
                    type="submit"
                    className="btn login-btn"
                    disabled={loading}
                >

                    {loading ? "Logging in..." : "Login"}

                </button>

                <button
                    type="button"
                    className="btn google-btn mt-3"
                >

                    <i className="bi bi-google"></i>
                    Sign in with Google

                </button>

                <div className="text-center mt-4">

                    <span className="text-muted">
                        New User?
                    </span>

                    {" "}

                    <Link
                        to="/register"
                        className="auth-link"
                    >
                        Sign-Up
                    </Link>

                </div>

            </form>

        </AuthLayout>

    );

}

export default Login;