import { useEffect, useState } from "react";

import {
  getCustomerProfile,
  updateCustomerPhone,
} from "../../../services/customerService";

import { FaUser, FaShieldAlt, FaIdBadge, FaPhone } from "react-icons/fa";

import "./Profile.css";

function CustomerProfile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    username: "",
    phoneNumber: "",
    role: "",
  });

  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [phoneInput, setPhoneInput] = useState("");

  const [saving, setSaving] = useState(false);

  // ============================================
  // Load Profile
  // ============================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getCustomerProfile();

      console.log("Customer Profile:", response);

      setProfile(response);

      setPhoneInput(response.phoneNumber || "");
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  // ============================================
  // Generate Initials
  // ============================================

  const getInitials = (name) => {
    if (!name) {
      return "C";
    }

    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // ============================================
  // Save Phone Number
  // ============================================

  const handleSavePhone = async () => {
    const cleanedPhone = phoneInput.trim();

    if (!cleanedPhone) {
      alert("Please enter a phone number");

      return;
    }

    try {
      setSaving(true);

      const response = await updateCustomerPhone(cleanedPhone);

      console.log("Phone update response:", response);

      // Update UI immediately
      setProfile((previous) => ({
        ...previous,

        phoneNumber: response.phoneNumber || cleanedPhone,
      }));

      setPhoneInput(response.phoneNumber || cleanedPhone);

      setIsEditingPhone(false);

      alert("Phone number updated successfully");
    } catch (error) {
      console.error("Failed to update phone number:", error);

      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert("Failed to update phone number");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Cancel Phone Editing
  // ============================================

  const handleCancelEdit = () => {
    setPhoneInput(profile.phoneNumber || "");

    setIsEditingPhone(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* ================================= */}
        {/* PROFILE AVATAR */}
        {/* ================================= */}

        <div className="profile-avatar">{getInitials(profile.name)}</div>

        {/* ================================= */}
        {/* CUSTOMER NAME */}
        {/* ================================= */}

        <h2>{profile.name || "Customer"}</h2>

        <p>Customer Account</p>

        {/* ================================= */}
        {/* PROFILE INFORMATION */}
        {/* ================================= */}

        <div className="profile-info">
          {/* ID */}
          <div className="profile-row">
            <FaIdBadge />

            <span>ID</span>

            <strong>{profile.id}</strong>
          </div>

          {/* USERNAME */}
          <div className="profile-row">
            <FaUser />

            <span>Username</span>

            <strong>{profile.username || "-"}</strong>
          </div>

          {/* PHONE NUMBER */}
          <div className="profile-row">
            <FaPhone />

            <span>Phone</span>

            {isEditingPhone ? (
              <div className="phone-edit">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="Enter phone number"
                />

                <div className="phone-buttons">
                  <button
                    className="save-btn"
                    onClick={handleSavePhone}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="phone-display">
                <strong>{profile.phoneNumber || "Not added"}</strong>

                <button
                  className="edit-btn"
                  onClick={() => setIsEditingPhone(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* ROLE */}
          <div className="profile-row">
            <FaShieldAlt />

            <span>Role</span>

            <strong>{profile.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
