import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("token");
        const timer = setTimeout(() => {
            navigate("/login", { replace: true });
        }, 250);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f8fafc",
                color: "#0f172a",
                padding: "24px"
            }}
        >
            <div
                style={{
                    maxWidth: "520px",
                    width: "100%",
                    background: "white",
                    borderRadius: "20px",
                    padding: "32px",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
                    textAlign: "center"
                }}
            >
                <h1 style={{ margin: 0, fontSize: "32px" }}>Logging out...</h1>
                <p style={{ marginTop: "16px", color: "#475569" }}>
                    You have been signed out. Redirecting to the login page.
                </p>
            </div>
        </div>
    );
}

export default Logout;
