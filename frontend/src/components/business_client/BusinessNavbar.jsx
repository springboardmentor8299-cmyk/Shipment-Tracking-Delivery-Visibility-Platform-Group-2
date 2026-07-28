import "../../styles/Navbar.css";
import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";

function BusinessNavbar({ searchTerm, onSearchChange }) {
  const [name, setName] = useState(() => {
    return localStorage.getItem("name") || "Business Client";
  });

  useEffect(() => {
    const updateName = () => {
      setName(localStorage.getItem("name") || "Business Client");
    };

    updateName();

    window.addEventListener("storage", updateName);
    window.addEventListener("nameChanged", updateName);

    return () => {
      window.removeEventListener("storage", updateName);
      window.removeEventListener("nameChanged", updateName);
    };
  }, []);

  // Get only the first letter of the business client's name
  const getInitial = (userName) => {
    if (!userName) return "B";
    return userName.trim().charAt(0).toUpperCase();
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>Business Client Dashboard</h2>
        <p>{today}</p>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by Tracking ID"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="notification">
          <FaBell />
          <span>3</span>
        </div>

        <div className="profile">
          {/* Circular Letter Avatar Badge */}
          <div className="profile-avatar">{getInitial(name)}</div>

          <div>
            <h4>{name}</h4>
            <p>Business Client</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessNavbar;