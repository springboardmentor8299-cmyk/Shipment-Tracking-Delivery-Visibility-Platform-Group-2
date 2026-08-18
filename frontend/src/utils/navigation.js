const normalizeRole = (role) => {
  const normalized = String(role || "")
    .trim()
    .toUpperCase();

  if (normalized.startsWith("ROLE_")) {
    return normalized.slice(5);
  }
  return normalized;
};

export const getDashboardRouteForRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "ADMIN" || normalizedRole === "ADMINISTRATOR") {
    return "/admin/dashboard";
  }

  if (normalizedRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  if (normalizedRole === "BUSINESS_CLIENT" || normalizedRole === "BUSINESS") {
    return "/business/dashboard";
  }

  if (normalizedRole === "LOGISTICS_OPERATOR" || normalizedRole === "OPERATOR") {
    return "/operator/dashboard";
  }

  if (normalizedRole === "SUPPORT_AGENT" || normalizedRole === "SUPPORT") {
    return "/support/dashboard";
  }

  return "/login";
};

export const getCurrentDashboardRoute = () => {
  const storedRole = localStorage.getItem("role");
  return getDashboardRouteForRole(storedRole);
};

export const authRouteTestHelper = (role) => {
  const expected = getDashboardRouteForRole(role);
  const actual = window?.location?.pathname || "";
  return {
    role,
    expected,
    actual,
    matches: expected === actual,
  };
};
