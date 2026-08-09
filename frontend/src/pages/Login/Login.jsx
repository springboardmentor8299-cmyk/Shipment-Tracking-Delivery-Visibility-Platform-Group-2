import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { toast } from "react-toastify";

function Login() {

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        loginData
      );

      // Check if token exists
      if (!response.data.token) {
        toast.error("Login failed. JWT Token not received.");
        return;
      }

      // Remove previous login details
      localStorage.clear();

      // Save JWT Token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      // Save User Details
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("fullName", response.data.fullName);
      localStorage.setItem("role", response.data.role);

      toast.error("Login Successful!");

      console.log("Login Response:", response.data);

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      if (error.response) {

        toast.error(error.response.data.message || "Invalid Email or Password!");

      } else {

        toast.error("Unable to connect to the server.");

      }

    }

  };

  return (

    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4"
        style={{ width: "500px", borderRadius: "15px" }}
      >

        <div className="text-center mb-4">

          <h2 className="fw-bold text-primary">
            Shipment Tracking
          </h2>

          <p className="text-muted">
            Shipment Tracking & Delivery Visibility
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <div className="mb-3">

            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value
                })
              }
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value
                })
              }
              required
            />

          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div className="form-check">

              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />

              <label
                className="form-check-label"
                htmlFor="rememberMe"
              >
                Remember Me
              </label>

            </div>

            <Link
              to="#"
              className="text-decoration-none"
            >
              Forgot Password?
            </Link>

          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Login
          </button>

          <p className="text-center mt-3">

            Don't have an account?{" "}

            <Link to="/register">
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>

  );

}

export default Login;