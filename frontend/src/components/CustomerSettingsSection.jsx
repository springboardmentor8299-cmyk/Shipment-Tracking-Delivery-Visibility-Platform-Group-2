import { useState } from "react";
import "../styles/settings.css";

function CustomerSettingsSection() {

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        shipmentNotifications: true,
        emailNotifications: true
    });

    const handlePasswordChange = (e) => {

        setPassword({
            ...password,
            [e.target.name]: e.target.value
        });

    };

    const handleNotificationChange = (e) => {

        setNotifications({
            ...notifications,
            [e.target.name]: e.target.checked
        });

    };

    const changePassword = () => {

        if (password.newPassword !== password.confirmPassword) {

            alert("Passwords do not match!");

            return;

        }

        alert("Password Changed Successfully!");

    };

    const saveNotifications = () => {

        alert("Preferences Saved Successfully!");

    };

    return (

        <div className="settings-container">

            <h2>⚙️ Customer Settings</h2>

            <div className="settings-card">

                <h3>🔒 Change Password</h3>

                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={password.currentPassword}
                    onChange={handlePasswordChange}
                />

                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={password.confirmPassword}
                    onChange={handlePasswordChange}
                />

                <button
                    className="save-btn"
                    onClick={changePassword}
                >
                    Change Password
                </button>

            </div>

            <div className="settings-card">

                <h3>🔔 Notifications</h3>

                <div className="notification-item">

                    <span>Shipment Notifications</span>

                    <input
                        type="checkbox"
                        name="shipmentNotifications"
                        checked={notifications.shipmentNotifications}
                        onChange={handleNotificationChange}
                    />

                </div>

                <div className="notification-item">

                    <span>Email Notifications</span>

                    <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notifications.emailNotifications}
                        onChange={handleNotificationChange}
                    />

                </div>

                <button
                    className="save-btn"
                    onClick={saveNotifications}
                >
                    Save Preferences
                </button>

            </div>

        </div>

    );

}

export default CustomerSettingsSection;