import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Profile, Password, Theme, PrivacyPolicy, Logout } from "./Sections";

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
        <div id='settings' className="p-4">
            <h2>Settings</h2>
            <div className="grid grid-cols-12 gap-4 m-5 p-5">
                {/* Left Menu */}
                <div className="col-span-4 p-3 left rounded-lg shadow-2xl">
                    <ul className="space-y-2 section-list">
                        {Object.keys(sectionContent).map((item) => (
                            <li
                                key={item}
                                className={`p-2 rounded-md `}
                                onClick={() => setSelectedSection(item)}
                                style={{ borderBottom: selectedSection === item ? "2px solid #bb872c" : "none"}}
                            >
                                {item}
                            </li>

                        ))}
                    </ul>
                </div>

                {/* Right Content */}
                <div className="col-span-8 p-3 right rounded-lg shadow-2xl">
                    {sectionContent[selectedSection]}
                </div>
            </div>


        </div>
    );
};

export default Setting;