import { useState } from "react";
import { FaBars, FaCog, FaLightbulb, FaTimes } from "react-icons/fa";
import { useTheme } from "../Theme/ThemeContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { theme, toggleDarkMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            id="sidebar"
            className={`
                flex flex-col
                transition-all duration-300
                ${isCollapsed ? "w-16" : "w-64"}
                min-h-0 h-screen
                bg-gray-800
                overflow-y-auto
            `}
            style={{ minWidth: isCollapsed ? "4rem" : "16rem" }}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 pl-3 ml-2">
                {!isCollapsed && (
                    <h1
                        className="text-lg font-bold"
                        style={{ color: "var(--main-heading)" }}
                    >
                        Flash Chat
                    </h1>
                )}
                <button id="nav-toggle-btn" onClick={toggleSidebar} style={{ color: "var(--main-heading)" }}>
                    {isCollapsed ? (<FaBars />) : (<FaTimes />)}
                </button>
            </div>

            {/* Sidebar Content */}
            <nav className="flex-grow flex flex-col justify-end mt-auto ml-2 mr-2 mb-3">
                <ul className="space-y-4">
                    <li className="flex items-center p-2 cursor-pointer rounded-md">
                        <button
                            id="settings-btn"
                            onClick={() => navigate("/settings")}
                            className="flex items-center rounded-md w-full"
                        >
                            <FaCog
                                className="text-2xl"
                                style={{ color: "var(--main-heading)" }}
                            />
                            {!isCollapsed && (
                                <span className="ml-4">Settings</span>
                            )}
                        </button>
                    </li>
                    <li className="flex items-center pl-1 cursor-pointer rounded-md">
                        <button
                            id="theme-toggle-btn"
                            onClick={toggleDarkMode}
                            className="flex items-center rounded-md w-full"
                        >
                            <FaLightbulb
                                className="text-2xl"
                                style={{ color: "var(--main-heading)" }}
                            />
                            {!isCollapsed && (
                                <span className="ml-4">
                                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                                </span>
                            )}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;
