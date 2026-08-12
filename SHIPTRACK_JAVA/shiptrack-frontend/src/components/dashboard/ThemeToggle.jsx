import { useEffect, useState } from "react";

const THEME_KEY = "shiptrack-theme";

function getInitialTheme() {
    try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light") {
            return stored;
        }
    } catch {
        
    }
    return "light";
}

function ThemeToggle({ className = "" }) {

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            className={`theme-toggle-btn ${className}`}
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle light and dark mode"
        >
            <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
            <span>{isDark ? "Light" : "Dark"}</span>
        </button>
    );
}

export default ThemeToggle;
