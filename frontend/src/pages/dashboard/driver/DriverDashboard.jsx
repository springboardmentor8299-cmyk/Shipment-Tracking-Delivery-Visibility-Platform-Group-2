import { useEffect, useState } from "react";
import DriverSidebar from "../../../components/driver/DriverSidebar";
import DriverNavbar from "../../../components/driver/DriverNavbar";
import StatCard from "../../../components/StatCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Tracking from "../../tracking/Tracking";
import DriverNotifications from "./DriverNotifications";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaTruck,
  FaShieldAlt,
  FaKey,
  FaLock,
  FaBoxOpen,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaWeightHanging,
  FaBoxes,
  FaRoute,
  FaArrowLeft,
} from "react-icons/fa";

import {
  getDashboard,
  getActiveShipments,
  updateShipmentStatus,
  updateMyStatus,
  getHistory,
  getProfile,
  changePassword,
} from "../../../services/driverPortalService";

import "../../../styles/StatCard.css";
import "./DriverDashboard.css";

const NEXT_STEP = {
  CREATED: { status: "PICKED_UP", label: "Mark as Picked Up" },
  PICKED_UP: { status: "IN_TRANSIT", label: "Mark as In Transit" },
  IN_TRANSIT: { status: "OUT_FOR_DELIVERY", label: "Mark as Out for Delivery" },
  OUT_FOR_DELIVERY: { status: "DELIVERED", label: "Mark as Delivered" },
};

const CAN_FAIL = ["IN_TRANSIT", "OUT_FOR_DELIVERY"];

function badgeClass(status) {
  return `driver-status-badge ${String(status || "").toLowerCase()}`;
}

function DriverDashboard() {
  // Section is stored in the URL (?section=xyz) instead of local state so
  // that every sidebar/navbar click creates a real browser history entry,
  // letting the Back button step through sections instead of jumping to login.
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") || "dashboard";
  const setSection = (key) => {
    setSearchParams(key === "dashboard" ? {} : { section: key });
  };

  const [profile, setProfile] = useState(null);
  const [trackingSearch, setTrackingSearch] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setProfile)
      .catch((err) => console.error("Failed to load driver profile", err));
  }, []);

  const openTracking = (trackingId) => {
    setTrackingSearch(trackingId);
    setSection("tracking");
  };

  return (
    <div className="driver-dashboard">
      <DriverSidebar
        onSelect={setSection}
        activeSection={section === "tracking" ? "dashboard" : section}
      />

      <div className="driver-main">
        <DriverNavbar onNavigate={setSection} />

        <div className="driver-content">
          {section === "dashboard" && (
            <div className="dashboard-section-wrapper">
              <div className="dashboard-header-banner dashboard-header-banner-row">
                <div>
                  <h1>Welcome back, {profile?.name || "Driver"} 👋</h1>
                  <p>Here is your current assignment and delivery overview.</p>
                </div>
                <StatusToggle profile={profile} onUpdated={setProfile} />
              </div>

              <div className="stats-container">
                <StatCard
                  title="Driver Status"
                  value={profile?.status || "--"}
                  icon={<FaTruck />}
                  color="#2563eb"
                />
                <StatCard
                  title="Total Delivered"
                  value={profile?.totalDelivered ?? 0}
                  icon={<FaCheckCircle />}
                  color="#16a34a"
                />
                <StatCard
                  title="Assigned Vehicle"
                  value={profile?.vehicleNumber || "--"}
                  icon={<FaBoxOpen />}
                  color="#d97706"
                />
                <StatCard
                  title="Active Load"
                  value={`${profile?.activeShipmentCount ?? 0} / ${
                    profile?.shipmentCapacity ?? "--"
                  }`}
                  icon={<FaBoxes />}
                  color="#7c3aed"
                />
              </div>

              <div className="shipment-card-wrapper">
                <ActiveShipmentsSection
                  refreshProfile={() => getDashboard().then(setProfile)}
                  onOpenTracking={openTracking}
                />
              </div>
            </div>
          )}

          {section === "history" && <HistorySection />}

          {section === "notifications" && <DriverNotifications />}

          {section === "profile" && <ProfileSection profile={profile} />}

          {section === "tracking" && (
            <div className="driver-tracking-embed">
              <button
                type="button"
                className="driver-back-btn"
                onClick={() => setSection("dashboard")}
              >
                <FaArrowLeft /> Back to My Shipment
              </button>
              <Tracking initialSearchOverride={trackingSearch} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SELECTABLE_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "OFFLINE", label: "Offline" },
];

function StatusToggle({ profile, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!profile) return null;

  const status = profile.status;
  const isOnDelivery = status === "ON_DELIVERY";

  const handleChange = async (value) => {
    if (value === status || busy || isOnDelivery) return;

    setError("");
    setBusy(true);
    try {
      const updated = await updateMyStatus(value);
      onUpdated(updated);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update your status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="driver-status-toggle">
      <span className="driver-status-toggle-label">My Status</span>

      <div className="driver-status-toggle-options">
        {SELECTABLE_STATUSES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`driver-status-toggle-btn ${
              status === opt.value ? "active" : ""
            }`}
            disabled={busy || isOnDelivery}
            onClick={() => handleChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isOnDelivery && (
        <span className="driver-status-toggle-hint">
          On an active delivery — frees up automatically once completed
        </span>
      )}

      {error && <span className="driver-status-toggle-error">{error}</span>}
    </div>
  );
}

function ActiveShipmentsSection({ refreshProfile, onOpenTracking }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getActiveShipments()
      .then((data) => setShipments(data || []))
      .catch((err) => console.error("Failed to load active shipments", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleShipmentSettled = (trackingId) => {
    // A shipment just reached a terminal status (or failed) -- drop it from
    // the active list and refresh the profile so the load counter updates.
    setShipments((prev) => prev.filter((s) => s.trackingId !== trackingId));
    refreshProfile();
  };

  if (loading) return <p className="driver-empty">Loading your shipments...</p>;

  if (shipments.length === 0) {
    return (
      <div className="driver-empty">
        <FaBoxOpen
          style={{ fontSize: "32px", color: "#94a3b8", marginBottom: "10px" }}
        />
        <h3>No Active Shipments</h3>
        <p>
          You don't have any active shipments assigned right now. Check back
          once your operator assigns one.
        </p>
      </div>
    );
  }

  return (
    <div className="active-shipments-list">
      {shipments.map((shipment) => (
        <ShipmentJobCard
          key={shipment.trackingId}
          shipment={shipment}
          onOpenTracking={onOpenTracking}
          onSettled={() => handleShipmentSettled(shipment.trackingId)}
        />
      ))}
    </div>
  );
}
function ShipmentJobCard({
  shipment: initialShipment,
  onOpenTracking,
  onSettled,
}) {
  const [current, setCurrent] = useState(initialShipment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (status) => {
    setError("");
    setBusy(true);

    try {
      if (status === "DELIVERED") {
        navigate("/driver/pod", {
          state: { shipment: current },
        });
        return;
      }

      const updated = await updateShipmentStatus(current.trackingId, status);
      setCurrent(updated);

      if (["FAILED_DELIVERY", "CANCELLED"].includes(updated.status)) {
        onSettled();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not update the shipment status. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const shipment = current;
  const next = NEXT_STEP[shipment.status];

  return (
    <div className="driver-shipment-card">
      <div className="card-top-header">
        <div
          className="route-title-clickable"
          role="button"
          tabIndex={0}
          title="View this shipment on the tracking map"
          onClick={() => onOpenTracking?.(shipment.trackingId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenTracking?.(shipment.trackingId);
            }
          }}
        >
          <div className="route-title">
            <FaRoute className="route-icon" />
            <h3>
              {shipment.origin} → {shipment.destination}
            </h3>
          </div>
          <div className="driver-shipment-track">
            Tracking ID: <span>{shipment.trackingId}</span>
          </div>
        </div>
        <span className={badgeClass(shipment.status)}>
          ● {shipment.status?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="shipment-details-grid">
        <div className="detail-box">
          <FaUser className="detail-icon" />
          <div>
            <label>Sender / Customer</label>
            <strong>{shipment.customerName || "--"}</strong>
          </div>
        </div>

        <div className="detail-box">
          <FaUser className="detail-icon highlight" />
          <div>
            <label>Receiver</label>
            <strong>{shipment.receiverName || "--"}</strong>
          </div>
        </div>

        <div className="detail-box">
          <FaBoxes className="detail-icon" />
          <div>
            <label>Total Items</label>
            <strong>{shipment.noOfItems || "--"} Pcs</strong>
          </div>
        </div>

        <div className="detail-box">
          <FaWeightHanging className="detail-icon" />
          <div>
            <label>Total Weight</label>
            <strong>{shipment.totalWeightOfItems || "--"}</strong>
          </div>
        </div>

        <div className="detail-box full-width">
          <FaMapMarkerAlt className="detail-icon map-icon" />
          <div>
            <label>Current Location</label>
            <strong>{shipment.currentLocationName || "--"}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="driver-actions">
        {next && (
          <button
            className="driver-btn driver-btn-primary"
            disabled={busy}
            onClick={() => handleUpdate(next.status)}
          >
            {busy ? "Updating..." : next.label}
          </button>
        )}

        {CAN_FAIL.includes(shipment.status) && (
          <button
            className="driver-btn driver-btn-danger"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Report this delivery as failed?")) {
                handleUpdate("FAILED_DELIVERY");
              }
            }}
          >
            Report Failed Delivery
          </button>
        )}
      </div>
    </div>
  );
}
function HistorySection() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data || []))
      .catch((err) => console.error("Failed to load history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-container">
      <div className="profile-header-banner">
        <h2>Delivery History</h2>
        <p>Review past shipments you've completed, failed, or cancelled.</p>
      </div>

      {loading ? (
        <p className="driver-empty">Loading history...</p>
      ) : history.length === 0 ? (
        <div className="driver-empty">
          <p>No completed deliveries recorded yet.</p>
        </div>
      ) : (
        <div className="driver-table-wrap">
          <table className="driver-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Route</th>
                <th>Receiver</th>
                <th>Status</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id || s.trackingId}>
                  <td className="tracking-cell">{s.trackingId}</td>
                  <td>
                    {s.origin} → {s.destination}
                  </td>
                  <td>{s.receiverName || "--"}</td>
                  <td>
                    <span className={badgeClass(s.status)}>
                      {s.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{s.deliveryDate || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProfileSection({ profile }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    } else {
      getProfile()
        .then(setLocalProfile)
        .catch((err) => console.error(err));
    }
  }, [profile]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "New passwords don't match." });
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Could not update password.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "D";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-container">
      <div className="profile-header-banner">
        <h2>My Profile</h2>
        <p>Manage your driver details and account security.</p>
      </div>

      <div className="profile-grid">
        <div className="driver-profile-card">
          <div className="profile-avatar-header">
            <div className="profile-avatar">
              <span>{getInitials(localProfile?.name)}</span>
            </div>
            <div className="profile-header-info">
              <h3>{localProfile?.name || "Driver Name"}</h3>
              <span
                className={`profile-status-pill ${String(
                  localProfile?.status || "AVAILABLE",
                ).toLowerCase()}`}
              >
                ● {localProfile?.status || "AVAILABLE"}
              </span>
            </div>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-item">
              <div className="profile-icon-wrapper">
                <FaEnvelope />
              </div>
              <div className="profile-detail-content">
                <label>Email Address</label>
                <strong>{localProfile?.email || "--"}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-icon-wrapper">
                <FaPhone />
              </div>
              <div className="profile-detail-content">
                <label>Phone Number</label>
                <strong>{localProfile?.phone || "--"}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-icon-wrapper">
                <FaIdCard />
              </div>
              <div className="profile-detail-content">
                <label>License Number</label>
                <strong>{localProfile?.licenseNumber || "--"}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-icon-wrapper">
                <FaTruck />
              </div>
              <div className="profile-detail-content">
                <label>Assigned Vehicle</label>
                <strong>
                  {localProfile?.vehicleType
                    ? `${localProfile.vehicleType} — ${localProfile.vehicleNumber}`
                    : localProfile?.vehicleNumber || "--"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="driver-password-card">
          <div className="password-card-header">
            <div className="password-icon-badge">
              <FaShieldAlt />
            </div>
            <div>
              <h3>Security Settings</h3>
              <p>Update your password below</p>
            </div>
          </div>

          <form
            className="driver-password-form"
            onSubmit={handleChangePassword}
          >
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-with-icon">
                <FaKey className="field-icon" />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon" />
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {msg && <p className={`driver-form-msg ${msg.type}`}>{msg.text}</p>}

            <button
              className="driver-btn driver-btn-primary submit-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
