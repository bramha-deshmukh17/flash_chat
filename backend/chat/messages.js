const { UserChat } = require('../models/models');

const Messages = async (req, res) => {
    const { chatId } = req.params;
    try {
        // Fetch chat document
        const chat = await UserChat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Return only the messages array
        res.status(200).json(chat.chats);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { Messages };
