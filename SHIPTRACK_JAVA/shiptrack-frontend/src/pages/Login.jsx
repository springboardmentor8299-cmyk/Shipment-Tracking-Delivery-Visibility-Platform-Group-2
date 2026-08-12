import { useRef, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { initGoogleIdentity, renderGoogleButton } from "../auth/google";
import AuthBackground from "../components/AuthBackground";

function Login() {

    const navigate = useNavigate();
    const googleButtonRef = useRef(null);

    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("ROLE_CUSTOMER");
    const [loading, setLoading] = useState(false);

    const resetRegisterFields = () => {
        setFullName("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setRole("ROLE_CUSTOMER");
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setLoading(false);
    };

    const completeGoogleAuth = async (idToken) => {

        const loginResponse =
            await api.post(
                "/auth/google",
                {
                    idToken
                }
            );

        const token =
            loginResponse.data.token;

        localStorage.setItem(
            "token",
            token
        );

        const userResponse =
            await api.get(
                "/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        localStorage.setItem(
            "role",
            userResponse.data.role
        );

        localStorage.setItem(
            "email",
            userResponse.data.email
        );

        toast.success("Google login successful.");

        const role =
            userResponse.data.role;

        if (role === "ROLE_ADMIN") {

            navigate("/admin");

        } else if (
            role === "ROLE_SUPPORT"
        ) {

            navigate("/support");

        } else if (
            role === "ROLE_DRIVER"
        ) {

            navigate("/driver");

        } else if (
            role === "ROLE_CUSTOMER"
        ) {

            navigate("/customer");

        } else {

            navigate("/dashboard");
        }
    };

    const handleGoogleCredential = async (response) => {

        const idToken = response.credential;

        if (!idToken) {
            toast.error("Google login failed.");
            return;
        }

        setLoading(true);

        try {

            await completeGoogleAuth(idToken);

        } catch (error) {

            console.error("Google login error:", error);

            toast.error(
                error.response?.data?.error ||
                error?.message ||
                "Google login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (mode !== "login") {
            return;
        }

        let cancelled = false;

        initGoogleIdentity(handleGoogleCredential)
            .then(() => {
                if (!cancelled && googleButtonRef.current) {
                    renderGoogleButton(googleButtonRef.current);
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.message);
            });

        return () => {
            cancelled = true;
        };
    }, [mode]);

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!email.trim()) {
            toast.error("Enter your email ID.");
            return;
        }

        if (!password) {
            toast.error("Enter your password.");
            return;
        }

        setLoading(true);

        try {

            const loginResponse =
                await api.post(
                    "/auth/login",
                    {
                        email: email.trim(),
                        password: password
                    }
                );

            const token =
                loginResponse.data.token;

            localStorage.setItem(
                "token",
                token
            );

            
            const userResponse =
                await api.get(
                    "/auth/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            localStorage.setItem(
                "role",
                userResponse.data.role
            );

            localStorage.setItem(
                "email",
                userResponse.data.email
            );

            toast.success("Login successful.");

            const role =
                userResponse.data.role;

            if (role === "ROLE_ADMIN") {

                navigate("/admin");

            } else if (
                role === "ROLE_SUPPORT"
            ) {

                navigate("/support");

            } else if (
                role === "ROLE_DRIVER"
            ) {

                navigate("/driver");

            } else if (
                role === "ROLE_CUSTOMER"
            ) {

                navigate("/customer");

            } else {

                navigate("/dashboard");
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Login Failed"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {

        e.preventDefault();

        if (!fullName.trim()) {
            toast.error("Enter your full name.");
            return;
        }

        if (!email.trim()) {
            toast.error("Enter your email ID.");
            return;
        }

        if (!password) {
            toast.error("Enter a password.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/register",
                {
                    fullName: fullName.trim(),
                    email: email.trim(),
                    password,
                    phone: phone.trim(),
                    role
                }
            );

            toast.success(
                response.data.message || "Registration successful. Please log in."
            );

            resetRegisterFields();
            setMode("login");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <AuthBackground />
            <div className="container py-5 auth-page-content">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">
                                ShipTrack
                            </h2>

                            <div className="d-flex gap-2 mb-4">
                                <button
                                    type="button"
                                    className={`btn flex-fill ${mode === "login" ? "btn-dark" : "btn-outline-dark"}`}
                                    onClick={() => switchMode("login")}
                                >
                                    Login
                                </button>

                                <button
                                    type="button"
                                    className={`btn flex-fill ${mode === "register" ? "btn-success" : "btn-outline-success"}`}
                                    onClick={() => switchMode("register")}
                                >
                                    Register
                                </button>
                            </div>

                            {mode === "login" ? (
                                <form onSubmit={handleLogin}>
                                    <input
                                        type="email"
                                        className="form-control mb-3"
                                        placeholder="Enter Email ID"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />

                                    <input
                                        type="password"
                                        className="form-control mb-3"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-dark w-100"
                                        disabled={loading}
                                    >
                                        {loading ? "Logging In..." : "Login"}
                                    </button>

                                    <div className="d-flex align-items-center gap-2 my-3">
                                        <div className="flex-grow-1 border-top"></div>
                                        <span className="text-muted small">or</span>
                                        <div className="flex-grow-1 border-top"></div>
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <div ref={googleButtonRef}></div>
                                    </div>

                                    <p className="text-center text-muted mt-3 mb-0">
                                        New user? Use Register to create an account.
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister}>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Enter Full Name"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                    />

                                    <input
                                        type="email"
                                        className="form-control mb-3"
                                        placeholder="Enter Email ID"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />

                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Enter Phone Number"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                    />

                                    <input
                                        type="password"
                                        className="form-control mb-3"
                                        placeholder="Create Password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                    <input
                                        type="password"
                                        className="form-control mb-3"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />

                                    <select
                                        className="form-control mb-3"
                                        value={role}
                                        onChange={(e) =>
                                            setRole(e.target.value)
                                        }
                                    >
                                        <option value="ROLE_CUSTOMER">
                                            Customer
                                        </option>

                                        <option value="ROLE_DRIVER">
                                            Driver
                                        </option>
                                    </select>

                                    <button
                                        type="submit"
                                        className="btn btn-success w-100"
                                        disabled={loading}
                                    >
                                        {loading ? "Registering..." : "Register"}
                                    </button>

                                    <p className="text-center text-muted mt-3 mb-0">
                                        Already have an account? Use Login.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default Login;
