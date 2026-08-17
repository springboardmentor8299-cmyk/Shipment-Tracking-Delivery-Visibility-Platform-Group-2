import { useState } from "react";
import "../styles/settings.css";

function DriverSettingsSection() {

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        deliveryAlerts: true,
        routeUpdates: true,
        emergencyNotifications: true
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

        alert("Notification Preferences Saved!");

    };

    return (

        <div className="settings-container">

            <h2>⚙️ Driver Settings</h2>

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

                    <span>Delivery Alerts</span>

                    <input
                        type="checkbox"
                        name="deliveryAlerts"
                        checked={notifications.deliveryAlerts}
                        onChange={handleNotificationChange}
                    />

                </div>

                <div className="notification-item">

                    <span>Route Updates</span>

                    <input
                        type="checkbox"
                        name="routeUpdates"
                        checked={notifications.routeUpdates}
                        onChange={handleNotificationChange}
                    />

                </div>

                <div className="notification-item">

                    <span>Emergency Notifications</span>

                    <input
                        type="checkbox"
                        name="emergencyNotifications"
                        checked={notifications.emergencyNotifications}
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

export default DriverSettingsSection;