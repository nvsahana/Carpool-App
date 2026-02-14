import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations, getMessages, sendMessage, getProfileImageUrl } from '../Routes/api';
import './FloatingChat.css';

function FloatingChat() {
    const navigate = useNavigate();
    const [isMinimized, setIsMinimized] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
        // Poll for new messages
        const pollInterval = setInterval(() => {
            loadConversations();
            if (activeChat) {
                loadMessages(activeChat.otherUser.id, true);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const loadConversations = useCallback(async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            const total = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
            setUnreadCount(total);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    }, []);

    const loadMessages = useCallback(async (userId, silent = false) => {
        try {
            const data = await getMessages(userId);
            setMessages(data);
            if (!silent) {
                await loadConversations(); // Refresh to update unread count
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }, [loadConversations]);

    const handleOpenChat = (conv) => {
        setActiveChat(conv);
        loadMessages(conv.otherUser.id);
    };

    const handleCloseChat = () => {
        setActiveChat(null);
        setMessages([]);
        setNewMessage('');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            await sendMessage(activeChat.otherUser.id, newMessage);
            setNewMessage('');
            await loadMessages(activeChat.otherUser.id, true);
            await loadConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleViewAll = () => {
        navigate('/messages');
        setIsMinimized(true);
        setActiveChat(null);
    };

    const getAvatarUrl = (profilePath) => {
        return getProfileImageUrl(profilePath);
    };

    return (
        <>
            {/* Floating Button */}
            {isMinimized && (
                <button 
                    className="floating-chat-button"
                    onClick={() => setIsMinimized(false)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    {unreadCount > 0 && (
                        <span className="floating-chat-badge">{unreadCount}</span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {!isMinimized && (
                <div className="floating-chat-window">
                    {!activeChat ? (
                        // Conversations List
                        <>
                            <div className="floating-chat-header">
                                <h3>Messages</h3>
                                <div className="floating-chat-actions">
                                    <button 
                                        className="floating-chat-expand"
                                        onClick={handleViewAll}
                                        title="View all messages"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                        </svg>
                                    </button>
                                    <button 
                                        className="floating-chat-close"
                                        onClick={() => setIsMinimized(true)}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="floating-chat-list">
                                {conversations.length > 0 ? (
                                    conversations.slice(0, 5).map(conv => (
                                        <div
                                            key={conv.id}
                                            className="floating-chat-item"
                                            onClick={() => handleOpenChat(conv)}
                                        >
                                            <div className="floating-avatar-wrapper">
                                                {getAvatarUrl(conv.otherUser.profilePath) ? (
                                                    <img 
                                                        src={getAvatarUrl(conv.otherUser.profilePath)} 
                                                        alt={conv.otherUser.firstName}
                                                        className="floating-avatar"
                                                    />
                                                ) : (
                                                    <div className="floating-avatar-placeholder">
                                                        {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                                                    </div>
                                                )}
                                                {conv.unreadCount > 0 && (
                                                    <span className="floating-unread-dot"></span>
                                                )}
                                            </div>
                                            <div className="floating-chat-info">
                                                <div className="floating-chat-name">
                                                    {conv.otherUser.firstName} {conv.otherUser.lastName}
                                                    {conv.unreadCount > 0 && (
                                                        <span className="floating-unread-count">{conv.unreadCount}</span>
                                                    )}
                                                </div>
                                                {conv.lastMessage && (
                                                    <div className="floating-chat-preview">
                                                        {conv.lastMessage.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="floating-chat-empty">
                                        <p>No messages yet</p>
                                        <button onClick={handleViewAll}>Start chatting</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Active Chat
                        <>
                            <div className="floating-chat-header">
                                <button 
                                    className="floating-chat-back"
                                    onClick={handleCloseChat}
                                >
                                    ←
                                </button>
                                <div className="floating-chat-user">
                                    {getAvatarUrl(activeChat.otherUser.profilePath) ? (
                                        <img 
                                            src={getAvatarUrl(activeChat.otherUser.profilePath)} 
                                            alt={activeChat.otherUser.firstName}
                                            className="floating-avatar-small"
                                        />
                                    ) : (
                                        <div className="floating-avatar-placeholder-small">
                                            {activeChat.otherUser.firstName[0]}{activeChat.otherUser.lastName[0]}
                                        </div>
                                    )}
                                    <span>{activeChat.otherUser.firstName} {activeChat.otherUser.lastName}</span>
                                </div>
                                <button 
                                    className="floating-chat-close"
                                    onClick={() => setIsMinimized(true)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="floating-messages-list">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`floating-message ${msg.isFromMe ? 'sent' : 'received'}`}
                                    >
                                        <div className="floating-message-content">
                                            {msg.content}
                                        </div>
                                        <div className="floating-message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="floating-message-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

export default FloatingChat;
