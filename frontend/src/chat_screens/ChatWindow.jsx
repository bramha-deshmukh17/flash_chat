import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,          // ✅ Enable automatic reconnection
    reconnectionAttempts: 50,     // ✅ Retry up to 5 times
    reconnectionDelay: 2000,      // ✅ Wait 2 seconds before retryin
});

const ChatWindow = ({ activeChat }) => {
    const URI = import.meta.env.VITE_API_URL;
    const [messages, setMessages] = useState([]);

    // Join chat room when activeChat changes
    useEffect(() => {
        if (!activeChat) return;
        socket.emit("joinChat", activeChat);
        console.log(`📌 Joined chat room: ${activeChat}`);
    }, [activeChat]);

    // Fetch messages for active chat
    useEffect(() => {
        if (!activeChat) return;

        fetch(`${URI}chats/${activeChat}/getmessages`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setMessages(data))
            .catch((error) => console.error("Chat Fetch Error:", error.message));

    }, [activeChat, URI]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Connected to WebSocket server!", socket.id);
        });

    
    }, [activeChat]);

    // Handle incoming messages from WebSocket
    useEffect(() => {
        const handleMessage = (data) => {
            console.log("📩 Received message:", data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };

        socket.on("send", handleMessage);

        return () => {
            socket.off("send", handleMessage);
        };
    }, [messages]);

    function sendMessage(message) {
        if (message.trim()) {
            console.log("🚀 Sending message:", message);
            socket.emit("send", { chatId: activeChat, message });
        }
    }

    return (
        <div className="flex h-screen p-5">
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <p>{msg.message}</p>
                            
                        </div>
                    ))}


                </div>

                <div className="p-4 border-t flex">
                    <input
                        type="text"
                        className="flex-1 border p-2 rounded"
                        placeholder="Type a message..."
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
