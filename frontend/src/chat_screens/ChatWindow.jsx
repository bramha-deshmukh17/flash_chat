import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FaUpload, FaImage, FaArrowRight, FaPaperPlane, FaArrowDown } from "react-icons/fa";
import FilePreview from "./FilePreview";
import { useTheme } from "../Theme/ThemeContext";
import { decryptMessage, encryptMessage } from "../secure/Secure"; // <-- add this import

// Create the socket instance outside the component
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

// Simple circular spinner component
const Spinner = () => {
  const { theme } = useTheme();
  const borderColor =
    theme === "dark"
      ? "border-white"
      : "border-gray-800";

  return (
    <div className="flex justify-center items-center my-1">
      <div
        className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${borderColor}`}
      ></div>
    </div>
  );
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

  const [section, setSection] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Refs to track scroll height when fetching older messages
  const prevScrollHeightRef = useRef(0);
  const isFetchingRef = useRef(false);
  // New flag to indicate we are prepending older messages
  const isPrependingRef = useRef(false);

  // Add this ref to track if user was at bottom before new messages
  const wasAtBottomRef = useRef(true);

  const handleImageLoad = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };
  const handleImageError = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const [userData, setUserData] = useState({});

  // Fetch user data
  useEffect(() => {
    fetch(`${URI}settings`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => { data.error ? navigate("/login") : setUserData(data.userDetails); })
      .catch((error) => console.error("Validation error:", error.message));
  }, []);

  // Scroll to bottom for new incoming messages
  const scrollToBottom = () => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
  };

  // When messages change:
  // - If it was a prepend (loading older), skip scrollToBottom here.
  // - If it's new incoming or initial load and not prepending, scroll to bottom.
  useEffect(() => {
    if (wasAtBottomRef.current && !isPrependingRef.current) {
      scrollToBottom();
    }
    // After this effect runs, for prepending we rely on useLayoutEffect to restore position.
  }, [messages]);

  // After DOM updates from prepending older messages, restore scroll position
  useLayoutEffect(() => {
    if (isFetchingRef.current && isPrependingRef.current && scrollableDivRef.current) {
      const scrollableDiv = scrollableDivRef.current;
      const newScrollHeight = scrollableDiv.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      scrollableDiv.scrollTop = diff;
      // Reset flags
      isFetchingRef.current = false;
      isPrependingRef.current = false;
    }
  }, [messages]);

  // Fetch older messages with pagination
  const fetchMessages = (sectionToFetch) => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      prevScrollHeightRef.current = scrollableDiv.scrollHeight;
      isFetchingRef.current = true;
      isPrependingRef.current = true;
    }

    fetch(`${URI}chats/${activeChat}/getmessages?section=${sectionToFetch}&limit=10`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          
          // Decrypt each message.message, but fall back to original on error
          const decryptedData = await Promise.all(
            data.map(async (msg) => {
              const chatPassword = `${activeChat}:${msg.by}`;
              if (typeof msg.message !== "string") return msg;
              try {
                const decryptedText = await decryptMessage(msg.message, chatPassword);
                return { ...msg, message: decryptedText };
              } catch (e) {
                console.warn("Failed to decrypt history message, using raw:", e);
                return msg;
              }
            })
          );

          if (decryptedData.length > 0) {
            setMessages((prev) => [...decryptedData, ...prev]);
            setSection(sectionToFetch + 1);
            setHasMoreMessages(decryptedData.length === 10);
          } else {
            setHasMoreMessages(false);
            isFetchingRef.current = false;
            isPrependingRef.current = false;
          }
        } else {
          console.error("Unexpected response:", data);
          isFetchingRef.current = false;
          isPrependingRef.current = false;
        }
      })
      .catch((error) => {
        console.error("Chat Fetch Error:", error.message);
        isFetchingRef.current = false;
        isPrependingRef.current = false;
      });
  };

  // On activeChat change: reset and load first page
  useEffect(() => {
    if (!activeChat) return;
    wasAtBottomRef.current = true;
    setMessages([]);
    setSection(1);
    setHasMoreMessages(true);
    // Next tick fetch
    setTimeout(() => {
      fetchMessages(1);
    }, 0);
  }, [activeChat, URI]);

  // Register WebSocket connection
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

  // Listen for incoming messages (append to bottom)
  useEffect(() => {
    const handleMessage = async (data) => {
      const chatPassword = `${activeChat}:${data.message.by}`;
      try {
        const decryptedText = await decryptMessage(data.message.message, chatPassword);
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...data.message, message: decryptedText },
        ]);
      } catch (e) {
        console.warn("Failed to decrypt live message, using raw:", e);
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };
    socket.on("send", handleMessage);
    socket.on("shareFile", handleMessage);
    scrollToBottom();
    return () => {
      socket.off("send", handleMessage);
      socket.off("shareFile", handleMessage);
    };
  }, [activeChat, activeUserId]);

  // Send a text message
  const sendMessage = async () => {
    console.log("sendMessage called with:", {
      inputMessage,
      activeChat,
      activeUserId,
    });

    if (!inputMessage.trim() || !activeChat || !activeUserId) {
      console.warn("Blocked send: missing inputMessage/activeChat/activeUserId");
      return;
    }

    const chatPassword = `${activeChat}:${userData._id}`;

    try {
      const encryptedMessage = await encryptMessage(inputMessage, chatPassword);
      socket.emit("send", { chatId: activeChat, message: encryptedMessage });
      setInputMessage("");
    } catch (err) {
      console.error("Failed to encrypt message:", err);
    }
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
    }
  };
  const sendFile = async () => {
    if (!file) return;
    const reader = new FileReader();
    const chatPassword = `${activeChat}:${userData._id}`;

    try {
      const encryptedMessage = await encryptMessage(inputMessage, chatPassword);
      reader.onloadend = () => {
        socket.emit("shareFile", {
          chatId: activeChat,
          message: encryptedMessage,
          file: file,
          mimeType: file.type,
        });
        setSelectedFile(null);
        setFile(null);
        setInputMessage("");
      };
    } catch (err) {
      console.error("Failed to encrypt message:", err);
    };
    
    reader.readAsDataURL(file);
  };

  // Show/hide scroll-to-bottom button & trigger loading older on scroll top
  const handleScroll = () => {
    const scrollableDiv = scrollableDivRef.current;
    if (!scrollableDiv) return;

    const isScrolledToBottom =
      scrollableDiv.scrollHeight - scrollableDiv.scrollTop <= scrollableDiv.clientHeight + 1;
    setShowScrollButton(!isScrolledToBottom);

    if (
      scrollableDiv.scrollTop === 0 &&
      hasMoreMessages &&
      !isFetchingRef.current
    ) {
      fetchMessages(section);
    }
  };

  return (
    <div className="flex w-full overflow-hidden" id="chat-window">
      <div className="flex-1 flex flex-col relative h-full">
        {/* Messages */}
        <div
          className="messages-container p-4 mb-5 overflow-y-scroll flex-1"
          ref={scrollableDivRef}
          onScroll={handleScroll}

        >
          {/* Spinner for fetching older messages */}
          {isFetchingRef.current && isPrependingRef.current && (
            <Spinner />
          )}
          {messages.length > 0 ? (
            messages.map((msg, index) => (
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
            ))
          ) : (
            // empty spacer
            <div className="flex-1" />
          )}
        </div>

        {/* File/Image Preview */}
        {selectedFile && (
          <>
            {file && file.type.startsWith("image/") ? (
              <div
                className="flex flex-row items-center absolute left-0 w-full bottom-28 sm:bottom-32 z-50 p-2 border-t"
                style={{ backgroundColor: "var(--bg-color)" }}
              >
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
                <button
                  className="ml-auto p-2 w-10 h-10 bg-red-500 text-white rounded"
                  title="Clear"
                  onClick={() => {
                    setSelectedFile(null);
                    setFile(null);
                  }}
                >
                  &#10006;
                </button>
              </div>
            ) : (
              <div
                className="flex flex-row items-center absolute left-0 w-full bottom-28 sm:bottom-32 z-50 p-2 border-t"
                style={{ backgroundColor: "var(--bg-color)" }}
              >
                <p className="truncate">{file?.name}</p>
                <button
                  className="ml-2 p-2 w-10 h-10 bg-green-500 text-white rounded"
                  onClick={sendFile}
                >
                  <FaPaperPlane />
                </button>
                <button
                  className="ml-auto p-2 w-10 h-10 bg-red-500 text-white rounded"
                  title="Clear"
                  onClick={() => {
                    setSelectedFile(null);
                    setFile(null);
                  }}
                >
                  &#10006;
                </button>
              </div>
            )}
          </>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            className="fixed bottom-20 right-1/3 p-3 bg-blue-500 text-white rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <FaArrowDown />
          </button>
        )}

        {/* Input Section */}
        <div
          className={`p-2 border-t flex items-center gap-2 bottom-0 left-0 w-full z-50 overflow-x-auto ${activeChat ? "" : "hidden"
            }`}
          style={{ minHeight: "4.5rem", marginBottom: "3rem", backgroundColor: "var(--bg-color)" }}
        >
          {/* Image Upload */}
          <div className="pt-1">
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
          {/* File Upload */}
          <div className="pt-1">
            <label htmlFor="file-upload" className="hover:cursor-pointer">
              <FaUpload />
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="application/pdf, text/plain"
              onChange={handleFileChange}
            />
          </div>
          {/* Message Input */}
          <input
            type="text"
            className="flex-1 border p-2 rounded min-w-0"
            placeholder="Enter a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            style={{ backgroundColor: "var(--bg-color)" }}
          />
          {/* Send Button */}
          <button
            className="ml-1 sm:ml-3 px-3 py-2 bg-blue-500 text-white rounded flex-shrink-0"
            onClick={sendMessage}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
