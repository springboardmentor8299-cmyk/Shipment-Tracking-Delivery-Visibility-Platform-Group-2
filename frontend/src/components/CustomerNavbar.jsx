import "../styles/Navbar.css";
import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";

function CustomerNavbar({ searchTerm, onSearchChange }) {
  const [name, setName] = useState(() => {
    return localStorage.getItem("name") || "Customer";
  });

  useEffect(() => {
    const updateName = () => {
      setName(localStorage.getItem("name") || "Customer");
    };

    updateName();

    window.addEventListener("storage", updateName);
    window.addEventListener("nameChanged", updateName);

    return () => {
      window.removeEventListener("storage", updateName);
      window.removeEventListener("nameChanged", updateName);
    };
  }, []);

  // Get only the first letter of the customer's name
  const getInitial = (userName) => {
    if (!userName) return "C";
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
      {/* Left Section */}
      <div className="navbar-left">
        <h2>Customer Dashboard</h2>
        <p>{today}</p>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Search */}
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search Tracking ID"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Notification */}
        <div className="notification">
          <FaBell />
          <span>0</span>
        </div>

        {/* Profile */}
        <div className="profile">
          {/* Circular Letter Avatar Badge */}
          <div className="profile-avatar">{getInitial(name)}</div>

          <div>
            <h4>{name}</h4>
            <p>Customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerNavbar;