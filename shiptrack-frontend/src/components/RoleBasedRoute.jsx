import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleBasedRoute({ allowedRoles, children }) {

    const { role } = useAuth();

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default RoleBasedRoute;