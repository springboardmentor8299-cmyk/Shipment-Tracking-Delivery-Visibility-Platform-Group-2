import { Navigate } from "react-router-dom";
import { getStoredUser } from "../utils/auth";

const normalize = (r) => {
  if (!r) return "";
  let clean = String(r).trim().toUpperCase();
  if (clean.startsWith("ROLE_")) clean = clean.slice(5);
  if (clean === "ADMIN") return "ADMINISTRATOR";
  if (clean === "BUSINESS") return "BUSINESS_CLIENT";
  if (clean === "OPERATOR") return "LOGISTICS_OPERATOR";
  if (clean === "SUPPORT") return "SUPPORT_AGENT";
  return clean;
};

function ProtectedRoute({ allowedRole, allowedRoles, children }) {
  const user = getStoredUser();
  const userRole = normalize(user?.role);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  const roleList = allowedRoles
    ? allowedRoles.map(normalize)
    : allowedRole
    ? [normalize(allowedRole)]
    : [];

  if (roleList.length > 0 && !roleList.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
