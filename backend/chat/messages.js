const { UserChat } = require('../models/models');
const mongoose = require('mongoose');

const Messages = async (req, res) => {
    const { chatId } = req.params;
    const { section = 1, limit = 10 } = req.query;
    
    try {
        const chatDoc = await UserChat.findById( new mongoose.Types.ObjectId(chatId) );

        if (!chatDoc) {
            return res.status(404).json({ error: "Chat not found or no messages available" });
        }

        // Reverse to get newest messages last
        const allMessages = [...chatDoc.chats].reverse();

        const start = (section - 1) * limit;
        const end = start + Number(limit);
        const paginatedMessages = allMessages.slice(start, end);

        res.status(200).json(paginatedMessages.reverse()); // Reverse again to show oldest first
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { Messages };
