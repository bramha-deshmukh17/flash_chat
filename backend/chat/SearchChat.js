const { User, UserChat } = require("../models/models");
const mongoose = require("mongoose");

const SearchChat = async (req, res) => {
    var search = req.query.query.trim(); // search query from the client side is stored in the search

    if (!search) {
        return res.status(400).json({ error: "Invalid search query." });
    }
    if (!req.user.userId) {
        return res.status(400).json({ error: "Unauthorized request" });
    }

    let loggedInUserId = new mongoose.Types.ObjectId(req.user.userId); // Convert loggedInUserId to ObjectId

    // Search for users by username, excluding the password field
    const usernameMatches = await User.find({
        username: { $regex: search, $options: "i" }, // Case-insensitive search
        _id: { $ne: loggedInUserId } // Exclude the logged-in user
    }).select("_id username bio img_url"); // Exclude password

    // Search for users by email, excluding the password field
    const emailMatches = await User.find({
        email: { $regex: search, $options: "i" }, // Case-insensitive search
        _id: { $ne: loggedInUserId } // Exclude the logged-in user
    }).select("_id email bio img_url"); // Exclude password

    // Combine results and extract unique IDs
    const allUsers = [...usernameMatches, ...emailMatches];
    const uniqueUserIds = [...new Set(allUsers.map(user => user._id.toString()))];

    // Ensure that uniqueUserIds are ObjectIds and not strings
    const objectIds = uniqueUserIds.map(id => new mongoose.Types.ObjectId(id));

    // Find chats for the matching user IDs
    const chats = await UserChat.aggregate([
        {
            $match: {
                $or: [
                    { user1: loggedInUserId, user2: { $in: objectIds } },
                    { user2: loggedInUserId, user1: { $in: objectIds } }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user1",
                foreignField: "_id",
                as: "user1Details"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user2",
                foreignField: "_id",
                as: "user2Details"
            }
        },
        {
            $project: {
                chatId: "$_id",
                userDetails: {
                    $cond: {
                        if: { $eq: ["$user1", loggedInUserId] },
                        then: { $arrayElemAt: ["$user2Details", 0] },
                        else: { $arrayElemAt: ["$user1Details", 0] }
                    }
                },
            }
        },
        {
            $project: {
                chatId: 1,
                userDetails: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    bio: 1,
                    img_url: 1,
                }
            }
        }
    ]);

    // Extract userDetails from chats
    const chatUserDetails = chats.map(chat => chat.userDetails);

    // Filter out emailMatches that have an active chat
    const chatsNotActiveByEmail = emailMatches.filter(item1 =>
        !chatUserDetails.some(item2 =>
            item2._id.toString() === item1._id.toString()
        )
    );

    // Filter out usernameMatches that have an active chat
    const chatsNotActiveByUsername = usernameMatches.filter(item1 =>
        !chatUserDetails.some(item2 =>
            item2._id.toString() === item1._id.toString()
        )
    );

    // Return the result with active chats and non-active matches
    res.status(200).json({
        chats: chats,
        emailMatches: chatsNotActiveByEmail,
        usernameMatches: chatsNotActiveByUsername,
    });
};

module.exports = { SearchChat };
