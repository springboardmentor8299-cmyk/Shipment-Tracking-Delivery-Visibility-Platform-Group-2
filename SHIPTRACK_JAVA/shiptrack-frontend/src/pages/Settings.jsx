import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const Settings = () => {

    const [profile, setProfile] = useState({
        id: "",
        fullName: "",
        email: "",
        phone: "",
        role: "",
        isActive: false,
        createdAt: ""
    });

    const [loading, setLoading] = useState(true);

    const [savingProfile, setSavingProfile] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    


    const loadProfile = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.get("/settings/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProfile(response.data);

        } catch (error) {

            console.error(error);

            setErrorMessage("Failed to load profile.");

        } finally {

            setLoading(false);
        }
    };

    


    const handleProfileChange = (event) => {

        const { name, value } = event.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    


    const handlePasswordChange = (event) => {

        const { name, value } = event.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    


    const saveProfile = async () => {

        try {

            setSavingProfile(true);
            setSuccessMessage("");
            setErrorMessage("");

            const token = localStorage.getItem("token");

            const requestBody = {
                fullName: profile.fullName,
                phone: profile.phone
            };

            const response = await api.put(
                "/settings/profile",
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProfile(response.data);

            setSuccessMessage("Profile updated successfully.");

        } catch (error) {

            console.error(error);

            if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Failed to update profile.");
            }

        } finally {

            setSavingProfile(false);
        }
    };

    


    const changePassword = async () => {

        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
            setErrorMessage("All password fields are required.");
            return;
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setErrorMessage("New password and confirm password do not match.");
            return;
        }

        try {

            setChangingPassword(true);
            setSuccessMessage("");
            setErrorMessage("");

            const token = localStorage.getItem("token");

            await api.put(
                "/settings/change-password",
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccessMessage("Password changed successfully.");

            
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {

            console.error(error);

            if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Failed to change password.");
            }

        } finally {

            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="mt-3">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">

            <h2 className="mb-4">
                Account Settings
            </h2>

            {successMessage && (
                <div className="alert alert-success">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-danger">
                    {errorMessage}
                </div>
            )}

            <div className="row">

                {}

                <div className="col-lg-4 mb-4">

                    <div className="card shadow-sm">

                        <div className="card-body text-center">

                            <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    fontSize: "32px",
                                    fontWeight: "bold"
                                }}
                            >
                                {profile.fullName
                                    ? profile.fullName.charAt(0).toUpperCase()
                                    : "U"}
                            </div>

                            <h4>{profile.fullName}</h4>

                            <p className="text-muted">
                                {profile.email}
                            </p>

                            <hr />

                            <div className="text-start">

                                <p>
                                    <strong>Role:</strong>{" "}
                                    {profile.role}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {profile.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </p>

                                <p>
                                    <strong>Phone:</strong>{" "}
                                    {profile.phone || "N/A"}
                                </p>

                                <p>
                                    <strong>Joined:</strong>{" "}
                                    {profile.createdAt
                                        ? new Date(
                                              profile.createdAt
                                          ).toLocaleDateString()
                                        : "-"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {}

                <div className="col-lg-8">

                    {}

                    <div className="card shadow-sm mb-4">

                        <div className="card-header">

                            <h5 className="mb-0">
                                Edit Profile
                            </h5>

                        </div>

                        <div className="card-body">

                            <div className="mb-3">

                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleProfileChange}
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    value={profile.email}
                                    disabled
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    value={profile.phone || ""}
                                    onChange={handleProfileChange}
                                />

                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={saveProfile}
                                disabled={savingProfile}
                            >
                                {savingProfile
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                    {}

                    <div className="card shadow-sm">

                        <div className="card-header">

                            <h5 className="mb-0">
                                Change Password
                            </h5>

                        </div>

                        <div className="card-body">

                            <div className="mb-3">

                                <label className="form-label">
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="currentPassword"
                                    value={
                                        passwordData.currentPassword
                                    }
                                    onChange={handlePasswordChange}
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    value={
                                        passwordData.newPassword
                                    }
                                    onChange={handlePasswordChange}
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="confirmPassword"
                                    value={
                                        passwordData.confirmPassword
                                    }
                                    onChange={handlePasswordChange}
                                />

                            </div>

                            <button
                                className="btn btn-danger"
                                onClick={changePassword}
                                disabled={changingPassword}
                            >
                                {changingPassword
                                    ? "Updating..."
                                    : "Change Password"}
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Settings;