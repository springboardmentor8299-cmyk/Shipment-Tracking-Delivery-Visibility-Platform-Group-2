import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaTimes,
  FaUserPlus,
  FaHeadset,
  FaRoute,
  FaHandshake,
} from "react-icons/fa";
import "../styles/CreateStaffModal.css";

const ROLES = [
  {
    value: "SUPPORT_AGENT",
    label: "Support Agent",
    icon: FaHeadset,
    cls: "selected-support-agent",
  },
  {
    value: "LOGISTICS_OPERATOR",
    label: "Logistics Operator",
    icon: FaRoute,
    cls: "selected-logistics-operator",
  },
  {
    value: "BUSINESS_CLIENT",
    label: "Business Client",
    icon: FaHandshake,
    cls: "selected-business-client",
  },
];

function CreateStaffModal({ show, onClose, onSave }) {
  const [staffData, setStaffData] = useState({
    name: "",
    username: "",
    password: "",
    role: "SUPPORT_AGENT",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    setStaffData({
      ...staffData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (roleValue) => {
    setStaffData({ ...staffData, role: roleValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(staffData);
      setStaffData({
        name: "",
        username: "",
        password: "",
        role: "SUPPORT_AGENT",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to create account",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="csm-overlay" onClick={onClose}>
      <div className="csm-card" onClick={(e) => e.stopPropagation()}>
        <div className="csm-header">
          <button
            type="button"
            className="csm-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <div className="csm-header-icon">
            <FaUserPlus />
          </div>
          <h2>Create Staff Account</h2>
          <p>Add a teammate and assign what they can access</p>
        </div>

        <div className="csm-body">
          {error && <div className="csm-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="csm-field">
              <label>Full Name</label>
              <div className="csm-input-wrap">
                <FaUser />
                <input
                  name="name"
                  placeholder="e.g. Priya Sharma"
                  value={staffData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="csm-field">
              <label>Username / Email</label>
              <div className="csm-input-wrap">
                <FaEnvelope />
                <input
                  name="username"
                  placeholder="e.g. priya@shiptrack.com"
                  value={staffData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="csm-field">
              <label>Temporary Password</label>
              <div className="csm-input-wrap">
                <FaLock />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter a temporary password"
                  value={staffData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="csm-field">
              <label>Role</label>
              <div className="csm-role-grid">
                {ROLES.map(({ value, label, icon: Icon, cls }) => (
                  <div
                    key={value}
                    className={`csm-role-card ${staffData.role === value ? cls : ""}`}
                    onClick={() => handleRoleSelect(value)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="csm-actions">
              <button
                type="button"
                className="csm-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="csm-btn-submit"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateStaffModal;
