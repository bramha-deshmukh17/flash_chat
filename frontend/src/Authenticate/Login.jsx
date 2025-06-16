import { useState, useEffect } from "react";
import { FaLightbulb, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../Theme/ThemeContext';
import { useNavigate } from "react-router-dom";

const Login = () => {

    const URI = import.meta.env.VITE_API_URL;
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [validationError, setValidationError] = useState({});
    const [error, setError] = useState(null);

    //Check for user session
    useEffect(() => {
        fetch(`${URI}user/login/check`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        })
            .then((res) => res.json())
            .then((data) => data.error ? navigate('/login') : navigate('/chats'))
            .catch((err) => {
                console.error(err);
            });
    }, [navigate]);


    const validateUsername = (e) => {
        let username = e.target.value;
        if (username.length < 5 || username.length > 16) {
            setUsername(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                username: "Username must be between 5 and 16 characters."
            }));
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsername(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                username: "Username can only contain letters, numbers, and underscores."
            }));
        } else {
            setUsername(username);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, username: null }));
        }
    };

    const validatePassword = (e) => {
        let password = e.target.value;
        if (password.length < 6 || password.length > 16) {
            setPassword(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                password: "Password must be between 6 and 16 characters."
            }));
        } else if (!/^[a-zA-Z0-9_@#$%&*]+$/.test(password)) {
            setPassword(null);
            e.target.style.borderColor = "red";
            setValidationError((prev) => ({
                ...prev,
                password: "Password can only contain letters, numbers, and special characters (@, #, $, %, &, *)."
            }));
        } else {
            setPassword(password);
            e.target.style.borderColor = "var(--btn-color)";
            setValidationError((prev) => ({ ...prev, password: null }));
        }
    };

    const showPassword = () => {
        setShowPass((prev) => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            fetch(`${URI}user/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })
                .then((res) => res.json())
                .then((data) => data.error ? setError(data.error) : navigate('/chats'))
                .catch((err) => {
                    console.error(err);
                    setError('An error occurred. Please try again later.');
                });
        }
    };

    return (
        <div className="justify-items-center" id="login">
            <button onClick={toggleDarkMode} className="right-0 translate-y-10 -translate-x-10" style={{ float: 'right', }}>
                {theme === "dark" ? (
                    <FaLightbulb className="p-2 rounded-full text-yellow-400 text-4xl hover:bg-gray-900" title="Light Mode" />
                ) : (
                    <FaLightbulb className="p-2 rounded-full text-black text-4xl hover:bg-gray-200" title="Dark Mode" />
                )}
            </button>

            <img className="top-5 object-center" src="logo.png" /><br />
            <h1 className="font-bold text-yellow-500 pb-6">Login to Flash Chat!</h1>
            <form onSubmit={handleSubmit} className="w-full flex flex-col justify-items-center" style={{ alignItems: 'center', overflowX: 'hidden' }}>
                <input
                    type="text"
                    id="username"
                    placeholder="Username*"
                    className="bg-gray-600 p-3 rounded text-white"
                    style={{ minWidth: '25%' }}
                    onChange={validateUsername}
                    required
                />
                {validationError.username && <span className="text-red-500">{validationError.username}</span>}
                <br />
                <div className="relative" style={{ minWidth: '25%' }}>
                    <input
                        type={showPass ? "text" : "password"} // Toggle input type
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
                {error && <p className="text-red-500">{error}</p>}
                <button type='submit' className="bg-yellow-500 p-3 rounded text-white" style={{ minWidth: '20%' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;
