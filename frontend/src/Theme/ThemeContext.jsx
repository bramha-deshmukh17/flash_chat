import { createContext, useContext, useState, useEffect } from "react";

// Create a ThemeContext
const ThemeContext = createContext();

// Custom hook for using the ThemeContext
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider to wrap the app
export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or default to "dark"
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

    // Toggle theme function
    const toggleDarkMode = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // Apply the theme to the body class and store in localStorage
    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
