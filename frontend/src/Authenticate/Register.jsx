import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Theme/ThemeContext";
import { FaLightbulb, FaEyeSlash, FaEye } from "react-icons/fa";

// Simple circular spinner component
const Spinner = () => (
    <div className="flex justify-center items-center my-1">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
    </div>
);

const Register = () => {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_API_URL;

    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [validationError, setValidationError] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateUserName = (e) => {
        let username = e.target.value;
        if (username.length < 5 || username.length > 16) {
            setUsername(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                username: "Username must be between 5 and 16 characters.",
            }));
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsername(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                username: "Username can only contain letters, numbers, and underscores.",
            }));
        } else {
            setUsername(username);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, username: null }));
        }
    };

    const validateEmail = (e) => {
        let email = e.target.value;
        if (!/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/.test(email)) {
            setEmail(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({ ...prev, email: "Invalid email address." }));
        } else {
            setEmail(email);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, email: null }));
        }
    };

    const validatePassword = (e) => {
        let password = e.target.value;
        if (password.length < 6 || password.length > 16) {
            setPassword(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                password: "Password must be between 6 and 16 characters.",
            }));
        } else if (!/^[a-zA-Z0-9_@#$%&*]+$/.test(password)) {
            setPassword(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                password: "Password can only contain letters, numbers, and special characters.",
            }));
        } else {
            setPassword(password);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, password: null }));
        }
    };

    const validateConfirmPassword = (e) => {
        if (e.target.value !== password) {
            setConfirmPassword(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match.",
            }));
        } else {
            setConfirmPassword(e.target.value);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, confirmPassword: null }));
        }
    };

    const showPassword = () => setShowPass((prev) => !prev);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && email && password && confirmPassword) {
            setLoading(true);
            fetch(`${URI}user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, confirmPassword }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setLoading(false);
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setError(null);
                        alert(data.message);
                        navigate('/login');
                    }
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err);
                    setError('An error occurred. Please try again later.');
                });
        }
    }

    return (
        <div className="justify-items-center" id="register">
            <button onClick={toggleDarkMode} className="right-0 translate-y-10 -translate-x-10" style={{ float: 'right' }}>
                {theme === "dark" ? (
                    <FaLightbulb className="p-2 rounded-full text-yellow-400 text-4xl hover:bg-gray-900" title="Light Mode" />
                ) : (
                    <FaLightbulb className="p-2 rounded-full text-black text-4xl hover:bg-gray-200" title="Dark Mode" />
                )}
            </button>
            <img className="top-5 object-center" src="logo.png" /><br />
            <h1 className="font-bold text-yellow-500 pb-6">Register for Flash Chat!</h1>
            <form onSubmit={handleSubmit} className="w-full flex flex-col justify-items-center">

                <input
                    type="text"
                    id="username"
                    placeholder="Username*"
                    className="bg-gray-600 p-3 rounded text-white"
                    style={{ minWidth: '25%' }}
                    onChange={validateUserName}
                    required
                />
                {validationError.username && <span className="text-red-500">{validationError.username}</span>}
                <br />
                <input
                    type="email"
                    id="email"
                    placeholder="Email*"
                    className="bg-gray-600 p-3 rounded text-white"
                    style={{ minWidth: '25%' }}
                    onChange={validateEmail}
                    required
                />
                {validationError.email && <span className="text-red-500">{validationError.email}</span>}
                <br />

                <div className="relative " style={{ minWidth: '25%' }}>
                    <input
                        type={showPass ? "text" : "password"}
                        id="password"
                        placeholder="Password*"
                        className="bg-gray-600 p-3 rounded text-white w-full"
                        onChange={validatePassword}
                        required
                    />
                    <button
                        type="button"
                        onClick={showPassword}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3"
                        style={{ background: 'none', border: 'none', outline: 'none' }}
                        tabIndex={-1}
                    >
                        {showPass ? (
                            <FaEye className="text-white" />
                        ) : (
                            <FaEyeSlash className="text-white" />
                        )}
                    </button>
                </div>
                {validationError.password && <span className="text-red-500">{validationError.password}</span>}
                <br />
                <input
                    type="password"
                    id="confirms_password"
                    placeholder="Confirm Password*"
                    className="bg-gray-600 p-3 rounded text-white"
                    style={{ minWidth: '25%' }}
                    onChange={validateConfirmPassword}
                    required
                />
                {validationError.confirmPassword && <span className="text-red-500">{validationError.confirmPassword}</span>}
                <br />
                {error && <p className="text-red-500"> {error}</p>}<br />
                <button type='submit' className="bg-yellow-500 p-3 rounded text-white" style={{ width: '20%' }} disabled={loading}>
                    {loading ? <Spinner /> : "Register"}
                </button>
            </form>
        </div>
    );
}

export default Register;
