export function applyAuthResponse(response, navigate) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("username", response.username);
    localStorage.setItem("name", response.name || "");
    localStorage.setItem("role", response.role);
    window.dispatchEvent(new Event("nameChanged"));

    switch (response.role) {
        case "ADMIN":
            navigate("/admin");
            break;

        case "CUSTOMER":
            navigate("/customer");
            break;

        case "BUSINESS_CLIENT":
            navigate("/business_client");
            break;

        case "LOGISTICS_OPERATOR":
            navigate("/logistics_operator");
            break;

        case "SUPPORT_AGENT":
            navigate("/support_agent");
            break;

        default:
            navigate("/login");
    }
}