import { useEffect, useState } from "react";
import "../../styles/AddShipmentModal.css";

const EMPTY_DRIVER = {
  name: "",
  phone: "",
  email: "",
  licenseNumber: "",
  vehicleType: "TRUCK",
  vehicleNumber: "",
};

function AddDriverModal({ show, driver, onClose, onSave }) {
  const [driverData, setDriverData] = useState(EMPTY_DRIVER);

  useEffect(() => {
    if (driver) {
      setDriverData({
        name: driver.name || "",
        phone: driver.phone || "",
        email: driver.email || "",
        licenseNumber: driver.licenseNumber || "",
        vehicleType: driver.vehicleType || "TRUCK",
        vehicleNumber: driver.vehicleNumber || "",
      });
    } else {
      setDriverData(EMPTY_DRIVER);
    }
  }, [driver]);

  if (!show) return null;

  const handleChange = (e) => {
    setDriverData({
      ...driverData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(driverData);
    if (!driver) setDriverData(EMPTY_DRIVER);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{driver ? "Edit Driver" : "Add Driver"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={driverData.name}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={driverData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email (used as driver's login)"
            value={driverData.email}
            onChange={handleChange}
            required
          />

          <input
            name="licenseNumber"
            placeholder="Driving License Number"
            value={driverData.licenseNumber}
            onChange={handleChange}
            required
          />

          <select
            name="vehicleType"
            value={driverData.vehicleType}
            onChange={handleChange}
          >
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="MINI_TRUCK">Mini Truck</option>
            <option value="BIKE">Bike</option>
          </select>

          <input
            name="vehicleNumber"
            placeholder="Vehicle Number (e.g., KA-01-AB-1234)"
            value={driverData.vehicleNumber}
            onChange={handleChange}
            required
          />

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {driver ? "Update Driver" : "Save Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDriverModal;
