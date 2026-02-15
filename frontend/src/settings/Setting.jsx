import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Profile, Password, Theme, PrivacyPolicy, Logout } from "./Sections";
import { FaArrowLeft } from "react-icons/fa";

const Setting = () => {
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_API_URL;

    const [userData, setUserData] = useState({});

    // Fetch user data
    useEffect(() => {
        fetch(`${URI}settings`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => { data.error ? navigate("/login") : setUserData(data.userDetails); })
            .catch((error) => console.error("Validation error:", error.message));
    }, [navigate, URI]);

    const [selectedSection, setSelectedSection] = useState("Profile");

    // Content for each section
    const sectionContent = {
        Profile: <Profile userData={userData} setUserData={setUserData} />,
        Password: <Password />,
        Theme: <Theme />,
        "Privacy Policy": <PrivacyPolicy />,
        Logout: <Logout />,
    };

    return (
        <div id='settings' className="p-2 sm:p-4">
            <div className="flex items-center mb-2 sm:mb-4">
                <button
                id="chats-screen-btn"
                    className="mr-3 ml-5 px-3 py-1 rounded boldtext-sm sm:text-base"
                    onClick={() => navigate("/chats")}
                >
                    <FaArrowLeft title="Back"/>
                </button>
                <h2 className="text-xl font-bold">Settings</h2>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 m-1 sm:m-5 p-1 sm:p-5">
                {/* Left Menu */}
                <div className="sm:col-span-4 mb-2 sm:mb-0 p-2 sm:p-3 left rounded-lg shadow-2xl">
                    <ul className="flex sm:block flex-row sm:flex-col space-x-2 sm:space-x-0 space-y-0 sm:space-y-2 section-list overflow-x-auto">
                        {Object.keys(sectionContent).map((item) => (
                            <li
                                key={item}
                                id={`${item.toLowerCase()}-section-btn`}
                                className={`p-2 rounded-md cursor-pointer whitespace-nowrap`}
                                onClick={() => setSelectedSection(item)}
                                style={{
                                    borderBottom: selectedSection === item ? "2px solid #bb872c" : "none"
                                }}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Content */}
                <div className="sm:col-span-8 p-2 sm:p-3 right rounded-lg shadow-2xl">
                    {sectionContent[selectedSection]}
                </div>
            </div>
        </div>
    );
};

export default Setting;