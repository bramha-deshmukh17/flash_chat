import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create the socket instance outside the component (shared across renders)
const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 50,
    reconnectionDelay: 2000,
});

const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const ChatWindow = ({ activeChat, activeUserId }) => {
    const URI = import.meta.env.VITE_API_URL;
    const [messages, setMessages] = useState([]);
    // Function to scroll to the bottom of the chat window
    useEffect(() => {
        function scrollToBottom() {
            // Get the scrollable div element
            let scrollableDiv =
                document.getElementById('scrollableDiv');
            scrollableDiv.scrollTop = scrollableDiv
                .scrollHeight;
        }
        scrollToBottom();
    },[messages]);
    
    // Fetch messages for the active chat
    useEffect(() => {
        if (!activeChat) return;
        fetch(`${URI}chats/${activeChat}/getmessages`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setMessages(data))
            .catch((error) => console.error("Chat Fetch Error:", error.message));
    }, [activeChat]);

    // Register the connect event only once
    useEffect(() => {
        const onConnect = () => {
            console.log("Connected to WebSocket server!", socket.id);
        };

        socket.on("connect", onConnect);
        return () => {
            socket.off("connect", onConnect);
        };
    }, []);

    // When activeChat changes, join the chat room
    useEffect(() => {
        if (!activeChat) return;
        socket.emit("joinChat", activeChat);
    }, [activeChat]);

    // Handle incoming messages from WebSocket (register once)
    useEffect(() => {
        const handleMessage = (data) => {
            // Expecting data.message to be an object like { message, by, photo_Url, date }
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };

        socket.on("send", handleMessage);
        return () => {
            socket.off("send", handleMessage);
        };
    }, []);

    // Function to send a message via WebSocket
    function sendMessage(message) {
        if (message.trim()) {
            socket.emit("send", { chatId: activeChat, message });
        }
    }

    return (
        <div className="flex h-screen overflow-hidden p-5" id="chat-window">
            <div className="flex-1 flex flex-col">
                <div className="messages-container p-4 overflow-y-scroll" id="scrollableDiv">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.by === activeUserId ? "my-message" : "other-message"}`}>
                            <p>{msg.message}</p>
                            <p className="date">{formatMessageDate(msg.date)}</p>
                        </div>
                    ))}
                </div>
                <div className={`p-4 mb-5 border-t flex ${activeChat ? "" : 'hidden'}`}>
                    <input
                        type="text"
                        className="flex-1 border p-2 rounded"
                        placeholder="Enter a message..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage(e.target.value);
                                e.target.value = "";
                            }
                        }}
                        style={{ backgroundColor: "var(--bg-color)" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
