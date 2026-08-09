import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // This function runs when the Register button is clicked
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (user.password !== user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/users/register", {
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        phone: user.phone,
      });

      alert("Registration Successful!");

      // Go to Login page
      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message || "Registration Failed!");
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "450px", borderRadius: "15px" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success">Create Account</h2>
          <p className="text-muted">
            Shipment Tracking & Delivery Visibility Platform
          </p>
        </div>

        {/* Connect the form to handleSubmit */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={user.fullName}
              onChange={(e) =>
                setUser({ ...user, fullName: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={user.password}
              onChange={(e) =>
                setUser({ ...user, password: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm your password"
              value={user.confirmPassword}
              onChange={(e) =>
                setUser({ ...user, confirmPassword: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your phone number"
              value={user.phone}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Register
          </button>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;