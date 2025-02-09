const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie"); // ✅ Import this for WebSocket cookie parsing
const { RegisterUser } = require('./authentication/register');
const { LoginUser } = require('./authentication/login');
const { limiter } = require('./authentication/limiter');
const { authenticateToken } = require('./authentication/middleWare');
const { LoginCheck } = require('./authentication/LoginCheck');
const { SearchChat } = require('./chat/SearchChat');
const { ChatList } = require('./chat/ChatList');
const { Messages } = require('./chat/messages');
const { AddMessages } = require('./chat/addMessages');

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

// Socket.io Handling
io.on("connection", (socket) => {
    console.log(`🔌 New Client Connected: ${socket.id}`);

    let senderId;

    // Extract cookies from WebSocket handshake request
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
        const parsedCookies = cookie.parse(cookies); // ✅ Corrected WebSocket cookie parsing
        const token = parsedCookies.authToken; // Assuming JWT is stored in HttpOnly cookie "authToken"

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                senderId = decoded.userId; // Extract sender ID from JWT
                console.log(`🔑 User Authenticated: ${senderId}`);
            } catch (err) {
                console.error("❌ Invalid Token:", err.message);
                socket.disconnect();
                return;
            }
        } else {
            console.error("❌ No Token Provided");
            socket.disconnect();
            return;
        }
    } else {
        console.error("❌ No Cookies Found");
        socket.disconnect();
        return;
    }

    // Join chat room
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`📌 User ${senderId} joined chat room: ${chatId}`);
    });

    // Handle sending messages
    socket.on("send", async ({ chatId, message }) => {
        console.log(`📩 Message in chat ${chatId} from ${senderId}:`, message);

        const result = await AddMessages({ chatId, message, senderId });

        if (result.success) {
            io.to(chatId).emit("send", { message: {message, senderId, photo_Url: null} });
        } else {
            socket.emit("error", { error: result.error });
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// Routes
app.post('/user/register', RegisterUser);
app.get('/user/login/check', authenticateToken, LoginCheck);
app.post('/user/login', limiter, LoginUser);
app.post('/logout', (req, res) => {
    res.clearCookie('authToken').status(200).json({ message: 'Logged out successfully' });
});

app.get('/chats', authenticateToken, ChatList);
app.get('/chats/search', authenticateToken, SearchChat);
app.get('/chats/:chatId/getmessages', authenticateToken, Messages);

// Start the Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
