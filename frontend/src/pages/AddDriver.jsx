import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDriver } from "../services/driverService";

import "../styles/driverForm.css";

function AddDriver() {

    const navigate = useNavigate();

    const [driver, setDriver] = useState({
        name: "",
        email: "",
        phone: "",
        vehicleNumber: "",
        licenseNumber: "",
        status: "Available"
    });

    const handleChange = (e) => {
        setDriver({
            ...driver,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await createDriver(driver);

            alert("Driver Added Successfully!");

            navigate("/admin-dashboard");

        } catch (error) {

            console.error(error);

            alert("Failed to Add Driver");

        }

    };

    return (

        <div className="driver-page">

            <div className="driver-card">

                <div className="driver-header">

                    <h1>🚚 Add Driver</h1>

                    <p>Enter Driver Details</p>

                </div>

                <form
                    className="driver-form"
                    onSubmit={handleSubmit}
                >

                    <label>👤 Driver Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Driver Name"
                        value={driver.name}
                        onChange={handleChange}
                        required
                    />

                    <label>📧 Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={driver.email}
                        onChange={handleChange}
                        required
                    />

                    <label>📱 Phone Number</label>

                    <input
                        type="text"
                        name="phone"
                        placeholder="Enter Phone Number"
                        value={driver.phone}
                        onChange={handleChange}
                        required
                    />

                    <label>🚚 Vehicle Number</label>

                    <input
                        type="text"
                        name="vehicleNumber"
                        placeholder="Enter Vehicle Number"
                        value={driver.vehicleNumber}
                        onChange={handleChange}
                        required
                    />

                    <label>🪪 License Number</label>

                    <input
                        type="text"
                        name="licenseNumber"
                        placeholder="Enter License Number"
                        value={driver.licenseNumber}
                        onChange={handleChange}
                        required
                    />

                    <label>🚦 Driver Status</label>

                    <select
                        name="status"
                        value={driver.status}
                        onChange={handleChange}
                    >
                        <option value="Available">🟢 Available</option>
                        <option value="On Delivery">🚚 On Delivery</option>
                        <option value="Offline">🔴 Offline</option>
                    </select>

                    <div className="driver-buttons">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/admin-dashboard")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            💾 Save Driver
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddDriver;