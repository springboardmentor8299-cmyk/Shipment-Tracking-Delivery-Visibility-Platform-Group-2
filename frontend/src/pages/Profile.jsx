import { useState, useEffect } from "react";
import { getStoredUser, saveAuthData } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, ShieldCheck, Edit, Save, X, CheckCircle2, Building2 } from "lucide-react";
import "../styles/Profile.css";

function Profile() {
  const authUser = getStoredUser();
  const { username: authUsername, role: authRole } = useAuth();

  const [profileData, setProfileData] = useState(() => {
    return {
      username: authUser?.username || authUsername || "User Name",
      email: authUser?.email || "user@cargoflow.com",
      phone: authUser?.phone || "+1 (555) 234-5678",
      role: authUser?.role || authRole || "CUSTOMER",
      designation: authUser?.designation || "Logistics Specialist"
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [successMsg, setSuccessMsg] = useState("");

  const handleStartEdit = () => {
    setFormData(profileData);
    setIsEditing(true);
    setSuccessMsg("");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(formData);

    // Save updated profile object to localStorage
    const updatedUser = {
      ...authUser,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      designation: formData.designation
    };
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("username", formData.username);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }

    setIsEditing(false);
    setSuccessMsg("Profile updated successfully!");

    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="profile-page space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Account Settings & Profile</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Manage your personal credentials, contact information, and role preferences.</p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Edit size={16} /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#f1f5f9",
              color: "#334155",
              fontWeight: 700,
              fontSize: 13,
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <X size={16} /> Cancel Editing
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: "12px 16px", borderRadius: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={18} color="#16a34a" /> {successMsg}
        </div>
      )}

      {!isEditing ? (
        /* VIEW PROFILE CARD */
        <div className="profile-card">
          <div className="profile-avatar">
            {profileData.username ? profileData.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-main">
            <h2 className="profile-name">{profileData.username}</h2>
            <div className="profile-role">
              {String(profileData.role).toUpperCase() === "ADMIN" ? "System Administrator" : `${profileData.role} — ${profileData.designation}`}
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-box">
                <div className="profile-info-label-row">
                  <Mail size={14} color="#2563eb" />
                  <span className="profile-info-label">Email Address</span>
                </div>
                <div className="profile-info-value">{profileData.email}</div>
              </div>

              <div className="profile-info-box">
                <div className="profile-info-label-row">
                  <Phone size={14} color="#2563eb" />
                  <span className="profile-info-label">Phone Number</span>
                </div>
                <div className="profile-info-value">{profileData.phone}</div>
              </div>

              <div className="profile-info-box">
                <div className="profile-info-label-row">
                  <ShieldCheck size={14} color="#2563eb" />
                  <span className="profile-info-label">Account Privilege</span>
                </div>
                <div className="profile-info-value">{profileData.role}</div>
              </div>

              <div className="profile-info-box">
                <div className="profile-info-label-row">
                  <Building2 size={14} color="#2563eb" />
                  <span className="profile-info-label">Designation</span>
                </div>
                <div className="profile-info-value">{profileData.designation}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT PROFILE FORM */
        <div style={{ background: "#ffffff", borderRadius: 24, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.05)" }}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Edit Profile Information</h3>

          <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Username / Display Name
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #cbd5e1", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #cbd5e1", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #cbd5e1", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #cbd5e1", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: 13, color: "#475569" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#2563eb", color: "#ffffff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
              >
                <Save size={16} /> Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
