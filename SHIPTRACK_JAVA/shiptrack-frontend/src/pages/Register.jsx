import { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthBackground from "../components/AuthBackground";

function Register() {

    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ROLE_CUSTOMER");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/auth/register",
                {
                    fullName,
                    email,
                    phone,
                    password,
                    role
                }
            );

            toast.success(
                "Registration Successful"
            );

            navigate("/login");

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Registration Failed"
            );
        }
    };

    return (

        <div className="auth-page">

            <AuthBackground />

            <div className="container mt-5 auth-page-content">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                Register
                            </h2>

                            <form onSubmit={handleRegister}>

                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <input
                                    type="email"
                                    className="form-control mb-3"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <input
                                    type="password"
                                    className="form-control mb-3"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <select
                                    className="form-control mb-3"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="ROLE_CUSTOMER">
                                        Customer
                                    </option>

                                    <option value="ROLE_DRIVER">
                                        Driver
                                    </option>

                                    <option value="ROLE_SUPPORT">
                                        Support
                                    </option>
                                </select>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                >
                                    Register
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

            </div>

        </div>
    );
}

export default Register;
