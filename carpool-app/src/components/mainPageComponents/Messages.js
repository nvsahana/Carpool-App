import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getConversations, getMessages, sendMessage, getProfileImageUrl } from '../../Routes/api';
import './Messages.css';

function Messages() {
    const navigate = useNavigate();
    const { userId } = useParams(); // Optional: specific conversation
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        getCurrentUser()
            .then(user => {
                setCurrentUser(user);
                loadConversations();
            })
            .catch(err => {
                console.error('Failed to load user:', err);
                navigate('/login');
            });
    }, [navigate]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages
    useEffect(() => {
        if (!selectedConversation) return;

        const pollInterval = setInterval(() => {
            loadMessages(selectedConversation.otherUser.id, true); // silent reload
            loadConversations(); // Update conversation list
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            
            // Auto-select conversation if userId is provided in URL
            if (userId && data.length > 0) {
                const targetConv = data.find(conv => conv.otherUser.id === parseInt(userId));
                if (targetConv) {
                    await handleSelectConversation(targetConv);
                }
            }
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    };

    const loadMessages = async (otherUserId, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await getMessages(otherUserId);
            setMessages(data.messages);
        } catch (err) {
            console.error('Failed to load messages:', err);
            if (!silent) alert(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        await loadMessages(conversation.otherUser.id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            await sendMessage(selectedConversation.otherUser.id, newMessage);
            setNewMessage('');
            await loadMessages(selectedConversation.otherUser.id, true);
            await loadConversations(); // Update conversation list
        } catch (err) {
            console.error('Failed to send message:', err);
            alert(err.message);
        } finally {
            setSending(false);
        }
    };

    const getAvatarUrl = (profilePath) => {
        return getProfileImageUrl(profilePath);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (!currentUser) {
        return <div className="messages-loading">Loading...</div>;
    }

    return (
        <div className="messages-page">
            <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                    <div className="sidebar-header">
                        <h2>Messages</h2>
                        <button 
                            className="back-btn"
                            onClick={() => navigate('/searchCars')}
                            title="Back to Search"
                        >
                            ← Back
                        </button>
                    </div>

                    <div className="conversations-list">
                        {conversations.length > 0 ? (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <div className="conv-avatar-wrapper">
                                        {getAvatarUrl(conv.otherUser.profilePath) ? (
                                            <img 
                                                src={getAvatarUrl(conv.otherUser.profilePath)} 
                                                alt={`${conv.otherUser.firstName}`}
                                                className="conv-avatar"
                                            />
                                        ) : (
                                            <div className="conv-avatar-placeholder">
                                                {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                                            </div>
                                        )}
                                        {conv.unreadCount > 0 && (
                                            <span className="unread-badge">{conv.unreadCount}</span>
                                        )}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-header">
                                            <span className="conv-name">
                                                {conv.otherUser.firstName} {conv.otherUser.lastName}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="conv-time">
                                                    {formatTime(conv.lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className={`conv-preview ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                                                {conv.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-conversations">
                                <p>No conversations yet</p>
                                <p>Connect with other users to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="messages-main">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-user-info">
                                    {getAvatarUrl(selectedConversation.otherUser.profilePath) ? (
                                        <img 
                                            src={getAvatarUrl(selectedConversation.otherUser.profilePath)} 
                                            alt={`${selectedConversation.otherUser.firstName}`}
                                            className="chat-avatar"
                                        />
                                    ) : (
                                        <div className="chat-avatar-placeholder">
                                            {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3>{selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}</h3>
                                        <p className="user-role">{selectedConversation.otherUser.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="messages-list">
                                {loading ? (
                                    <div className="messages-loading">Loading messages...</div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                {msg.content}
                                            </div>
                                            <div className="message-time">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-messages">
                                        <p>No messages yet</p>
                                        <p>Send a message to start the conversation</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form className="message-input-container" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={sending}
                                />
                                <button 
                                    type="submit" 
                                    className="send-btn"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    {sending ? (
                                        '⏳'
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                            </svg>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;