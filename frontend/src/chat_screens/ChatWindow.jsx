import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FaUpload, FaImage, FaArrowRight, FaPaperPlane } from "react-icons/fa";

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
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [inputMessage, setInputMessage] = useState("");

    //loading effect for images
    const [imageLoading, setImageLoading] = useState({}); // ✅ Store loading states here

    const handleImageLoad = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };

    const handleImageError = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };


    // Scroll to the bottom when messages update
    useEffect(() => {
        let scrollableDiv = document.getElementById("scrollableDiv");
        if (scrollableDiv) {
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
    }, [messages]);

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

    // Register WebSocket connection event
    useEffect(() => {
        const onConnect = () => console.log("Connected to WebSocket server!", socket.id);
        socket.on("connect", onConnect);
        return () => socket.off("connect", onConnect);
    }, []);

    // Join chat room when activeChat changes
    useEffect(() => {
        if (!activeChat) return;
        socket.emit("joinChat", activeChat);
    }, [activeChat]);

    // Listen for incoming messages
    useEffect(() => {
        const handleMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };

        socket.on("send", handleMessage);
        return () => socket.off("send", handleMessage);
    }, []);

    // Send a text message
    const sendMessage = () => {
        if (inputMessage.trim()) {
            socket.emit("send", { chatId: activeChat, message: inputMessage });
            setInputMessage(""); // Clear input after sending
        }
    };    

    // Handle image selection and preview
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); // Generate preview
            setSelectedImage(imageUrl);
            setImageFile(file);
        }
    };

    //handle image sharing
    useEffect(() => {
        const handleImageMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };

        socket.on("shareImage", handleImageMessage);
        return () => socket.off("shareImage", handleImageMessage);
    }, []);

    // Handle image upload
    const sendImage = async () => {
        imageFile.type;

        socket.emit("shareImage", { chatId: activeChat, message: inputMessage, photo: imageFile, mimeType:  imageFile.type, });
        setSelectedImage(null); // Clear the selected image after sending
        setImageFile(null);

    };

    return (
        <div className="flex h-screen overflow-hidden p-5" id="chat-window">
            <div className="flex-1 flex flex-col">
                <div className="messages-container p-4 overflow-y-scroll flex-1" id="scrollableDiv">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-bubble ${msg.by === activeUserId ? "my-message" : "other-message"}`}
                        >
                            {msg.photo_Url && (
                                <div>
                                    {imageLoading[index] !== false && (
                                        <p className="inset-0 flex items-center justify-center text-blue-500">Loading...</p>
                                    )}
                                    <img
                                        src={msg.photo_Url}
                                        alt="Loading..."
                                        className={`w-full h-full object-cover rounded-lg ${imageLoading[index] === false ? "block" : "hidden"}`}
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                    />
                                </div>
                            )}
                            <p>{msg.message}</p>
                            <p className="date">{formatMessageDate(msg.date)}</p>
                        </div>
                    ))}
                </div>


                {selectedImage && (
                    <div className="flex flex-row">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="w-32 h-32 rounded-lg border-2 border-gray-400 object-cover"
                        />
                        <button
                            className="ml-2 p-2 mb-0 w-10 h-10 bg-green-500 text-white rounded"
                            onClick={sendImage}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                )}
                {/* Input Section */}
                <div className={`p-4 pb-5 mb-5 border-t flex ${activeChat ? "" : "hidden"}`}>

                    {/* Image Upload Section */}
                    <div className="pe-5 pt-3">
                        <label htmlFor="img-upload" className="hover:cursor-pointer">
                            <FaImage />
                        </label>
                        <input
                            id="img-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="pe-5 pt-3">
                        <label htmlFor="file-upload" className="hover:cursor-pointer">
                            <FaUpload />
                        </label>
                        <input id="file-upload" type="file" className="hidden" accept="application/pdf, text/plain" />
                    </div>

                    {/* Message Input */}
                    <input
                        type="text"
                        className="flex-1 border p-2 rounded"
                        placeholder="Enter a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage();
                        }}
                        style={{ backgroundColor: "var(--bg-color)" }}
                    />

                    {/* Send Button */}
                    <button className="ml-3 ps-3 pe-3 bg-blue-500 text-white rounded" onClick={sendMessage}>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
