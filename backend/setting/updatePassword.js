const bcrypt = require("bcrypt");
const { User } = require("../models/models");
const mongoose = require("mongoose");

const UpdatePassword = async (req, res) => {
    const user = new mongoose.Types.ObjectId(req.user.userId);

    const { oldPassword, newPassword, cnfPassword } = req.body;

    const passwordRegex = /^[a-zA-Z0-9_@#$%&*]+$/;
    // Validate old password
    if (!oldPassword) {
        return res.status(400).json({ error: "Password is required." });
    }
    if (oldPassword.length < 6 || oldPassword.length > 16) {
        return res
            .status(400)
            .json({ error: "Password must be between 6 and 16 characters." });
    }
    if (!passwordRegex.test(oldPassword)) {
        return res.status(400).json({
            error:
                "Password can only contain letters, numbers, special characters, and underscores.",
        });
    }

    //validat new password
    if (!newPassword) {
        return res.status(400).json({ error: "New Password is required." });
    }
    if (newPassword.length < 6 || newPassword.length > 16) {
        return res
            .status(400)
            .json({ error: "Password must be between 6 and 16 characters." });
    }
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            error:
                "Password can only contain letters, numbers, special characters, and underscores.",
        });
    }

    //validate confirm password
    if (!cnfPassword) {
        return res.status(400).json({ error: "Confirm password is required." });
    }
    if (cnfPassword !== newPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {

        // Check if user exists
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Validate old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Old password is incorrect." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ error: "Server error." });
    }

};

module.exports = { UpdatePassword };