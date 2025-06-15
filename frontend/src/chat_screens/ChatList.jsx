import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const ChatList = ({ setActiveChat, chatList, activeChat }) => {
    const [searchText, setSearchText] = useState(""); // State for search input
    const [searchChatList, setSearchChatList] = useState([]);

    const URI = import.meta.env.VITE_API_URL;
    console.error('chatlist:', chatList);

    const handleSearch = (e) => {

        e.preventDefault();
        setSearchText(e.target.value);

        let search = document.getElementById('search_chat').value;
        fetch(`${URI}chats/search?query=${encodeURIComponent(search)}`, {
            method: 'GET',
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setSearchChatList(data))
            .catch((error) => console.error('Search error:', error.message));

    }

    const createChatAndOpen = async (otherUserId) => {
        try {
            const res = await fetch(`${URI}chats/create`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otherUserId }),
            });
            const data = await res.json();
            if (data.chatId) {
                setActiveChat(data.chatId);
                window.location.reload();
            }
        } catch (err) {
            console.error('Error creating chat:', err);
        }
    };

    return (
        <div id="chat-list">
            <form onSubmit={handleSearch} className="relative max-w-lg w-full p-4">
                <input
                    id="search_chat"
                    type="text"
                    placeholder="Search chats..."
                    className="w-full px-4 py-2 rounded-md pr-12"
                    value={searchText}
                    onChange={handleSearch}
                />
                <button type="submit" className="absolute right-6 top-1/2 transform -translate-y-1/2">
                    <FaSearch />
                </button>
            </form>

            {searchText.trim() ? (
                <div className="search-chat-list">

                    <ul>
                        {searchChatList.chats && searchChatList.chats.length > 0 ? (
                            <>
                                <h2>Chats</h2>
                                {searchChatList.chats.map((chat) => (
                                    <li key={chat._id}>
                                        <div className="chat-details">
                                            <span className="username">{chat.userDetails.username}</span>
                                            <span className="email">{chat.userDetails.email}</span>
                                            <span className="chatId">{chat.chatId}</span>
                                        </div>
                                    </li>
                                ))}
                            </>
                        ) : (
                            <p></p>
                        )}

                    </ul>


                    <ul>
                        {searchChatList.emailMatches && searchChatList.emailMatches.length > 0 ? (
                            <>
                                <h2>Email</h2>
                                {searchChatList.emailMatches.map((match) => (
                                    <li key={match._id}>
                                        <button
                                            className="email"
                                            onClick={() => createChatAndOpen(match._id)}
                                        >
                                            {match.email}
                                        </button>
                                    </li>
                                ))}
                            </>
                        ) : (
                            <p></p>
                        )}
                    </ul>
                    <ul>
                        {searchChatList.usernameMatches && searchChatList.usernameMatches.length > 0 ? (
                            <>
                                <h2>Username</h2>
                                {searchChatList.usernameMatches.map((match) => (
                                    <li key={match._id}>
                                        <button
                                            className="username"
                                            onClick={() => createChatAndOpen(match._id)}
                                        >
                                            {match.username}
                                        </button>
                                    </li>
                                ))}
                            </>
                        ) : (
                            <p></p>
                        )}
                    </ul>
                </div>
            ) : (
                <ul>
                    {chatList && chatList.length > 0 ? (
                        <>
                            {chatList.map((chat) => (
                                <li key={chat.chatId} onClick={() => setActiveChat(chat.chatId)} style={{ backgroundColor: `${activeChat == chat.chatId ? "#293545" : ""}` }}>
                                    <div className="chat-details">
                                        <span className="username">{chat.userDetails.username}</span>
                                    </div>
                                </li>
                            ))}
                        </>
                    ) : (
                        <p>Search People for chatting</p>
                    )}
                </ul>

            )}
        </div>
    );
};

export default ChatList;