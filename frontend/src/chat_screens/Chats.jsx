import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { FaArrowLeft } from "react-icons/fa";

const Chats = () => {
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_API_URL;

    const [activeChat, setActiveChat] = useState(null);
    const [chatList, setChatList] = useState([]);
    const isMobile = useIsMobile();
    const [activeUserId, setActiveUserId] = useState();

    // Fetch initial chat list
    useEffect(() => {
        fetch(`${URI}chats`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    navigate("/login");
                } else {
                    setChatList(data.chats);
                    setActiveUserId(data.userId);
                }
            })
            .catch((error) => console.error("Validation error:", error.message));
    }, [navigate, URI]);

    return (
        <div
            className="flex overflow-hidden"
            style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                height: "100vh",
            }}
            id='chats'
        >
            {/* Sidebar */}
            <Navbar />

            {/* Content Area */}
            <div className="flex-grow flex">
                {!isMobile ? (
                    // Desktop view: Show ChatList and ChatWindow side-by-side
                    <>
                        <div
                            className="flex-[2]"
                            style={{ borderRight: "1px solid var(--main-heading)" }}
                        >
                            <h2 className="text-xl pl-4">Chats</h2>
                            <ChatList
                                setActiveChat={setActiveChat}
                                setChatList={setChatList}
                                chatList={chatList}
                                activeChat={activeChat}
                            />
                        </div>
                        <div className="flex-[7] p-4">
                            <h2 className="text-xl">Messages</h2>
                            <ChatWindow activeChat={activeChat} activeUserId={activeUserId} />
                        </div>
                       
                    </>
                ) : (
                    // Mobile view: Conditionally show ChatList or ChatWindow
                    <>
                        {activeChat === null ? (
                            <div className="flex-grow">
                                <h2 className="text-xl pl-4">Chats</h2>
                                <ChatList
                                    setActiveChat={setActiveChat}
                                    setChatList={setChatList}
                                    chatList={chatList}
                                    activeChat={activeChat}
                                />
                            </div>
                        ) : (
                            <div className="flex-grow">
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="pt-3 ps-3"
                                >
                                    <FaArrowLeft />
                                </button>
                                        <ChatWindow activeChat={activeChat} activeUserId={activeUserId} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Chats;

// Custom hook to detect mobile view
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
};
