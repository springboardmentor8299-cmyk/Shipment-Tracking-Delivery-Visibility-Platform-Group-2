import { useEffect, useState } from "react";
import {
    getNotificationPreferences,
    updateNotificationPreferences,
} from "../services/notificationService";
import "./NotificationPreferences.css";

const CHANNELS = [
    { key: "emailEnabled", label: "Email notifications", hint: "Sent to your account email" },
    { key: "smsEnabled", label: "SMS notifications", hint: "Sent to your registered phone number" },
    { key: "pushEnabled", label: "Push notifications", hint: "Shown as browser notifications on this device" },
];

const CATEGORIES = [
    { key: "shipmentUpdates", label: "Shipment updates" },
    { key: "etaUpdates", label: "ETA updates" },
    { key: "deliveryAlerts", label: "Delivery alerts" },
    { key: "delayWarnings", label: "Delay warnings" },
];

const DEFAULT_PREFS = {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    shipmentUpdates: true,
    etaUpdates: true,
    deliveryAlerts: true,
    delayWarnings: true,
};

export default function NotificationPreferences() {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [pushPermission, setPushPermission] = useState(
        "Notification" in window ? Notification.permission : "unsupported",
    );

    useEffect(() => {
        (async () => {
            try {
                const data = await getNotificationPreferences();
                setPrefs({ ...DEFAULT_PREFS, ...data });
            } catch (err) {
                console.error("Failed to load notification preferences:", err);
                // Fall back to sensible defaults rather than blocking the page
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggle = (key) => {
        setSaved(false);
        setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePushToggle = async () => {
        if (!prefs.pushEnabled) {
            if (!("Notification" in window)) {
                setError("This browser doesn't support push notifications.");
                return;
            }
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission !== "granted") {
                setError("Browser notification permission was denied — enable it in your browser's site settings to use push.");
                return;
            }
        }
        toggle("pushEnabled");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            await updateNotificationPreferences(prefs);
            setSaved(true);
        } catch (err) {
            console.error("Failed to save notification preferences:", err);
            setError(err?.response?.data?.message || "Could not save your preferences.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="np-muted">Loading preferences…</p>;

    return (
        <div className="np-card">
            <h3>Notification Preferences</h3>
            <p className="np-muted">Choose how and what you want to be notified about.</p>

            <div className="np-section">
                <h4>Channels</h4>
                {CHANNELS.map((c) => (
                    <label key={c.key} className="np-row">
                        <div>
                            <span className="np-row-label">{c.label}</span>
                            <span className="np-row-hint">{c.hint}</span>
                            {c.key === "pushEnabled" && pushPermission === "denied" && (
                                <span className="np-warning">Blocked in browser settings</span>
                            )}
                        </div>
                        <input
                            type="checkbox"
                            checked={!!prefs[c.key]}
                            onChange={c.key === "pushEnabled" ? handlePushToggle : () => toggle(c.key)}
                        />
                    </label>
                ))}
            </div>

            <div className="np-section">
                <h4>Notify me about</h4>
                {CATEGORIES.map((c) => (
                    <label key={c.key} className="np-row">
                        <span className="np-row-label">{c.label}</span>
                        <input
                            type="checkbox"
                            checked={!!prefs[c.key]}
                            onChange={() => toggle(c.key)}
                        />
                    </label>
                ))}
            </div>

            {error && <p className="np-error">{error}</p>}
            {saved && <p className="np-success">Preferences saved.</p>}

            <button className="np-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Preferences"}
            </button>
        </div>
    );
}
