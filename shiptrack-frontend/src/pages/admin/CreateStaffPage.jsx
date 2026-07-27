//import { useState } from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createStaff } from "../../api/adminService";
import "./CreateStaff.css";

function CreateStaffPage() {
    
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "LOGISTICS_OPERATOR",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (message.text) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({
        type: "",
        text: "",
      });

      await createStaff(formData);

      setMessage({
        type: "success",
        text: "Staff account created successfully.",
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "LOGISTICS_OPERATOR",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to create staff account.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="create-staff-page">
      <div className="staff-glow staff-glow-one"></div>
      <div className="staff-glow staff-glow-two"></div>

      <header className="staff-topbar">
        <Link to="/admin" className="staff-brand">
          <span className="staff-brand-icon">🚚</span>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Administration Portal</small>
          </div>
        </Link>

        <Link to="/admin" className="staff-back-button">
          <span>←</span>
          Back to Dashboard
        </Link>
      </header>

      <main className="create-staff-main">
        <section className="create-staff-heading">
          <div className="create-staff-badge">
            <span></span>
            STAFF MANAGEMENT
          </div>

          <h1>Create Staff Account</h1>

          <p>
            Add Logistics Operators and Support Agents to manage shipments,
            deliveries and customer support operations.
          </p>
        </section>

        <section className="create-staff-layout">
          <div className="create-staff-card">
            <div className="staff-card-header">
              <div>
                <span className="staff-card-label">NEW TEAM MEMBER</span>
                <h2>Staff information</h2>
                <p>Enter the details required to create a new staff account.</p>
              </div>

              <div className="staff-header-icon">👤</div>
            </div>

            {message.text && (
              <div className={`staff-message ${message.type}`}>
                <span>{message.type === "success" ? "✓" : "!"}</span>
                <p>{message.text}</p>
              </div>
            )}

            <form className="create-staff-form" onSubmit={handleSubmit}>
              <div className="staff-form-grid">
                <div className="staff-form-group">
                  <label htmlFor="fullName">Full Name</label>

                  <div className="staff-input-wrapper">
                    <span className="staff-input-icon">👤</span>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label htmlFor="phone">Phone Number</label>

                  <div className="staff-input-wrapper">
                    <span className="staff-input-icon">☎</span>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="staff-form-group staff-form-full">
                  <label htmlFor="email">Email Address</label>

                  <div className="staff-input-wrapper">
                    <span className="staff-input-icon">✉</span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter official email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="staff-form-group staff-form-full">
                  <label htmlFor="password">Temporary Password</label>

                  <div className="staff-input-wrapper">
                    <span className="staff-input-icon">🔒</span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="staff-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <small className="staff-input-hint">
                    Use a strong password containing letters, numbers and
                    symbols.
                  </small>
                </div>
              </div>

              <div className="staff-role-section">
                <div className="staff-role-heading">
                  <div>
                    <span className="staff-card-label">ACCOUNT ACCESS</span>
                    <h3>Select staff role</h3>
                  </div>

                  <span className="staff-role-required">Required</span>
                </div>

                <div className="staff-role-grid">
                  <button
                    type="button"
                    className={`staff-role-card ${
                      formData.role === "LOGISTICS_OPERATOR"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleRoleSelect("LOGISTICS_OPERATOR")
                    }
                  >
                    <div className="staff-role-icon logistics">🚚</div>

                    <div className="staff-role-content">
                      <div className="staff-role-title">
                        <h4>Logistics Operator</h4>
                        <span className="staff-role-check">✓</span>
                      </div>

                      <p>
                        Manages shipment movement, status updates and delivery
                        operations.
                      </p>

                      <div className="staff-role-permissions">
                        <span>Shipment access</span>
                        <span>Status updates</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`staff-role-card ${
                      formData.role === "SUPPORT_AGENT" ? "selected" : ""
                    }`}
                    onClick={() => handleRoleSelect("SUPPORT_AGENT")}
                  >
                    <div className="staff-role-icon support">🎧</div>

                    <div className="staff-role-content">
                      <div className="staff-role-title">
                        <h4>Support Agent</h4>
                        <span className="staff-role-check">✓</span>
                      </div>

                      <p>
                        Assists customers and resolves shipment-related
                        questions and issues.
                      </p>

                      <div className="staff-role-permissions">
                        <span>Customer support</span>
                        <span>Issue handling</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="staff-form-actions">
                <Link to="/admin/dashboard" className="staff-cancel-button">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="staff-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="staff-button-loader"></span>
                      Creating Account
                    </>
                  ) : (
                    <>
                      <span>＋</span>
                      Create Staff Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="staff-information-panel">
            <div className="staff-info-main-card">
              <div className="staff-info-icon">🛡</div>

              <span className="staff-card-label">SECURE ACCESS</span>

              <h2>Build your operations team</h2>

              <p>
                Every staff member receives role-based access to the tools
                required for their assigned responsibilities.
              </p>

              <div className="staff-info-divider"></div>

              <div className="staff-info-list">
                <div>
                  <span className="staff-list-icon blue">✓</span>

                  <div>
                    <strong>Role-based permissions</strong>
                    <p>
                      Staff only access features related to their assigned role.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="staff-list-icon purple">✓</span>

                  <div>
                    <strong>Centralized management</strong>
                    <p>
                      Manage staff accounts from the administrator dashboard.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="staff-list-icon green">✓</span>

                  <div>
                    <strong>Secure authentication</strong>
                    <p>
                      Protected account access using ShipTrack-Pro security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="staff-summary-card">
              <div className="staff-summary-header">
                <span>Selected Role</span>
                <span className="staff-status-dot"></span>
              </div>

              <div className="staff-selected-role">
                <div
                  className={`staff-selected-icon ${
                    formData.role === "LOGISTICS_OPERATOR"
                      ? "logistics"
                      : "support"
                  }`}
                >
                  {formData.role === "LOGISTICS_OPERATOR" ? "🚚" : "🎧"}
                </div>

                <div>
                  <strong>
                    {formData.role === "LOGISTICS_OPERATOR"
                      ? "Logistics Operator"
                      : "Support Agent"}
                  </strong>

                  <span>
                    {formData.role === "LOGISTICS_OPERATOR"
                      ? "Shipment operations access"
                      : "Customer assistance access"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default CreateStaffPage;