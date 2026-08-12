import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const role =
        localStorage.getItem("role");

    const email =
        localStorage.getItem("email");

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/");
    };

    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link
                    className="navbar-brand"
                    to="/dashboard"
                >
                    🚚 ShipTrack
                </Link>

                <div className="navbar-nav me-auto">

                    {}

                    {role !== "ROLE_DRIVER" && (

                        <Link
                            className="nav-link"
                            to="/track-shipment"
                        >
                            Track
                        </Link>

                    )}

                    {}

                    {role === "ROLE_ADMIN" && (

                        <>
                            <Link
                                className="nav-link"
                                to="/admin"
                            >
                                Admin Dashboard
                            </Link>

                            <Link
                                className="nav-link"
                                to="/manage-users"
                            >
                                Manage Users
                            </Link>

                            <Link
                                className="nav-link"
                                to="/admin/support"
                            >
                                Support Ops
                            </Link>

                            <Link
                                className="nav-link"
                                to="/shipments"
                            >
                                Shipments
                            </Link>
                        </>

                    )}

                    {}

                    {role === "ROLE_SUPPORT" && (

                        <>
                            <Link
                                className="nav-link"
                                to="/support"
                            >
                                Support Dashboard
                            </Link>

                            <Link
                                className="nav-link"
                                to="/shipments"
                            >
                                Shipments
                            </Link>
                        </>

                    )}

                    {}

                    {role === "ROLE_DRIVER" && (

                        <>
                            <Link
                                className="nav-link"
                                to="/driver"
                            >
                                Driver Dashboard
                            </Link>
                        </>

                    )}

                    {}

                    {role === "ROLE_CUSTOMER" && (

                        <>
                            <Link
                                className="nav-link"
                                to="/customer"
                            >
                                Customer Dashboard
                            </Link>

                            <Link
                                className="nav-link"
                                to="/shipments"
                            >
                                My Orders
                            </Link>
                        </>

                    )}

                </div>

                <span className="text-light me-3">

                    {email}

                    {" | "}

                    {role?.startsWith("ROLE_")
                        ? role.replace("ROLE_", "").toLowerCase()
                            .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
                        : role}

                </span>

                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;
