import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="mb-6">Sorry, the page you are looking for does not exist.</p>
            <button
                className="bg-yellow-500 px-4 py-2 rounded text-black font-semibold"
                onClick={() => navigate("/")}
            >
                Go Home
            </button>
        </div>
    );
};

export default NotFound;