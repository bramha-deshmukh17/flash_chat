const { UserChat } = require("../models/models");
const mongoose = require("mongoose");

const CreateChat = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { otherUserId } = req.body;

    if (!otherUserId) {
        return res.status(400).json({ error: "Missing otherUserId" });
    }

    // Check if chat already exists
    let chat = await UserChat.findOne({
        $or: [
            { user1: userId, user2: otherUserId },
            { user1: otherUserId, user2: userId }
        ]
    });

    if (!chat) {
        chat = new UserChat({ user1: userId, user2: otherUserId });
        await chat.save();
    }

    res.status(200).json({ chatId: chat._id });
};

module.exports = { CreateChat };