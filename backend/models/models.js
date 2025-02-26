const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    img_url: { type: String, default:'default.jpg' },
    bio: { type: String, required: false },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema({
    message: { type: String, required: false },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    photo_Url: { type: String, required: false }, // Optional image URL
    date: { type: Date, default: Date.now } // Default to current date
}); 

const userChatsSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: {
        type: Date,
        default: Date.now,  // ✅ Ensure it defaults to a valid JavaScript Date
        set: (val) => val instanceof Date ? val : new Date(val) // ✅ Force conversion to Date
    },
    chats: { type: [messageSchema], default: [] }
});


const UserChat = mongoose.model("UserChat", userChatsSchema);

module.exports = { User, UserChat };
