import { createContext, useContext, useState } from "react";
import { getToken, removeToken } from "../utils/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const token = getToken();
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");
        if (token && name && role) {
            return { token, name, role };
        }
        return null;
    });

    const login = ({ token, name, role }) => {
        setUser({ token, name, role });
    };

    const logout = () => {
        removeToken();
        localStorage.removeItem("name");
        localStorage.removeItem("role");
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
