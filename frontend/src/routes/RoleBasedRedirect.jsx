import { Navigate } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import { getDashboardRouteForRole } from "../utils/navigation";

export function RoleBasedRedirect() {
  const user = getStoredUser();
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const targetRoute = getDashboardRouteForRole(user.role);
  return <Navigate to={targetRoute} replace />;
}

export default RoleBasedRedirect;
