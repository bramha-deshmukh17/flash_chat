import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useTheme } from "../Theme/ThemeContext";
import { storage } from "../firebase"; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Simple date formatting component: DD/MM/YYYY
const FormatDate = ({ dateString }) => {
    const formattedDate = new Date(dateString).toLocaleDateString("en-GB");
    return <span>{formattedDate}</span>;
};

export const Profile = ({ userData, setUserData }) => {
    const URI = import.meta.env.VITE_API_URL;

    // Local state for edit mode and data
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        username: "",
        email: "",
    });
    const [validationError, setValidationError] = useState({});
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState("default.jpg");
    const [imageFile, setImageFile] = useState(null);

    const validateUserName = (username) => {

        if (username.length < 5 || username.length > 16) {
            setEditedData({ ...editedData, username: null });
            document.getElementById("username").style.borderColor = "red";
            setValidationError({
                ...validationError,
                username: "Username must be between 5 and 16 characters.",
            });
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setEditedData({ ...editedData, username: null });
            document.getElementById("username").style.borderColor = "red";
            setValidationError({
                ...validationError,
                username: "Username can only contain letters, numbers, and underscores.",
            });
        } else {
            setEditedData({ ...editedData, username: username });
            document.getElementById("username").style.borderColor = "var(--btn-color)";
            setValidationError({ ...validationError, username: null });
        }
    };
    const validateEmail = (email) => {

        if (!/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/.test(email)) {
            setEditedData({ ...editedData, email: null });
            document.getElementById("email").style.borderColor = "red";
            setValidationError({ ...validationError, email: "Invalid email address." });
        } else {
            setEditedData({ ...editedData, email: email });
            document.getElementById("email").style.borderColor = "var(--btn-color)";
            setValidationError({ ...validationError, email: null });
        }
    };

    // Update internal state when userData prop changes
    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            setEditedData({
                username: userData.username || "",
                email: userData.email || "",
            });
            setSelectedImage(userData.img_url || "default.jpg");
        }
    }, [userData]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            document.getElementById("username").style.borderColor = "var(--btn-color)";
            document.getElementById("email").style.borderColor = "var(--btn-color)";

            setValidationError((prev) => ({ ...prev, username: null, email: null }));
            setError(null);

            document.getElementById("username").value = userData.username;
            document.getElementById("email").value = userData.email;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData({ ...editedData, [name]: value });

        if (name === "username") validateUserName(value);
        if (name === "email") validateEmail(value);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
        }
    };

    const handleUpload = async () => {
        if (!imageFile) return alert("No image selected!");
        const imageRef = ref(storage, `user_images/${userData._id}/${imageFile.name}`);

        try {
            await uploadBytes(imageRef, imageFile);
            const downloadURL = await getDownloadURL(imageRef);
            setSelectedImage(downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image.");
            return null;
        }
    };

    const saveUserData = async () => {
        try {
            let imageURL = selectedImage;
            if (imageFile) {
                const uploadedURL = await handleUpload();
                if (uploadedURL) imageURL = uploadedURL;
            }

            await fetch(`${URI}update/profile`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: editedData.username,
                    email: editedData.email,
                    img_url: imageURL,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setUserData({
                            ...userData,
                            username: editedData.username,
                            email: editedData.email,
                            img_url: imageURL,
                        });
                        //setIsEditing(false);
                        window.location.reload();
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setError('An error occurred. Please try again later.');
                });

        } catch (error) {
            console.error("Error updating profile:", error.message);
        }
    };

    return (
        <div className="p-2 sm:p-5">
            <h1 className="head">Profile</h1>
            <div className="section-info grid grid-cols-1 sm:grid-cols-12 gap-6">
                {/* Left Column: Profile Image and Edit Icon */}
                <div className="sm:col-span-4 flex justify-center items-center relative mb-4 sm:mb-0">
                    <img
                        src={selectedImage}
                        alt="profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-600 object-cover"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                    />
                    {isEditing && (
                        <label
                            htmlFor="imageUpload"
                            className="absolute bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition"
                        >
                            <FaEdit size={18} />
                        </label>
                    )}
                </div>
                {/* Right Column: Profile Details */}
                <div className="sm:col-span-8">
                    <button
                        className={`me-2 mb-2 sm:me-5 px-4 py-2 ${isEditing
                                ? "bg-red-600 hover:bg-red-800"
                                : "bg-blue-600 hover:bg-blue-800"
                            } text-white rounded-md`}
                        onClick={handleEditToggle}
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                    {isEditing && (
                        <button
                            className="mb-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            onClick={saveUserData}
                        >
                            Save
                        </button>
                    )}
                    <h1 className="mt-4">Username:</h1>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={editedData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border p-2 rounded-md w-full sm:w-1/2"
                    /><br />
                    {validationError.username && <span className="text-red-500">{validationError.username}</span>}
                    <h1 className="mt-4">Email:</h1>
                    <input
                        type="email"
                        name="email"
                        id='email'
                        value={editedData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border p-2 rounded-md w-full sm:w-1/2"
                    /><br />
                    {validationError.email && <span className="text-red-500">{validationError.email}</span>}<br />
                    {error && <p className="text-red-500"> {error}</p>}<br />
                    <h1 className="mt-4">
                        Joined on: <FormatDate dateString={userData.createdAt} />
                    </h1>
                </div>
            </div>
        </div>
    );
};

export const Password = () => {
    const [password, setPassword] = useState({});
    const [validationError, setValidationError] = useState({});
    const [error, setError] = useState(null);
    const URI = import.meta.env.VITE_API_URL;

    const validatePassword = (e) => {
        let { name, value } = e.target;
        console.error(name,":",value);
        if(name!='cnfPassword'){
            if (value.length < 6 || value.length > 16) {
                e.target.style.borderColor = "red";
                setValidationError((prev) => ({
                    ...prev,
                    [name]: "Password must be between 6 and 16 characters.",
                }));
            } else if (!/^[a-zA-Z0-9_@#$%&*]+$/.test(value)) {
                e.target.style.borderColor = "red";
                setValidationError((prev) => ({
                    ...prev,
                    [name]: "Password can only contain letters, numbers, and special characters.",
                }));
            } else {
                setPassword((prev)=>({...prev, [name]:value}))
                e.target.style.borderColor = "var(--btn-color)";
                setValidationError((prev) => ({ ...prev, [name]: null })); // Remove error
            }
        }else{
            let newPassword = document.getElementById('newPassword').value;
            if(value===newPassword){
                setPassword((prev) => ({ ...prev, [name]: value }))
                setValidationError((prev)=>({...prev, cnfPassword:null}));
                e.target.style.borderColor = "var(--btn-color)";
            }else{
                e.target.style.borderColor = "red";
                setValidationError((prev) => ({ ...prev, cnfPassword: "Password don't match." }));
            }
        }
    };


    const handleSubmit = async (e) => {
        const URI = import.meta.env.VITE_API_URL;
        e.preventDefault(); // Prevent page refresh
        if (!password.oldPassword || !password.newPassword || !password.cnfPassword) {
            setError("All fields are required");
            return;
        }

        await fetch(`${URI}update/password`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                oldPassword: password.oldPassword,
                newPassword: password.newPassword,
                cnfPassword: password.cnfPassword,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    alert("Password updated successfully");
                    setError(null);
                    setPassword({});
                    window.location.reload();
                }
            })
            .catch((err) => {
                console.log(err);
                setError('An error occurred. Please try again later.');
            });
    }
    return (
        <div className="p-2 sm:p-5">
            <h1 className="head">Update Password</h1>
            <form onSubmit={handleSubmit}>
                <input type='password' name="oldPassword" onChange={validatePassword} className="w-full sm:w-1/2 mb-2" placeholder="Enter old password" /><br />
                {validationError.oldPassword && <span className="text-red-500">{validationError.oldPassword}</span>}<br />
                <input type='password' name="newPassword" id="newPassword" onChange={validatePassword} className="w-full sm:w-1/2 mb-2" placeholder="Enter New password" /><br />
                {validationError.newPassword && <span className="text-red-500">{validationError.newPassword}</span>}<br />
                <input type='password' name="cnfPassword" onChange={validatePassword} className="w-full sm:w-1/2 mb-2" placeholder="Confirm password" /><br />
                {validationError.cnfPassword && <span className="text-red-500">{validationError.cnfPassword}</span>}<br />
                {error && <><p className="text-red-500"> {error}</p><br /></>}
                <button type="submit" className="me-2 mt-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto">Update Password</button>
            </form>
        </div>
    );
};

export const Theme = () => {
    const { theme, toggleDarkMode } = useTheme();
    return (
        <div className="p-2 sm:p-5">
            <h1 className="head">Theme</h1><br/>
            <p>Switch between light and dark themes.</p><br/>
            <button
                onClick={toggleDarkMode}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
            >
                Toggle {theme === "dark" ? "Light" : "Dark"} Theme
            </button>
        </div>
    );
};

export const PrivacyPolicy = () => {
    return (
        <div className="p-2 sm:p-5 max-h-[70vh] overflow-y-auto rounded">
            <h1 className="head">Privacy Policy</h1>
            <div className="space-y-4 text-sm sm:text-base default">
                <p>
                    Thank you for using our chatting application. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
                </p>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>1. Information We Collect</h3>
                <h3 className="font-semibold">a. Personal Information</h3>
                <ul className="list-disc ml-6">
                    <li>Name, email address, and profile information</li>
                    <li>Any content you send or receive through chat (text, images, files)</li>
                </ul>
                <h3 className="font-semibold">b. Usage Data</h3>
                <ul className="list-disc ml-6">
                    <li>Timestamps of messages</li>
                    <li>Chat room IDs</li>
                    <li>Activity logs (login/logout, errors)</li>
                </ul>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>2. How We Use Your Information</h3>
                <p>
                    We use the collected data to:
                </p>
                <ul className="list-disc ml-6">
                    <li>Provide and maintain the chat service</li>
                    <li>Enable file sharing and media previews</li>
                    <li>Improve app performance and troubleshoot issues</li>
                    <li>Protect against fraud and abuse</li>
                </ul>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>3. File and Media Handling</h3>
                <p>
                    Files (including images and documents) shared through the chat are stored securely using <strong>Firebase Storage</strong>. We do not scan or analyze your private files or chats unless required for security or legal compliance.
                </p>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>4. Data Sharing</h3>
                <p>
                    We do <strong>not sell</strong> or share your personal data with third parties for marketing purposes. However, we may share limited information:
                </p>
                <ul className="list-disc ml-6">
                    <li>With service providers (e.g., Firebase, MongoDB Atlas) under strict data agreements</li>
                    <li>To comply with legal obligations or protect our rights</li>
                </ul>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>5. Cookies and Tracking</h3>
                <p>
                    We may use cookies or local storage to:
                </p>
                <ul className="list-disc ml-6">
                    <li>Keep you logged in</li>
                    <li>Remember chat preferences</li>
                    <li>Analyze app usage patterns</li>
                </ul>
                <p>
                    You can manage cookies in your browser settings.
                </p>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>6. Security</h3>
                <p>
                    We use encryption, secure connections (HTTPS), and authenticated access to protect your data. However, no method is 100% secure — use caution when sharing sensitive content.
                </p>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>7. Your Rights</h3>
                <p>
                    You can:
                </p>
                <ul className="list-disc ml-6">
                    <li>Request to access or delete your data</li>
                    <li>Contact us for privacy concerns at support@flashchat.com</li>
                </ul>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>8. Changes to This Policy</h3>
                <p>
                    We may update this policy occasionally. You’ll be notified of major changes via in-app alerts or email.
                </p>
                <hr />
                <h3 className="font-bold" style={{color:'var(--secondary-text)'}}>9. Contact</h3>
                <p>
                    If you have questions, contact us at:<br />
                    <strong>Email:</strong> support@flashchat.com<br />
                    <strong>Developer/Team:</strong> FlashChat Team
                </p>
                <hr />
                <p>Thank you for trusting us with your privacy.</p>
            </div>
        </div>
    );
};

export const Logout = () => {
    const URI = import.meta.env.VITE_API_URL;
    const logout = async (e) => {
        e.preventDefault();
        fetch(`${URI}logout`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) =>
                data.error ? console.error(data.error) : navigate("/login")
            )
            .catch((error) => console.error("Logout error:", error.message));
    };

    return (
        <form onSubmit={logout} className="p-4 flex justify-center">
            <button
                type='submit'
                className="bg-red-500 p-3 rounded text-white w-full sm:w-1/5"
            >
                Logout
            </button>
        </form>
    );
};