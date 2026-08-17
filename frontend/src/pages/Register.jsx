import "../styles/auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "CUSTOMER"
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("/auth/register", user);

            alert(response.data.message);

            localStorage.setItem("token", response.data.token);

            navigate("/dashboard");

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Registration Failed");
            }

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <div className="logo">📦</div>

                <h2>CargoFlow</h2>

                <p className="subtitle">
    Create your CargoFlow account
</p>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={user.fullName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={user.phone}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                    >
                        <option value="CUSTOMER">Customer</option>
                        <option value="DRIVER">Driver</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <button type="submit">
                        Register
                    </button>

                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>

        </div>

    );

}

export default Register;