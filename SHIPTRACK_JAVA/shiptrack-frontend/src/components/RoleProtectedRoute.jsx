import { Navigate } from "react-router-dom";

function RoleProtectedRoute({
    children,
    allowedRoles
}) {

    const role =
        localStorage.getItem("role");

    if (
        !allowedRoles.includes(role)
    ) {

        return (
            <Navigate
                to="/dashboard"
            />
        );
    }

    return children;
}

export default RoleProtectedRoute;