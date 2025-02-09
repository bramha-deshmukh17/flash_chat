const {UserChat} = require('../models/models');
const mongoose = require("mongoose");

const ChatList = async (req, res) => {
    try {
        // Get the logged-in user's ID
        const loggedInUserId = new mongoose.Types.ObjectId(req.user.userId);

        // Fetch chats where the logged-in user is either user1 or user2
        const chats = await UserChat.aggregate([
            {
                $match: {
                    $or: [
                        { user1: loggedInUserId },
                        { user2: loggedInUserId }
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

        // Return the fetched chats along with user details
        res.status(200).json({
            message: 'Chats fetched successfully!',
            chats: chats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { ChatList };