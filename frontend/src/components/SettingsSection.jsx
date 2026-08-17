import { useState } from "react";
import "../styles/settings.css";

function SettingsSection() {

    const [settings, setSettings] = useState({

        name: "Admin",

        email: "admin@cargoflow.com",

        phone: "+91 9876543210",

        company: "CargoFlow Logistics",

        address: "Hyderabad",

        supportEmail: "support@cargoflow.com",

        currentPassword: "",

        newPassword: "",

        confirmPassword: "",

        emailNotifications: true,

        shipmentAlerts: true,

        driverAlerts: false

    });

    const handleChange = (e) => {

        const { name, value, checked, type } = e.target;

        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value
        });

    };

    const handleSave = () => {

        alert("Settings Saved Successfully!");

    };

    const handleReset = () => {

        window.location.reload();

    };

    return (

        <div className="settings-container">

            <h2>⚙️ Settings</h2>

            {/* Profile */}

            <div className="settings-card">

                <h3>👤 Profile</h3>

                <input
                    type="text"
                    name="name"
                    placeholder="Admin Name"
                    value={settings.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={settings.email}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={settings.phone}
                    onChange={handleChange}
                />

            </div>

            {/* Security */}

            <div className="settings-card">

                <h3>🔒 Security</h3>

                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={settings.currentPassword}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={settings.newPassword}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={settings.confirmPassword}
                    onChange={handleChange}
                />

            </div>

            {/* Company */}

            <div className="settings-card">

                <h3>🏢 Company</h3>

                <input
                    type="text"
                    name="company"
                    placeholder="Company Name"
                    value={settings.company}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="address"
                    placeholder="Company Address"
                    value={settings.address}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="supportEmail"
                    placeholder="Support Email"
                    value={settings.supportEmail}
                    onChange={handleChange}
                />

            </div>

            {/* Notifications */}

            <div className="settings-card">

    <h3>🔔 Notifications</h3>

    <div className="notification-item">

        <span>Email Notifications</span>

        <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleChange}
        />

    </div>

    <div className="notification-item">

        <span>Shipment Alerts</span>

        <input
            type="checkbox"
            name="shipmentAlerts"
            checked={settings.shipmentAlerts}
            onChange={handleChange}
        />

    </div>

    <div className="notification-item">

        <span>Driver Alerts</span>

        <input
            type="checkbox"
            name="driverAlerts"
            checked={settings.driverAlerts}
            onChange={handleChange}
        />

    </div>

</div>

                

                    

            <div className="settings-buttons">

                <button
                    className="save-btn"
                    onClick={handleSave}
                >
                    💾 Save Changes
                </button>

                <button
                    className="reset-btn"
                    onClick={handleReset}
                >
                    🔄 Reset
                </button>

            </div>

        </div>

    );

}

export default SettingsSection;