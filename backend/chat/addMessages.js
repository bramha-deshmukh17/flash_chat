const { UserChat } = require("../models/models");

const AddMessages = async ({ chatId, message, senderId, fileUrl = null }) => {
    try {
        const chat = await UserChat.findById(chatId);
        if (!chat) {
            console.error("❌ Chat not found:", chatId);
            return { error: "Chat not found." };
        }

        // Ensure sender is a participant
        if (!chat.user1.equals(senderId) && !chat.user2.equals(senderId)) {
            console.error("⛔ Unauthorized: User not a participant", senderId);
            return { error: "You are not a participant in this chat." };
        }

        // Create the message object
        const newMessage = {
            message: message,
            by: senderId,
            file_Url: fileUrl,
        };

        // Push and save the message
        chat.chats.push(newMessage);
        await chat.save();


        return { success: true, message: newMessage };
    } catch (error) {
        return { error: "Internal server error." };
    }
};

module.exports = { AddMessages };
