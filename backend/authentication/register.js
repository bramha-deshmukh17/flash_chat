const bcrypt = require("bcrypt");
const { User } = require("../models/models");

const RegisterUser = async (req, res) => {

    const { username, email, password, confirmPassword } = req.body;

    // Validate username
    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }
    if (username.length < 5 || username.length > 16) {
        return res
            .status(400)
            .json({ error: "Username must be between 5 and 16 characters." });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
            error: "Username can only contain letters, numbers, and underscores.",
        });
    }

    // Validate email
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }
    const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    // Validate password
    if (!password) {
        return res.status(400).json({ error: "Password is required." });
    }
    if (password.length < 6 || password.length > 16) {
        return res
            .status(400)
            .json({ error: "Password must be between 6 and 16 characters." });
    }
    const passwordRegex = /^[a-zA-Z0-9_@#$%&*]+$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error:
                "Password can only contain letters, numbers, special characters, and underscores.",
        });
    }

    // Validate confirm password
    if (!confirmPassword) {
        return res.status(400).json({ error: "Confirm password is required." });
    }
    if (confirmPassword !== password) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user to MongoDB
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Send the response after successful user creation
        return res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        // Handle errors
        if (err.code === 11000) {
            console.error("Error saving user:", err);
            return res.status(400).json({ error: "Username or email already exists." });
        } else {
            console.error("Error saving user:", err);
            return res.status(500).json({ error: "Server error." });
        }
    }
};


module.exports = { RegisterUser };