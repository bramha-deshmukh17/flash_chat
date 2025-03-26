import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FaUpload, FaImage, FaArrowRight, FaPaperPlane, FaArrowDown } from "react-icons/fa";
import FilePreview from "./FilePreview"; // Import our new component

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
    const [selectedFile, setSelectedFile] = useState(null);
    const [file, setFile] = useState(null);
    const [inputMessage, setInputMessage] = useState("");
    const [imageLoading, setImageLoading] = useState({});
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollableDivRef = useRef(null);

    const handleImageLoad = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };

    const handleImageError = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };

    // Scroll to the bottom when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch messages for the active chat
    useEffect(() => {
        if (!activeChat) return;
        fetch(`${URI}chats/${activeChat}/getmessages`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setMessages(data);
                else console.error("Unexpected response:", data);
            })
            .catch((error) => console.error("Chat Fetch Error:", error.message));
    }, [activeChat, URI]);

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
        socket.on("shareFile", handleMessage);
        return () => {
            socket.off("send", handleMessage);
            socket.off("shareFile", handleMessage);
        };
    }, []);

    // Send a text message
    const sendMessage = () => {
        if (inputMessage.trim()) {
            socket.emit("send", { chatId: activeChat, message: inputMessage });
            setInputMessage("");
        }
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    // Handle file selection and preview
    const handleFileChange = (event) => {
        const selected = event.target.files[0];
        if (selected) {
            if (selected.size > MAX_FILE_SIZE) {
                alert("File size exceeds 5MB. Please upload a smaller file.");
                return;
            }
            const fileUrl = URL.createObjectURL(selected);
            setSelectedFile(fileUrl);
            setFile(selected);
            console.log("File selected:", selected);
        }
    };

    // Handle file upload
    const sendFile = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result; // Do not remove prefix, backend will handle it
            console.log("File read as base64 string:", base64String);
            socket.emit("shareFile", {
                chatId: activeChat,
                message: inputMessage,
                file: file, // Send full Data URL
                mimeType: file.type,
            });
            setSelectedFile(null);
            setFile(null);
            setInputMessage("");
        };
        reader.readAsDataURL(file);
    };

    // Handle scroll to bottom
    const scrollToBottom = () => {
        let scrollableDiv = scrollableDivRef.current;
        if (scrollableDiv) {
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
    };

    // Show or hide scroll button based on scroll position
    const handleScroll = () => {
        let scrollableDiv = scrollableDivRef.current;
        if (scrollableDiv) {
            const isScrolledToBottom = scrollableDiv.scrollHeight - scrollableDiv.scrollTop <= scrollableDiv.clientHeight + 1;
            setShowScrollButton(!isScrolledToBottom);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden p-5" id="chat-window">
            <div className="flex-1 flex flex-col">
                {messages.length > 0 ? (
                    <div
                        className="messages-container p-4 overflow-y-scroll flex-1"
                        id="scrollableDiv"
                        ref={scrollableDivRef}
                        onScroll={handleScroll}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-bubble ${msg.by === activeUserId ? "my-message" : "other-message"}`}
                            >
                                {msg.file_Url ? (
                                    <FilePreview
                                        fileUrl={msg.file_Url}
                                        index={index}
                                        imageLoading={imageLoading}
                                        handleImageLoad={handleImageLoad}
                                        handleImageError={handleImageError}
                                    />
                                ) : null}
                                <p>{msg.message}</p>
                                <p className="date">{formatMessageDate(msg.date)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p></p>
                )}

                {selectedFile && (
                    <>
                        {file && file.type.startsWith("image/") ? (
                            <div className="flex flex-row items-center">
                                <img
                                    src={selectedFile}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-lg border-2 border-gray-400 object-cover"
                                />
                                <button
                                    className="ml-2 p-2 w-10 h-10 bg-green-500 text-white rounded"
                                    onClick={sendFile}
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-row items-center">
                                <p>{file.name}</p>
                                <button
                                    className="ml-2 p-2 w-10 h-10 bg-green-500 text-white rounded"
                                    onClick={sendFile}
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                    <button
                        className="fixed bottom-20 right-1/3  p-3 bg-blue-500 text-white rounded-full shadow-lg"
                        onClick={scrollToBottom}
                    >
                        <FaArrowDown />
                    </button>
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
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="pe-5 pt-3">
                        <label htmlFor="file-upload" className="hover:cursor-pointer">
                            <FaUpload />
                        </label>
                        <input id="file-upload" type="file" className="hidden" accept="application/pdf, text/plain" onChange={handleFileChange} />
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
