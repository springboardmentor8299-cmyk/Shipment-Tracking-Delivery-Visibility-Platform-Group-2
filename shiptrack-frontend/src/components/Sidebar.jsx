import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (

        <div className="sidebar">

            <h2>ShipTrack-Pro</h2>

            <Link to="/dashboard">
                Dashboard
            </Link>

            {(role === "ADMIN" || role === "CUSTOMER") && (
                <Link to="/create-shipment">
                    Create Shipment
                </Link>
            )}

            {(role === "ADMIN" || role === "DRIVER") && (
                <Link to="/update-shipment">
                    Update Shipment
                </Link>
            )}

            {(role === "ADMIN" || role === "DRIVER") && (
                <Link to="/shipments">
                    Shipments
                </Link>
            )}

            <Link to="/track">
                Track Shipment
            </Link>

            <button
                className="logout-btn"
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );
}

export default Sidebar;