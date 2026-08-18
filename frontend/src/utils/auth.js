export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem("cargoflow_auth");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) return JSON.parse(storedUser);

    const auth = getStoredAuth();
    if (!auth) return null;
    return {
      id: auth.id || null,
      username: auth.username || null,
      email: auth.email || null,
      role: auth.role || null,
    };
  } catch {
    return null;
  }
};

const normalizeRole = (role) => {
  const normalized = String(role || "").trim().toUpperCase();
  return normalized.startsWith("ROLE_") ? normalized.slice(5) : normalized;
};

export const saveAuthData = ({ token, role, email, username, id }) => {
  const normalizedRole = normalizeRole(role);
  const authData = {
    token,
    role: normalizedRole,
    email,
    username,
    id,
  };

  localStorage.setItem("cargoflow_auth", JSON.stringify(authData));
  localStorage.setItem("user", JSON.stringify({ id, role: normalizedRole, email, username }));
  localStorage.setItem("role", normalizedRole);
  localStorage.setItem("email", email || "");
  localStorage.setItem("username", username || "");
  if (id) localStorage.setItem("userId", id.toString());
};

export const clearAuthData = () => {
  localStorage.removeItem("cargoflow_auth");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
};
