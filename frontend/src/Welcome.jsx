import React from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from "./Theme/ThemeContext";
import { FaLightbulb } from "react-icons/fa";

const Welcome = () => {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const NODE_ENV = import.meta.env.VITE_NODE_ENV || "development"; // Add this line

    return (
        <div className="justify-items-center p-10" id='welcome'>
            <button onClick={toggleDarkMode} className='right-0' style={{ float: 'right' }}>
                {theme === "dark" ? (
                    <FaLightbulb className="p-2 rounded-full text-yellow-400 text-4xl hover:bg-gray-900" title="Light Mode" />
                ) : (
                    <FaLightbulb className="p-2 rounded-full text-black text-4xl hover:bg-gray-200" title="Dark Mode" />
                )}
            </button>
            <img className='top-5 object-center' src='logo.png' /><br />
            <h1 className='font-bold text-yellow-500'>Welcome to the Flash Chat!</h1>
            <h2>The fastest way to connect and share with your friends and loved ones.</h2><br />
            <ul>
                <li></li>
                <li>💬 Real-Time Messaging - Chat instantly with anyone, anywhere.</li>
                <li>📸 Media Sharing - Share photos and videos effortlessly.</li>
                <li>🔒 Secure Conversations - Your chats and media are safe with us.</li>
                <li>✨ Simple. Fast. Flashy.</li>
            </ul><br />

            <div className='flex justify-center items-center'>
                {
                    (NODE_ENV === "development") ?
                    <button className='p-3 pr-5 pl-5 text-lg rounded mr-5' style={{ backgroundColor: 'var(--btn-color)' }} onClick={() => { navigate("/register"); }}>Register</button>
                    : null
                }

                <button className='p-3 pr-5 pl-5 text-lg rounded mr-5' style={{ backgroundColor: 'var(--btn-two-color)' }} onClick={() => { navigate("/login"); }}>  &nbsp;Login&nbsp;</button>
            </div>
        </div>
    );
}

export default Welcome;