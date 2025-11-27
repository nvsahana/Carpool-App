import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, searchCarpools, API_BASE } from '../../Routes/api';
import './SearchCars.css';

function SearchCars() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [searchType, setSearchType] = useState('office'); // office, street, city
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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
            })
            .catch(err => {
                console.error('Failed to load user:', err);
                navigate('/login');
            });
    }, [navigate]);

    const loadInitialMatches = async () => {
        setLoading(true);
        try {
            const data = await searchCarpools('office'); // Default to office search
            setResults(data);
            setHasSearched(false); // Mark as initial load
        } catch (err) {
            console.error('Failed to load initial matches:', err);
        } finally {
            setLoading(false);
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

    const handleConnect = (userId) => {
        // TODO: Implement connection logic (send message, add to connections, etc.)
        alert(`Connection request sent to user ${userId}!`);
        setShowModal(false);
    };

    const getAvatarUrl = (profilePath) => {
        if (!profilePath) return null;
        const filename = profilePath.split('/').pop();
        return `${API_BASE}/uploads/${filename}`;
    };

    if (!currentUser) {
        return <div className="search-loading">Loading...</div>;
    }

    return (
        <div className="search-page">
            <div className="search-container">
                <h1 className="search-title">Find Your Carpool Match</h1>
                
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
                        <p>Find carpool partners going to:</p>
                    </div>

                    <div className="search-type-selector">
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

                                    {user.matchScore && user.matchScore.sameHomeCity && (
                                        <div className="match-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                            <span>Same home city!</span>
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
                        <p>No matches found. Try a different search type.</p>
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
                            <button 
                                className="connect-btn"
                                onClick={() => handleConnect(selectedUser.id)}
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchCars;