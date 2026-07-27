import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));

    const login = (jwt, userRole) => {

        localStorage.setItem("token", jwt);
        localStorage.setItem("role", userRole);

        setToken(jwt);
        setRole(userRole);
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);
    };

    useEffect(() => {

        setToken(localStorage.getItem("token"));
        setRole(localStorage.getItem("role"));

    }, []);

    return (

        <AuthContext.Provider
            value={{
                token,
                role,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>

    );
};

export const useAuth = () => useContext(AuthContext);