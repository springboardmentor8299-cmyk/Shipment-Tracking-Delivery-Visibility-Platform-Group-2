import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authService";
import "../styles/RegisterPage.css";

function RegisterPage() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "CUSTOMER"
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

            await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            });

            alert("Registration Successful");

            navigate("/login");

        } catch (error) {

            console.error(error);

            if (error.response) {
                alert(error.response.data);
            } else {
                alert("Registration Failed");
            }
        }
    };

    return (

        <div className="register-container">

            <div className="register-card">

                <h1>ShipTrack Pro</h1>

                <h2>Create Your Account</h2>

                <p>Register to access the logistics management system.</p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    required
>
    <option value="">Select Role</option>
    <option value="CUSTOMER">Customer</option>
    <option value="BUSINESS_CLIENT">Business Client</option>
</select>

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="register-button"
                    >
                        Register
                    </button>

                </form>

                <div className="login-link">

                    Already have an account?

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>

    );
}

export default RegisterPage;