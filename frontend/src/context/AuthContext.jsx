import { createContext, useContext, useState } from "react";
import { getToken, removeToken } from "../utils/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const token = getToken();
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");
        const id = localStorage.getItem("userId");
        const email = localStorage.getItem("email");
        if (token && name && role) {
            return { token, name, role, email, id: id ? Number(id) : null };
        }
        return null;
    });

    const login = ({ token, name, role, id, email }) => {
        localStorage.setItem("userId", id != null ? String(id) : "");
        localStorage.setItem("email", email || "");
        setUser({ token, name, role, email, id: id != null ? Number(id) : null });
    };

    const logout = () => {
        removeToken();
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
