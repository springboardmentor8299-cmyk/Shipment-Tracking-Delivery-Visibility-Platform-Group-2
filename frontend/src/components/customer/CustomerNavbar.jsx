import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function CustomerNavbar({ activeTab, onTabChange }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const tabs = [
        { key: "dashboard", label: "Dashboard" },
        { key: "orders", label: "My Orders" },
        { key: "tracking", label: "Track" },
        { key: "live", label: "Live" },
    ];

    return (
        <nav className="navbar navbar-expand-lg shadow-sm px-4 py-3"
            style={{ background: "var(--bs-body-bg)" }}>
            <div className="container-fluid">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-box-seam-fill" style={{ color: "#F59E0B", fontSize: "1.5rem" }}></i>
                    <h3 className="fw-bold m-0" style={{ color: theme === "dark" ? "#60A5FA" : "#0F4C81" }}>
                        ShipTrack-Pro
                    </h3>
                </div>
                <div className="d-flex gap-4 align-items-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`nav-link btn btn-sm ${activeTab === tab.key ? "fw-bold" : ""}`}
                            style={{
                                color: activeTab === tab.key ? "var(--bs-primary)" : "var(--bs-secondary-color)",
                                borderBottom: activeTab === tab.key ? "2px solid var(--bs-primary)" : "2px solid transparent",
                                borderRadius: 0,
                            }}
                            onClick={() => onTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button
                        className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                        onClick={toggleTheme}
                        title={theme === "light" ? "Dark Mode" : "Light Mode"}
                        style={{ width: "38px", height: "38px", padding: 0 }}
                    >
                        <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`}></i>
                    </button>
                    <span className="fw-semibold text-muted">{user?.name || "Customer"}</span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default CustomerNavbar;
