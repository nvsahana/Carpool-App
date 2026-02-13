import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, searchCarpools, getProfileImageUrl, sendConnectionRequest, getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest, getConnectedUsers } from '../../Routes/api';
import './SearchCars.css';

function SearchCars() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [searchType, setSearchType] = useState('all'); // all, office, street, city
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [connectionRequests, setConnectionRequests] = useState({ received: [], sent: [] });
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'requests', or 'connected'
    const [sendingRequest, setSendingRequest] = useState(false);
    const [newRequestsCount, setNewRequestsCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [previousRequestCount, setPreviousRequestCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Load current user data with addresses
        getCurrentUser()
            .then(user => {
                setCurrentUser(user);
                // Auto-load initial matches on page load
                if (user && user.companyAddress) {
                    loadInitialMatches();
                }
                // Load connection requests and connected users
                loadConnectionRequests();
                loadConnectedUsers();
            })
            .catch(err => {
                console.error('Failed to load user:', err);
                navigate('/login');
            });
    }, [navigate]);

    // Polling effect for real-time updates
    useEffect(() => {
        // Set up polling interval (every 5 seconds)
        const pollInterval = setInterval(() => {
            loadConnectionRequests();
            loadConnectedUsers();
        }, 5000); // Poll every 5 seconds

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, []);

    // Track new requests for notifications
    useEffect(() => {
        const currentCount = connectionRequests.received.length;
        if (previousRequestCount > 0 && currentCount > previousRequestCount) {
            setNewRequestsCount(currentCount - previousRequestCount);
            setShowNotification(true);
            // Auto-hide notification after 5 seconds
            setTimeout(() => setShowNotification(false), 5000);
        }
        setPreviousRequestCount(currentCount);
    }, [connectionRequests.received]);

    const loadInitialMatches = async () => {
        setLoading(true);
        try {
            const data = await searchCarpools('all'); // Default to top matches across all criteria
            setResults(data);
            setHasSearched(false); // Mark as initial load
        } catch (err) {
            console.error('Failed to load initial matches:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadConnectionRequests = async () => {
        try {
            const data = await getConnectionRequests();
            setConnectionRequests(data);
        } catch (err) {
            console.error('Failed to load connection requests:', err);
        }
    };

    const loadConnectedUsers = async () => {
        try {
            const data = await getConnectedUsers();
            setConnectedUsers(data);
        } catch (err) {
            console.error('Failed to load connected users:', err);
        }
    };

    const isUserConnected = (userId) => {
        return connectedUsers.some(user => user.id === userId);
    };

    const handleSearch = async () => {
        if (!currentUser || !currentUser.companyAddress) {
            alert('Please complete your company address in your profile first.');
            return;
        }

        setLoading(true);
        setHasSearched(true); // Mark as user-initiated search
        try {
            const data = await searchCarpools(searchType);
            setResults(data);
        } catch (err) {
            console.error('Search failed:', err);
            alert('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLearnMore = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleConnect = async (userId) => {
        setSendingRequest(true);
        try {
            await sendConnectionRequest(userId);
            setShowModal(false);
            // Reload connection requests to update the sent list
            await loadConnectionRequests();
        } catch (err) {
            console.error('Failed to send connection request:', err);
            alert(err.message || 'Failed to send connection request');
        } finally {
            setSendingRequest(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await acceptConnectionRequest(requestId);
            await loadConnectionRequests();
            await loadConnectedUsers();
        } catch (err) {
            console.error('Failed to accept request:', err);
            alert(err.message || 'Failed to accept request');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await rejectConnectionRequest(requestId);
            await loadConnectionRequests();
        } catch (err) {
            console.error('Failed to reject request:', err);
            alert(err.message || 'Failed to reject request');
        }
    };

    const getAvatarUrl = (profilePath) => {
        return getProfileImageUrl(profilePath);
    };

    if (!currentUser) {
        return <div className="search-loading">Loading...</div>;
    }

    return (
        <div className="search-page">
            {/* Notification for new requests */}
            {showNotification && (
                <div className="notification-toast">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>You have {newRequestsCount} new connection request{newRequestsCount > 1 ? 's' : ''}!</span>
                    <button 
                        className="notification-view-btn"
                        onClick={() => {
                            setActiveTab('requests');
                            setShowNotification(false);
                        }}
                    >
                        View
                    </button>
                    <button 
                        className="notification-close-btn"
                        onClick={() => setShowNotification(false)}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="search-container">
                <h1 className="search-title">Find Your Carpool Match</h1>
                
                {/* Tab Navigation */}
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        Search Carpools
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Connection Requests
                        {connectionRequests.received.length > 0 && (
                            <span className="badge">{connectionRequests.received.length}</span>
                        )}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'connected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connected')}
                    >
                        Connected Commuters
                        {connectedUsers.length > 0 && (
                            <span className="badge badge-success">{connectedUsers.length}</span>
                        )}
                    </button>
                </div>

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <>
                        <div className="search-form">
                    {currentUser && currentUser.companyAddress && (
                        <div className="current-address-display">
                            <h3>Your Office Location:</h3>
                            {currentUser.companyAddress.officeName && (
                                <p><strong>Office:</strong> {currentUser.companyAddress.officeName}</p>
                            )}
                            {currentUser.companyAddress.street && (
                                <p><strong>Street:</strong> {currentUser.companyAddress.street}</p>
                            )}
                            <p><strong>City:</strong> {currentUser.companyAddress.city}</p>
                            {currentUser.companyAddress.zipcode && (
                                <p><strong>Zipcode:</strong> {currentUser.companyAddress.zipcode}</p>
                            )}
                        </div>
                    )}

                    <div className="search-instructions">
                        <p>Filter by work location:</p>
                    </div>

                    <div className="search-type-selector">
                        <label className={`type-option ${searchType === 'all' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="searchType"
                                value="all"
                                checked={searchType === 'all'}
                                onChange={(e) => setSearchType(e.target.value)}
                            />
                            <span>Top Matches</span>
                        </label>
                        <label className={`type-option ${searchType === 'office' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="searchType"
                                value="office"
                                checked={searchType === 'office'}
                                onChange={(e) => setSearchType(e.target.value)}
                            />
                            <span>Same Office</span>
                        </label>
                        <label className={`type-option ${searchType === 'street' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="searchType"
                                value="street"
                                checked={searchType === 'street'}
                                onChange={(e) => setSearchType(e.target.value)}
                            />
                            <span>Same Street</span>
                        </label>
                        <label className={`type-option ${searchType === 'city' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="searchType"
                                value="city"
                                checked={searchType === 'city'}
                                onChange={(e) => setSearchType(e.target.value)}
                            />
                            <span>Same City</span>
                        </label>
                    </div>

                    <button 
                        onClick={handleSearch} 
                        className="search-button" 
                        disabled={loading || !currentUser}
                    >
                        {loading ? 'Searching...' : 'Search for Carpools'}
                    </button>
                </div>

                {results.length > 0 && (
                    <div className="results-section">
                        <h2 className="results-title">
                            {hasSearched 
                                ? `Found ${results.length} match${results.length !== 1 ? 'es' : ''}`
                                : 'Top Potential Matches for You'
                            }
                        </h2>
                        <div className="results-grid">
                            {results.map((user) => (
                                <div key={user.id} className="user-card">
                                    <div className="user-avatar-container">
                                        {getAvatarUrl(user.profilePath) ? (
                                            <img 
                                                src={getAvatarUrl(user.profilePath)} 
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="user-avatar"
                                            />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                        )}
                                        <div className={`role-icon ${user.role}`}>
                                            {user.role === 'driver' ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M5 11h14v5H5v-5zM19 17H5v2h14v-2zM4 6h16l-2 5H6L4 6z"/>
                                                    <circle cx="7.5" cy="17.5" r="1.5"/>
                                                    <circle cx="16.5" cy="17.5" r="1.5"/>
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2h16z"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <h3 className="user-name">
                                        {user.firstName} {user.lastName}
                                    </h3>                                    {user.companyAddress && (
                                        <div className="address-info">
                                            <div className="address-label">Office Location:</div>
                                            {user.companyAddress.officeName && (
                                                <div className="address-line">{user.companyAddress.officeName}</div>
                                            )}
                                            {user.companyAddress.street && (
                                                <div className="address-line">{user.companyAddress.street}</div>
                                            )}
                                            <div className="address-line">
                                                {user.companyAddress.city}
                                                {user.companyAddress.zipcode && `, ${user.companyAddress.zipcode}`}
                                            </div>
                                        </div>
                                    )}

                                    {user.matchScore && user.matchScore.sameOffice && (
                                        <div className="match-badge match-badge-office">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                                            </svg>
                                            <span>Same office!</span>
                                        </div>
                                    )}

                                    {user.matchScore && user.matchScore.sameHomeCity && (
                                        <div className="match-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                            </svg>
                                            <span>Same home city!</span>
                                        </div>
                                    )}

                                    {user.matchScore && user.matchScore.sameHomeZipcode && !user.matchScore.sameHomeCity && (
                                        <div className="match-badge match-badge-zip">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                            <span>Same home zipcode!</span>
                                        </div>
                                    )}

                                    {isUserConnected(user.id) && (
                                        <div className="connected-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                            </svg>
                                            <span>Connected</span>
                                        </div>
                                    )}

                                    <button 
                                        className="learn-more-btn"
                                        onClick={() => handleLearnMore(user)}
                                    >
                                        Learn More
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && results.length === 0 && currentUser && (
                    <div className="no-results">
                        <p>
                            {searchType === 'all' 
                                ? 'No carpool matches found in your area yet. Be the first to invite colleagues!'
                                : `No matches found for "${searchType}" filter. Try "Top Matches" for broader results.`
                            }
                        </p>
                    </div>
                )}
                    </>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="requests-section">
                        {/* Received Requests */}
                        <div className="requests-group">
                            <h2 className="requests-subtitle">Received Requests ({connectionRequests.received.length})</h2>
                            {connectionRequests.received.length > 0 ? (
                                <div className="requests-grid">
                                    {connectionRequests.received.map((request) => (
                                        <div key={request.id} className="request-card">
                                            <div className="request-header">
                                                {getAvatarUrl(request.sender.profilePath) ? (
                                                    <img 
                                                        src={getAvatarUrl(request.sender.profilePath)} 
                                                        alt={`${request.sender.firstName} ${request.sender.lastName}`}
                                                        className="request-avatar"
                                                    />
                                                ) : (
                                                    <div className="request-avatar-placeholder">
                                                        {request.sender.firstName[0]}{request.sender.lastName[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="request-name">
                                                        {request.sender.firstName} {request.sender.lastName}
                                                    </h3>
                                                    <p className="request-role">{request.sender.role}</p>
                                                </div>
                                            </div>
                                            {request.sender.companyAddress && (
                                                <p className="request-location">
                                                    📍 {request.sender.companyAddress.city}
                                                </p>
                                            )}
                                            <p className="request-date">
                                                Sent {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                            <div className="request-actions">
                                                <button 
                                                    className="accept-btn"
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="reject-btn"
                                                    onClick={() => handleRejectRequest(request.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-requests">No pending requests</p>
                            )}
                        </div>

                        {/* Sent Requests */}
                        <div className="requests-group">
                            <h2 className="requests-subtitle">Sent Requests ({connectionRequests.sent.length})</h2>
                            {connectionRequests.sent.length > 0 ? (
                                <div className="requests-grid">
                                    {connectionRequests.sent.map((request) => (
                                        <div key={request.id} className="request-card">
                                            <div className="request-header">
                                                {getAvatarUrl(request.receiver.profilePath) ? (
                                                    <img 
                                                        src={getAvatarUrl(request.receiver.profilePath)} 
                                                        alt={`${request.receiver.firstName} ${request.receiver.lastName}`}
                                                        className="request-avatar"
                                                    />
                                                ) : (
                                                    <div className="request-avatar-placeholder">
                                                        {request.receiver.firstName[0]}{request.receiver.lastName[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="request-name">
                                                        {request.receiver.firstName} {request.receiver.lastName}
                                                    </h3>
                                                    <p className="request-role">{request.receiver.role}</p>
                                                </div>
                                            </div>
                                            {request.receiver.companyAddress && (
                                                <p className="request-location">
                                                    📍 {request.receiver.companyAddress.city}
                                                </p>
                                            )}
                                            <p className="request-date">
                                                Sent {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className={`status-badge status-${request.status}`}>
                                                {request.status === 'pending' && '⏳ Pending'}
                                                {request.status === 'accepted' && '✅ Accepted'}
                                                {request.status === 'rejected' && '❌ Rejected'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-requests">No sent requests</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Connected Commuters Tab */}
                {activeTab === 'connected' && (
                    <div className="connected-section">
                        <h2 className="connected-title">Connected Commuters ({connectedUsers.length})</h2>
                        {connectedUsers.length > 0 ? (
                            <div className="results-grid">
                                {connectedUsers.map((user) => (
                                    <div key={user.id} className="user-card">
                                        <div className="user-avatar-container">
                                            {getAvatarUrl(user.profilePath) ? (
                                                <img 
                                                    src={getAvatarUrl(user.profilePath)} 
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="user-avatar"
                                                />
                                            ) : (
                                                <div className="user-avatar-placeholder">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                            )}
                                            <div className={`role-icon ${user.role}`}>
                                                {user.role === 'driver' ? (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M5 11h14v5H5v-5zM19 17H5v2h14v-2zM4 6h16l-2 5H6L4 6z"/>
                                                        <circle cx="7.5" cy="17.5" r="1.5"/>
                                                        <circle cx="16.5" cy="17.5" r="1.5"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2h16z"/>
                                                        <circle cx="12" cy="7" r="4"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 className="user-name">
                                            {user.firstName} {user.lastName}
                                        </h3>

                                        {user.companyAddress && (
                                            <div className="address-info">
                                                <div className="address-label">Office Location:</div>
                                                {user.companyAddress.officeName && (
                                                    <div className="address-line">{user.companyAddress.officeName}</div>
                                                )}
                                                {user.companyAddress.street && (
                                                    <div className="address-line">{user.companyAddress.street}</div>
                                                )}
                                                <div className="address-line">
                                                    {user.companyAddress.city}
                                                    {user.companyAddress.zipcode && `, ${user.companyAddress.zipcode}`}
                                                </div>
                                            </div>
                                        )}

                                        {user.email && (
                                            <div className="contact-info">
                                                <p>📧 {user.email}</p>
                                                {user.phone && <p>📞 {user.phone}</p>}
                                            </div>
                                        )}

                                        <div className="connected-actions">
                                            <button 
                                                className="message-btn"
                                                onClick={() => navigate(`/messages/${user.id}`)}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                                                </svg>
                                                Message
                                            </button>
                                            <button 
                                                className="learn-more-btn"
                                                onClick={() => handleLearnMore(user)}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <p>No connected commuters yet. Start searching and sending connection requests!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        
                        <div className="modal-header">
                            {getAvatarUrl(selectedUser.profilePath) ? (
                                <img 
                                    src={getAvatarUrl(selectedUser.profilePath)} 
                                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                    className="modal-avatar"
                                />
                            ) : (
                                <div className="modal-avatar-placeholder">
                                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                </div>
                            )}
                            <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                        </div>

                        <div className="modal-body">
                            {selectedUser.companyAddress && (
                                <div className="modal-section">
                                    <h3>Office Location</h3>
                                    {selectedUser.companyAddress.officeName && (
                                        <p><strong>Office:</strong> {selectedUser.companyAddress.officeName}</p>
                                    )}
                                    {selectedUser.companyAddress.street && (
                                        <p><strong>Street:</strong> {selectedUser.companyAddress.street}</p>
                                    )}
                                    <p><strong>City:</strong> {selectedUser.companyAddress.city}</p>
                                    {selectedUser.companyAddress.zipcode && (
                                        <p><strong>Zipcode:</strong> {selectedUser.companyAddress.zipcode}</p>
                                    )}
                                </div>
                            )}

                            {selectedUser.homeAddress && (
                                <div className="modal-section">
                                    <h3>Home Location</h3>
                                    <p><strong>City:</strong> {selectedUser.homeAddress.city}</p>
                                    {selectedUser.homeAddress.zipcode && (
                                        <p><strong>Zipcode:</strong> {selectedUser.homeAddress.zipcode}</p>
                                    )}
                                </div>
                            )}

                            {selectedUser.role === 'driver' && selectedUser.willingToTake && selectedUser.willingToTake.length > 0 && (
                                <div className="modal-section">
                                    <h3>Driver Details</h3>
                                    <p><strong>Can take:</strong> {selectedUser.willingToTake.join(', ')} passenger(s)</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {isUserConnected(selectedUser.id) ? (
                                <div style={{display: 'flex', gap: '10px', width: '100%'}}>
                                    <button 
                                        className="connected-btn"
                                        disabled
                                        title="You are already connected with this user"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                        </svg>
                                        Connected
                                    </button>
                                    <button 
                                        className="message-btn"
                                        onClick={() => navigate(`/messages/${selectedUser.id}`)}
                                        title="Send a message"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                                        </svg>
                                        Message
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="connect-btn"
                                    onClick={() => handleConnect(selectedUser.id)}
                                    disabled={sendingRequest}
                                >
                                    {sendingRequest ? 'Sending...' : 'Connect'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchCars;