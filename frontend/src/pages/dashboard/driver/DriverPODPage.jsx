import { useNavigate } from "react-router-dom";

import DriverSidebar from "../../../components/driver/DriverSidebar";
import DriverNavbar from "../../../components/driver/DriverNavbar";
import ProofOfDelivery from "../../pod/ProofOfDelivery";

import "./DriverDashboard.css";

function DriverPODPage() {
  const navigate = useNavigate();

  const handleSelect = (section) => {
    if (section === "dashboard") {
      navigate("/driver");
    } else if (section === "history") {
      navigate("/driver");
    } else if (section === "profile") {
      navigate("/driver");
    }
  };

  return (
    <div className="driver-dashboard">
      {/* LEFT SIDEBAR */}
      <DriverSidebar activeSection="dashboard" onSelect={handleSelect} />

      {/* RIGHT SIDE */}
      <div className="driver-main">
        {/* TOP NAVBAR */}
        <DriverNavbar />

        {/* CONTENT */}
        <main className="driver-content">
          <div className="driver-pod-wrapper">
            <ProofOfDelivery />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DriverPODPage;
