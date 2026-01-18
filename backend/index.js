const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { RegisterUser } = require('./authentication/register');
const { LoginUser } = require('./authentication/login');
const { limiter } = require('./authentication/limiter');
const { authenticateToken } = require('./authentication/middleWare');
const { LoginCheck } = require('./authentication/LoginCheck');
const { SearchChat } = require('./chat/SearchChat');
const { ChatList } = require('./chat/ChatList');
const { Messages } = require('./chat/messages');
const { AddMessages } = require('./chat/addMessages');
const { UploadDocument } = require('./chat/uploadDoc');
const { Setting } = require('./setting/setting');
const { UpdateProfile } = require('./setting/updateProfile');
const { UpdatePassword } = require('./setting/updatePassword');
const { CreateChat } = require('./chat/createChat');
const path = require('path');

dotenv.config();

// MongoDB Atlas Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// App and Server Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB (adjust as needed)
    cors: {
        origin: process.env.FRONTEND_URL, // Allow frontend origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
        credentials: true, // Allow credentials (cookies, Authorization headers)
    }
});

const corsOptions = {
    origin: process.env.FRONTEND_URL, // Allow requests from React frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed request methods
    credentials: true, // Allow cookies and authentication headers
};

// CORS and Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Socket.io Handling
io.on("connection", (socket) => {

    let senderId;

    // Extract cookies from WebSocket handshake request
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies.authToken;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                senderId = decoded.userId; // Extract sender ID from JWT
            } catch (err) {
                console.error("Invalid Token:", err.message);
                socket.emit("error", { error: "Invalid Token" });
                socket.disconnect();
                return;
            }
        } else {
            console.error("No Token Provided");
            socket.emit("error", { error: "No Token Provided" });
            socket.disconnect();
            return;
        }
    } else {
        console.error("No Cookies Found");
        socket.emit("error", { error: "No Cookies Found" });
        socket.disconnect();
        return;
    }

    // Join chat room
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
    });

    // Handle sending messages
    socket.on("send", ({ chatId, message }) => {
        const by = senderId;
        io.to(chatId).emit("send", {
            message: { message, by, file_url: null, date: new Date().toISOString() },
        });

        // Save message in background
        AddMessages({ chatId, message, senderId }).catch((err) => {
            console.error("DB write failed:", err);
            socket.emit("error", { error: "Message not saved to DB" });
        });
    });


    // Handle image sharing
    socket.on("shareFile", async ({ chatId, message = null, file, mimeType }) => {
        const fileUrl = await UploadDocument(file, chatId, mimeType);

        if (fileUrl.success) {
            const by = senderId;
            const payload = {
                message,
                by,
                file_Url: fileUrl.message,
                date: new Date().toISOString(),
            };

            // Emit immediately for instant feedback
            io.to(chatId).emit("shareFile", { message: payload });

            // Save to DB in background
            AddMessages({
                chatId,
                message,
                senderId,
                fileUrl: fileUrl.message,
            }).catch((err) => {
                console.error("Error saving shared file message:", err);
                socket.emit("error", { error: "Shared file message not saved to DB" });
            });

        } else {
            console.error("Error uploading file:", fileUrl.error);
            socket.emit("error", { error: "File upload failed" });
        }
    });


    // Handle disconnect
    socket.on("disconnect", (reason) => {
        console.log(`Client disconnected`);
    });

    // Handle transport error
    socket.on("connect_error", (error) => {
        console.error(`Connection error: ${error.message}`);
    });
});

// Routes
app.post('/user/register', RegisterUser);
app.get('/user/login/check', authenticateToken, LoginCheck);
app.post('/user/login', limiter, LoginUser);
app.post('/logout', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        }).status(200).json({ message: 'Logged out successfully' });
    } else {
        res.clearCookie('authToken').status(200).json({ message: 'Logged out successfully' });
    }
});

app.get('/chats', authenticateToken, ChatList);
app.get('/chats/search', authenticateToken, SearchChat);
app.get('/chats/:chatId/getmessages', authenticateToken, Messages);
app.post('/chats/:chatId/sendimage', authenticateToken, UploadDocument);
app.post('/chats/create', authenticateToken, CreateChat);


app.get('/settings', authenticateToken, Setting);
app.post('/update/profile', authenticateToken, UpdateProfile);
app.post('/update/password', authenticateToken, UpdatePassword);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
