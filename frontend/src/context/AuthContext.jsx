import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedRole = localStorage.getItem("role");

        if (storedUsername) {
            setUsername(storedUsername);
            setRole(storedRole || "user");
            setIsAuthenticated(true);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUsername("");
        setRole("");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ username, role, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
