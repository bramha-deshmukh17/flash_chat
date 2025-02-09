import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow"

const Chats = () => {
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_API_URL;

    const [activeChat, setActiveChat] = useState(null);
    const [chatList, setChatList] = useState([]);

    // Fetch initial chat list
    useEffect(() => {
        
        fetch(`${URI}chats`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    navigate('/login');
                } else {
                    console.error(data);
                    setChatList(data.chats);
                }
            })
            .catch((error) => console.error("Validation error:", error.message));

    }, [navigate]);

    const logout = async () => {
        fetch(`${URI}logout`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => (data.error ? console.error(data.error) : navigate("/login")))
            .catch((error) => console.error("Logout error:", error.message));
    };

    return (
        <div
            className="flex"
            style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                height: "100vh",
            }}
        >
            {/* Sidebar */}
            <Navbar />

            {/* Content Area */}
            <div className="flex-grow flex">
                <div
                    className="flex-[2]"
                    style={{
                        borderRight: "1px solid var(--main-heading)",
                    }}
                >
                    <h2 className="text-xl pl-4">Chats</h2>
                    <ChatList setActiveChat={setActiveChat} setChatList={setChatList} chatList={chatList} activeChat={activeChat} />
                </div>
                <div className="flex-[7] p-4">
                    <h2 className="text-xl">Messages</h2>
                    <ChatWindow activeChat={activeChat}/>
                </div>
                <form onSubmit={logout} className="p-4">
                    <button type="submit">Logout</button>
                </form>
            </div>
        </div>
    );
};

export default Chats;
