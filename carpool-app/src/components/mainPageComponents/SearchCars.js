import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getCurrentUser, 
    searchCarpools, 
    getProfileImageUrl, 
    sendConnectionRequest, 
    getConnectionRequests, 
    acceptConnectionRequest, 
    rejectConnectionRequest, 
    getConnectedUsers,
    searchOpenGroups,
    requestToJoinGroup,
    getGroupDetails
} from '../../Routes/api';
import './SearchCars.css';

function SearchCars() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [viewMode, setViewMode] = useState('users'); // 'users' or 'groups'
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
    
    // Groups state
    const [openGroups, setOpenGroups] = useState([]);
    const [maxDetour, setMaxDetour] = useState(3);
    const [selectedGroup, setSelectedGroup] = useState(null);

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

    const loadOpenGroups = async () => {
        setLoading(true);
        setHasSearched(false);
        try {
            const data = await searchOpenGroups(maxDetour);
            setOpenGroups(data.groups || []);
        } catch (err) {
            console.error('Failed to fetch open groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            await requestToJoinGroup(groupId);
            alert('Join request sent! Group members will vote on your request.');
            loadOpenGroups(); // Refresh the list
        } catch (err) {
            console.error('Failed to send join request:', err);
            alert(err.message || 'Failed to send join request');
        }
    };

    const handleSelectGroup = async (group) => {
        try {
            const details = await getGroupDetails(group.id);
            setSelectedGroup(details);
            setShowModal(true);
        } catch (err) {
            console.error('Failed to load group details:', err);
        }
    };

    const handleSearch = async () => {
        if (!currentUser || !currentUser.companyAddress) {
            alert('Please complete your company address in your profile first.');
            return;
        }

        setLoading(true);
        setHasSearched(true); // Mark as user-initiated search
        try {
            if (viewMode === 'users') {
                const data = await searchCarpools(searchType);
                setResults(data);
            } else {
                const data = await searchOpenGroups(maxDetour);
                setOpenGroups(data.groups || []);
            }
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
                
                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                    <button
                        className={`view-mode-btn ${viewMode === 'users' ? 'active' : ''}`}
                        onClick={() => {
                            setViewMode('users');
                            setHasSearched(false);
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        Find Rides
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'groups' ? 'active' : ''}`}
                        onClick={() => {
                            setViewMode('groups');
                            setHasSearched(false);
                            if (openGroups.length === 0) {
                                loadOpenGroups();
                            }
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l-5.5 9h11z M12 13l-5.5 9h11z M17.5 11c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z M6.5 11c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Find Groups
                    </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        {viewMode === 'users' ? 'Search Carpools' : 'Search Groups'}
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
                        {viewMode === 'users' ? (
                            /* Users Search UI */
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

                                    {user.matchScore && user.matchScore.workDistanceMiles !== undefined && user.matchScore.workDistanceMiles !== null && (
                                        <div className="match-badge match-badge-distance">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
                                            </svg>
                                            <span>{user.matchScore.workDistanceMiles} mi from your work</span>
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
                        ) : (
                            /* Groups Search UI */
                            <div className="groups-search-form">
                                <div className="detour-filter-compact">
                                    <label>
                                        Max Detour: <strong>{maxDetour} miles</strong>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={maxDetour}
                                        onChange={(e) => setMaxDetour(parseInt(e.target.value))}
                                    />
                                </div>

                                <button 
                                    onClick={() => loadOpenGroups()} 
                                    className="search-button" 
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Search for Groups'}
                                </button>

                                {/* Groups Results */}
                                {openGroups.length > 0 && (
                                    <div className="results-section">
                                        <h2 className="results-title">
                                            Found {openGroups.length} open group{openGroups.length !== 1 ? 's' : ''}
                                        </h2>
                                        <div className="results-grid">
                                            {openGroups.map((group) => (
                                                <div key={group.id} className="group-card-compact">
                                                    <h3 className="group-name">{group.name}</h3>
                                                    
                                                    <div className="group-meta-compact">
                                                        <span className="group-seats-compact">
                                                            {group.currentMembers}/{group.maxSeats} members
                                                        </span>
                                                        <span className={`group-status-badge ${group.status}`}>
                                                            {group.status}
                                                        </span>
                                                    </div>

                                                    {group.driver && (
                                                        <div className="group-driver-compact">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M5 11h14v5H5v-5zM19 17H5v2h14v-2zM4 6h16l-2 5H6L4 6z"/>
                                                            </svg>
                                                            <span>Driver: {group.driver.firstName} {group.driver.lastName}</span>
                                                        </div>
                                                    )}

                                                    {group.destination && (
                                                        <div className="group-destination-compact">
                                                            📍 {group.destination}
                                                        </div>
                                                    )}

                                                    {group.detourMiles !== undefined && (
                                                        <div className="match-badge match-badge-distance">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
                                                            </svg>
                                                            <span>{group.detourMiles.toFixed(1)} mi detour</span>
                                                        </div>
                                                    )}

                                                    <div className="group-actions-compact">
                                                        <button 
                                                            className="learn-more-btn"
                                                            onClick={() => handleSelectGroup(group)}
                                                        >
                                                            View Details
                                                        </button>
                                                        <button 
                                                            className="join-group-btn"
                                                            onClick={() => handleJoinGroup(group.id)}
                                                            disabled={group.status !== 'open'}
                                                        >
                                                            Request to Join
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!loading && openGroups.length === 0 && (
                                    <div className="no-results">
                                        <p>No open groups found within {maxDetour} miles. Try increasing the detour distance.</p>
                                    </div>
                                )}
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

            {showModal && (selectedUser || selectedGroup) && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                    setSelectedGroup(null);
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => {
                            setShowModal(false);
                            setSelectedUser(null);
                            setSelectedGroup(null);
                        }}>×</button>
                        
                        {selectedUser && (
                            <>
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
                            </>
                        )}

                        {selectedGroup && (
                            <>
                                <div className="modal-header">
                                    <h2>{selectedGroup.name}</h2>
                                </div>

                                <div className="modal-body">
                                    <div className="modal-section">
                                        <h3>Group Details</h3>
                                        <p><strong>Members:</strong> {selectedGroup.currentMembers}/{selectedGroup.maxSeats}</p>
                                        <p><strong>Status:</strong> <span className={`status-badge status-${selectedGroup.status}`}>{selectedGroup.status}</span></p>
                                        {selectedGroup.detourMiles !== undefined && (
                                            <p><strong>Your detour:</strong> {selectedGroup.detourMiles.toFixed(1)} miles</p>
                                        )}
                                    </div>

                                    {selectedGroup.driver && (
                                        <div className="modal-section">
                                            <h3>Driver</h3>
                                            <p>{selectedGroup.driver.firstName} {selectedGroup.driver.lastName}</p>
                                        </div>
                                    )}

                                    {selectedGroup.destination && (
                                        <div className="modal-section">
                                            <h3>Destination</h3>
                                            <p>📍 {selectedGroup.destination}</p>
                                        </div>
                                    )}

                                    {selectedGroup.members && selectedGroup.members.length > 0 && (
                                        <div className="modal-section">
                                            <h3>Members</h3>
                                            {selectedGroup.members.map((member, idx) => (
                                                <p key={idx}>
                                                    {member.firstName} {member.lastName}
                                                    {member.role === 'driver' && ' (Driver)'}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button 
                                        className="connect-btn"
                                        onClick={() => {
                                            handleJoinGroup(selectedGroup.id);
                                            setShowModal(false);
                                            setSelectedGroup(null);
                                        }}
                                        disabled={selectedGroup.status !== 'open'}
                                    >
                                        Request to Join Group
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchCars;