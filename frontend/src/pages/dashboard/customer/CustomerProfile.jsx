import { useEffect, useState } from "react";
import { getCustomerProfile } from "../../../services/customerService";

import {
    FaUser,
    FaShieldAlt,
    FaIdBadge
} from "react-icons/fa";

import "./Profile.css";

function CustomerProfile() {

    const [profile, setProfile] = useState({
        id: "",
        username: "",
        role: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getCustomerProfile();
            setProfile(response);
        }
        catch (error) {
            console.log(error);
        }
    };

    // Helper logic to extract up to 2 initials (e.g., "Vincenzo Cassano" -> "VC")
    const getInitials = (name) => {
        if (!name) return "C";

        // If username is an email address (e.g. vc@gmail.com), use the username part before '@'
        const cleanName = name.includes("@") ? name.split("@")[0] : name;
        
        const words = cleanName.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        
        return cleanName.substring(0, 2).toUpperCase();
    };

    return (

        <div className="profile-container">

            <div className="profile-card">

                {/* Circular Avatar displaying initials instead of FaUserCircle */}
                <div className="profile-avatar">
                    {getInitials(profile.username)}
                </div>

                <h2>{profile.username}</h2>

                <p>Customer Account</p>

                <div className="profile-info">

                    <div>
                        <FaIdBadge/>
                        <span>ID</span>
                        <strong>{profile.id}</strong>
                    </div>

                    <div>
                        <FaUser/>
                        <span>Username</span>
                        <strong>{profile.username}</strong>
                    </div>

                    <div>
                        <FaShieldAlt/>
                        <span>Role</span>
                        <strong>{profile.role}</strong>
                    </div>

                </div>

            </div>

        </div>

    );

}

export default CustomerProfile;