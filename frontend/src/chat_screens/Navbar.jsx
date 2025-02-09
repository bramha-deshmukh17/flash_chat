import { useState } from "react";
import { FaBars, FaHome, FaUser, FaCog, FaLightbulb, FaTimes } from "react-icons/fa";
import { useTheme } from "../Theme/ThemeContext";

const Sidebar = () => {
    const { theme, toggleDarkMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div 
            id="sidebar"
            className={`h-screen ${isCollapsed ? "w-16" : "w-64"} flex flex-col transition-all duration-300`}
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
                <button onClick={toggleSidebar} style={{ color: "var(--main-heading)" }}>
                    {isCollapsed ? (<FaBars />) : (<FaTimes />)}
                </button>
            </div>

            {/* Sidebar Content */}
            <nav className="flex-grow flex flex-col justify-end mt-auto ml-2 mr-2 mb-3">
                <ul className="space-y-4">
                    <li className="flex items-center p-2 cursor-pointer rounded-md">
                        <FaCog className="text-xl" style={{ color: "var(--main-heading)" }} />
                        {!isCollapsed && <span className="ml-4">Settings</span>}
                    </li>
                    <li className="flex items-center pl-1 cursor-pointer rounded-md">
                        <button
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

export default Sidebar;
