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
        <div className="p-5">
            <h1 className="head">Profile</h1>
            <div className="section-info grid grid-cols-12 gap-6">
                {/* Left Column: Profile Image and Edit Icon */}
                <div className="col-span-4 flex justify-center items-center relative">
                    <img
                        src={selectedImage}
                        alt="profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-600 object-cover"
                    />
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                    />
                    {/* Show edit icon only when in editing mode */}
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
                <div className="col-span-8">
                    {/* Toggle Edit Mode Button */}
                    <button
                        className="me-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={handleEditToggle}
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                    {/* Save Button, visible only in editing mode */}
                    {isEditing && (
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            onClick={saveUserData}
                        >
                            Save
                        </button>
                    )}
                    {/* Username */}
                    <h1 className="mt-4">Username:</h1>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={editedData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border p-2 rounded-md w-1/2"
                    /><br />
                    {validationError.username && <span className="text-red-500">{validationError.username}</span>}

                    {/* Email */}
                    <h1 className="mt-4">Email:</h1>
                    <input
                        type="email"
                        name="email"
                        id='email'
                        value={editedData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border p-2 rounded-md w-1/2"
                    /><br />
                    {validationError.email && <span className="text-red-500">{validationError.email}</span>}<br />
                    {error && <p className="text-red-500"> {error}</p>}<br />
                    {/* Joined Date */}
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
        <div className="p-5">
            <h1 className="head">Update Password</h1>
            <form onSubmit={handleSubmit}>
                <input type='password' name="oldPassword" onChange={validatePassword} className="w-1/2" placeholder="Enter old password" /><br />
                {validationError.oldPassword && <span className="text-red-500">{validationError.oldPassword}</span>}<br />
                <input type='password' name="newPassword" id="newPassword" onChange={validatePassword} className="w-1/2" placeholder="Enter New password" /><br />
                {validationError.newPassword && <span className="text-red-500">{validationError.newPassword}</span>}<br />
                <input type='password' name="cnfPassword" onChange={validatePassword} className="w-1/2" placeholder="Confirm password" /><br />
                {validationError.cnfPassword && <span className="text-red-500">{validationError.cnfPassword}</span>}<br />
                {error && <><p className="text-red-500"> {error}</p><br /></>}
                <button type="submit" className="me-5 mt-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Password</button>
            </form>
        </div>
    );

};

export const Theme = () => {

    const { theme, toggleDarkMode } = useTheme();
    return (
        <div>
            <h1 className="head">Theme</h1><br/>
            <p>Switch between light and dark themes.</p><br/>
            <button onClick={toggleDarkMode} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">  Toggle Dark Mode</button>
        </div>
    );
};

export const PrivacyPolicy = () => {

    return (
        <div>
            <h1 className="head">Privacy Policy</h1>
            <p>Read our privacy policy here.</p>
        </div>
    );

};

export const Logout = () => {
    const URI = import.meta.env.VITE_API_URL;
    const logout = async () => {
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
        <form onSubmit={logout} className="p-4">
            <button type='submit' className="bg-red-500 p-3 rounded text-white" style={{ width: '17%' }}>Logout</button>
            
        </form>

    );

};