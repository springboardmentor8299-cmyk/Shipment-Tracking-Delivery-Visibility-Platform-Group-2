import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {

    // Remove all login data
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");

    alert("Logged out successfully!");

    navigate("/");

  };

  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">

      <div className="container">

        <Link className="navbar-brand fw-bold" to="/dashboard">
          ShipTrack Pro
        </Link>

        <div className="collapse navbar-collapse">

          <ul className="navbar-nav me-auto">

            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>

            {localStorage.getItem("role") === "ADMIN" && (

<li className="nav-item">
    <Link className="nav-link" to="/shipment">
        Add Shipment
    </Link>
</li>

)}

            <li className="nav-item">
              <Link className="nav-link" to="/tracking">
                Track Shipment
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>

          </ul>

          <button
            className="btn btn-light"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;