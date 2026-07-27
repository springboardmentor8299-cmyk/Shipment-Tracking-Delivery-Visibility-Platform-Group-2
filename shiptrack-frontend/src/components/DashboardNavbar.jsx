import "../styles/DashboardNavbar.css";

function DashboardNavbar() {

    const username = localStorage.getItem("username");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    return (
        <div className="dashboard-navbar">

            <h2>ShipTrack-Pro</h2>

            <div className="dashboard-right">

                <span>
                    Welcome, <strong>{username || "User"}</strong>
                </span>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </div>
    );
}

export default DashboardNavbar;