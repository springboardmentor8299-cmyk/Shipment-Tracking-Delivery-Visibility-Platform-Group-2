import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { register } from "../../services/authService";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (formData.password !== formData.confirmPassword) {

            setError("Passwords do not match.");
            return;

        }

        setLoading(true);

        try {

            const response = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            setSuccess(response.message);

            setTimeout(() => navigate("/login"), 1500);

        } catch (err) {

            if (err.response?.data?.message) {

                setError(err.response.data.message);

            } else {

                setError("Registration Failed.");

            }

        } finally {

            setLoading(false);

        }

    };

    return (
        <AuthLayout title="Create Account">

            <form onSubmit={handleSubmit}>

                {success && (
                    <div className="alert alert-success">{success}</div>
                )}
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {/* Full Name */}

                <div className="mb-3">

                    <label className="form-label fw-semibold">
                        Full Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Enter your full name"
                        required
                    />

                </div>

                {/* Email */}

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

                {/* Phone */}

                <div className="mb-3">

                    <label className="form-label fw-semibold">
                        Phone
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Enter your phone number"
                        required
                    />

                </div>

                {/* Password */}

                <div className="mb-3">

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
                            placeholder="Create a password"
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

                {/* Confirm Password */}

                <div className="mb-4">

                    <label className="form-label fw-semibold">
                        Confirm Password
                    </label>

                    <div className="input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary password-toggle"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>

                </div>

                {/* Register Button */}

                <button
                    type="submit"
                    className="btn login-btn w-100 py-3"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Login Link */}

                <div className="text-center mt-4">

                    <span className="text-muted">
                        Already have an account?
                    </span>

                    {" "}

                    <Link
                        to="/login"
                        className="auth-link"
                    >
                        Login
                    </Link>

                </div>

            </form>

        </AuthLayout>
    );
}

export default Register;
