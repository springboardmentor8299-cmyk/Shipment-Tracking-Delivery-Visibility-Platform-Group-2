import "../../styles/Navbar.css";
import { useEffect, useState } from "react";
import NotificationBell from "../NotificationBell";

function DriverNavbar({ onNavigate }) {
  const [name, setName] = useState(() => {
    return localStorage.getItem("name") || "Driver";
  });

  useEffect(() => {
    const updateName = () => {
      setName(localStorage.getItem("name") || "Driver");
    };

    updateName();

    window.addEventListener("storage", updateName);
    window.addEventListener("nameChanged", updateName);

    return () => {
      window.removeEventListener("storage", updateName);
      window.removeEventListener("nameChanged", updateName);
    };
  }, []);

  const getInitial = (userName) => {
    if (!userName) return "D";
    return userName.trim().charAt(0).toUpperCase();
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>Driver Dashboard</h2>
        <p>{today}</p>
      </div>

      <div className="navbar-right">
        <NotificationBell
          onViewAll={onNavigate ? () => onNavigate("notifications") : undefined}
        />

        <div className="profile">
          <div className="profile-avatar">{getInitial(name)}</div>

          <div>
            <h4>{name}</h4>
            <p>Driver</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverNavbar;
