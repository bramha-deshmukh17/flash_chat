const { User } = require("../models/models");
const mongoose = require("mongoose");

const UpdateProfile = async (req, res) => {
    const user = new mongoose.Types.ObjectId(req.user.userId);

    const { username, email, img_url } = req.body;

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

    try {

        const updatedUser = await User.findOneAndUpdate(
            { _id: user }, // Find user by ID
            { username, email, img_url }, // Fields to update
            { new: true, runValidators: true } // Return updated user & validate fields
        );

        if (!updatedUser) {
            console.log(updatedUser);
            return res.status(404).json({ error: "User not found.", userDetails: updatedUser, });
        }

        res.status(200).json({ message: "User profile updated successfully", userDetails: updatedUser });

    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Server error." });
    }
};

module.exports = { UpdateProfile };