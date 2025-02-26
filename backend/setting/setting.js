const { User } = require("../models/models");
const mongoose = require("mongoose");

const Setting = async (req, res) => {
    const user = new mongoose.Types.ObjectId(req.user.userId);

    try {
        const userData = await User.findById({ _id: user }, { _id:1, username: 1, email: 1, createdAt: 1, img_url:1 });
        
        res.status(200).json({ message: "User details found!", userDetails: userData });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Server error." });
    }
};

module.exports = { Setting };