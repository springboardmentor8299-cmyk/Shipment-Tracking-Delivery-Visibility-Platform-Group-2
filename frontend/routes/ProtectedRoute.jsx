import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRole, children }) {
  try {
    const stored = localStorage.getItem("cargoflow_auth");
    if (!stored) return <Navigate to="/login" replace />;

    const parsed = JSON.parse(stored);
    let role = parsed?.role || localStorage.getItem("role") || "";
    role = String(role).trim().toUpperCase();
    if (role.startsWith("ROLE_")) {
      role = role.slice(5);
    }

    if (!role) return <Navigate to="/login" replace />;

    if (allowedRole && role !== allowedRole.toUpperCase()) {
      return role === "ADMIN" ? (
        <Navigate to="/admin/dashboard" replace />
      ) : (
        <Navigate to="/customer/dashboard" replace />
      );
    }

    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
