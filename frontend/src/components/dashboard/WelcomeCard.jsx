import { useAuth } from "../../context/AuthContext";

function WelcomeCard() {

    const { user } = useAuth();

    return (

        <div className="welcome-card">

            <h2>
                Welcome Back, {user?.name || "Admin"} 👋
            </h2>

            <p>
                Here's a quick overview of today's shipment activities.
            </p>

        </div>

    );

}

export default WelcomeCard;
