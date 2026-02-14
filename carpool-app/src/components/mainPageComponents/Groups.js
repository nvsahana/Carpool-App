import React, { useState, useEffect, useCallback } from 'react';
import {
    getUserGroups,
    getGroupDetails,
    createCarpoolGroup,
    searchOpenGroups,
    requestToJoinGroup,
    voteOnGroupRequest,
    leaveGroup,
    closeGroup,
    getMyGroupRequests,
    getGroupRequests,
    getProfileImageUrl
} from '../../Routes/api';
import './Groups.css';

function Groups() {
    const [activeTab, setActiveTab] = useState('my-groups');
    const [myGroups, setMyGroups] = useState([]);
    const [openGroups, setOpenGroups] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupSeats, setNewGroupSeats] = useState(4);
    const [maxDetour, setMaxDetour] = useState(3);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchMyGroups = useCallback(async () => {
        try {
            const groups = await getUserGroups();
            setMyGroups(groups);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
        }
    }, []);

    const fetchOpenGroups = useCallback(async () => {
        try {
            const result = await searchOpenGroups(maxDetour);
            console.log('Search groups result:', result); // Debug
            setOpenGroups(result.groups || []);
        } catch (err) {
            console.error('Failed to fetch open groups:', err);
        }
    }, [maxDetour]);

    const fetchMyRequests = useCallback(async () => {
        try {
            const requests = await getMyGroupRequests();
            setMyRequests(requests);
        } catch (err) {
            console.error('Failed to fetch my requests:', err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const loadData = async () => {
            try {
                if (activeTab === 'my-groups') {
                    await fetchMyGroups();
                } else if (activeTab === 'find-groups') {
                    await fetchOpenGroups();
                } else if (activeTab === 'my-requests') {
                    await fetchMyRequests();
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [activeTab, fetchMyGroups, fetchOpenGroups, fetchMyRequests]);

    // Refetch when maxDetour slider changes (only on find-groups tab)
    useEffect(() => {
        if (activeTab === 'find-groups') {
            fetchOpenGroups();
        }
    }, [maxDetour]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectGroup = async (groupId) => {
        setLoading(true);
        try {
            const details = await getGroupDetails(groupId);
            setSelectedGroup(details);
            
            // Check if user is a member to fetch pending requests
            const isMember = details.members?.some(m => m.isSelf);
            if (isMember) {
                const requests = await getGroupRequests(groupId);
                setPendingRequests(requests);
            } else {
                setPendingRequests([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCarpoolGroup(newGroupName, newGroupSeats);
            setShowCreateModal(false);
            setNewGroupName('');
            setNewGroupSeats(4);
            setSuccessMessage('Group created successfully!');
            await fetchMyGroups();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestJoin = async (groupId) => {
        setLoading(true);
        try {
            await requestToJoinGroup(groupId);
            setSuccessMessage('Join request sent! Waiting for member approval.');
            await fetchOpenGroups();
            await fetchMyRequests();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (groupId, requestId, vote) => {
        setLoading(true);
        try {
            const result = await voteOnGroupRequest(groupId, requestId, vote);
            if (result.request_approved) {
                setSuccessMessage('Request approved! New member added.');
            } else if (result.request_rejected) {
                setSuccessMessage('Request rejected.');
            } else {
                setSuccessMessage(`Vote recorded. ${result.votes_received}/${result.votes_required} votes.`);
            }
            await handleSelectGroup(groupId);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to leave this group?')) return;
        setLoading(true);
        try {
            await leaveGroup(groupId);
            setSuccessMessage('Left group successfully.');
            setSelectedGroup(null);
            await fetchMyGroups();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to close this group? This cannot be undone.')) return;
        setLoading(true);
        try {
            await closeGroup(groupId);
            setSuccessMessage('Group closed.');
            setSelectedGroup(null);
            await fetchMyGroups();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderMemberCard = (member) => (
        <div key={member.id} className="member-card">
            <img 
                src={getProfileImageUrl(member.user?.profileImage)} 
                alt={member.user?.name || 'User'}
                className="member-avatar"
            />
            <div className="member-info">
                <span className="member-name">{member.user?.name || 'Unknown'}</span>
                <span className={`member-role ${member.role?.toLowerCase()}`}>
                    {member.role}
                </span>
                {member.detourMiles != null && (
                    <span className="member-detour">
                        +{member.detourMiles.toFixed(1)} mi detour
                    </span>
                )}
            </div>
        </div>
    );

    const renderPendingRequest = (request) => (
        <div key={request.id} className="request-card">
            <img 
                src={getProfileImageUrl(request.user?.profileImage)} 
                alt={request.user?.name || 'User'}
                className="request-avatar"
            />
            <div className="request-info">
                <span className="request-name">{request.user?.name || 'Unknown'}</span>
                <span className="request-detour">
                    +{request.detourMiles?.toFixed(1) || '?'} mi detour
                </span>
                <div className="vote-progress">
                    <div 
                        className="vote-progress-bar"
                        style={{ width: `${(request.votesReceived / request.votesRequired) * 100}%` }}
                    />
                    <span className="vote-progress-text">
                        {request.votesReceived}/{request.votesRequired} approvals
                    </span>
                </div>
            </div>
            {!request.hasVoted && (
                <div className="request-actions">
                    <button 
                        className="btn-approve"
                        onClick={() => handleVote(request.groupId, request.id, 'approve')}
                    >
                        Approve
                    </button>
                    <button 
                        className="btn-reject"
                        onClick={() => handleVote(request.groupId, request.id, 'reject')}
                    >
                        Reject
                    </button>
                </div>
            )}
            {request.hasVoted && (
                <span className="voted-badge">Voted</span>
            )}
        </div>
    );

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1>Carpool Groups</h1>
                <button 
                    className="btn-create-group"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Group
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {successMessage && (
                <div className="success-banner">
                    {successMessage}
                </div>
            )}

            <div className="groups-tabs">
                <button 
                    className={`tab ${activeTab === 'my-groups' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('my-groups'); setSelectedGroup(null); }}
                >
                    My Groups
                </button>
                <button 
                    className={`tab ${activeTab === 'find-groups' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('find-groups'); setSelectedGroup(null); }}
                >
                    Find Groups
                </button>
                <button 
                    className={`tab ${activeTab === 'my-requests' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('my-requests'); setSelectedGroup(null); }}
                >
                    My Requests
                </button>
            </div>

            <div className="groups-content">
                {loading && <div className="loading-spinner">Loading...</div>}

                {/* My Groups Tab */}
                {activeTab === 'my-groups' && !loading && (
                    <div className="my-groups-grid">
                        {myGroups.length === 0 ? (
                            <div className="empty-state">
                                <p>You're not part of any carpool groups yet.</p>
                                <p>Create a group as a driver or find one to join!</p>
                            </div>
                        ) : (
                            myGroups.map(group => (
                                <div 
                                    key={group.id} 
                                    className={`group-card ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectGroup(group.id)}
                                >
                                    <h3>{group.name || 'Unnamed Group'}</h3>
                                    <div className="group-meta">
                                        <span className="group-seats">
                                            {group.currentOccupancy}/{group.maxSeats} seats
                                        </span>
                                        <span className={`group-status ${group.status?.toLowerCase()}`}>
                                            {group.status}
                                        </span>
                                    </div>
                                    <span className="group-role">
                                        {group.isDriver ? 'Driver' : 'Passenger'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Find Groups Tab */}
                {activeTab === 'find-groups' && !loading && (
                    <div className="find-groups-section">
                        <div className="detour-filter">
                            <label>Max detour: {maxDetour} miles</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={maxDetour}
                                onChange={(e) => setMaxDetour(Number(e.target.value))}
                            />
                        </div>
                        <div className="open-groups-grid">
                            {openGroups.length === 0 ? (
                                <div className="empty-state">
                                    <p>No groups found matching your route.</p>
                                    <p>Try increasing the max detour distance or check back later.</p>
                                </div>
                            ) : (
                                openGroups.map(group => (
                                    <div key={group.id} className="group-card open">
                                        <h3>{group.name || 'Unnamed Group'}</h3>
                                        <div className="group-meta">
                                            <span className="group-seats">
                                                {group.currentOccupancy}/{group.maxSeats} seats
                                            </span>
                                            <span className="group-detour">
                                                {group.detourMiles != null 
                                                    ? `+${group.detourMiles.toFixed(1)} mi detour`
                                                    : group.matchType || 'Match'
                                                }
                                            </span>
                                        </div>
                                        <p className="group-driver">
                                            Driver: {group.driver?.firstName || 'Unknown'} {group.driver?.lastName || ''}
                                        </p>
                                        {group.destination?.city && (
                                            <p className="group-destination">
                                                To: {group.destination.officeName || group.destination.city}
                                            </p>
                                        )}
                                        <button 
                                            className="btn-join"
                                            onClick={() => handleRequestJoin(group.id)}
                                            disabled={group.alreadyRequested}
                                        >
                                            {group.alreadyRequested ? 'Request Pending' : 'Request to Join'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* My Requests Tab */}
                {activeTab === 'my-requests' && !loading && (
                    <div className="my-requests-section">
                        {myRequests.length === 0 ? (
                            <div className="empty-state">
                                <p>You haven't requested to join any groups.</p>
                            </div>
                        ) : (
                            myRequests.map(request => (
                                <div key={request.id} className="request-status-card">
                                    <div className="request-group-info">
                                        <h3>{request.group?.name || 'Unnamed Group'}</h3>
                                        <span className={`request-status ${request.status?.toLowerCase()}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    {request.status === 'PENDING' && (
                                        <div className="vote-progress">
                                            <div 
                                                className="vote-progress-bar"
                                                style={{ width: `${(request.votesReceived / request.votesRequired) * 100}%` }}
                                            />
                                            <span className="vote-progress-text">
                                                {request.votesReceived}/{request.votesRequired} approvals
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Selected Group Details */}
                {selectedGroup && activeTab === 'my-groups' && (
                    <div className="group-details-panel">
                        <div className="panel-header">
                            <h2>{selectedGroup.name || 'Unnamed Group'}</h2>
                            <button 
                                className="btn-close-panel"
                                onClick={() => setSelectedGroup(null)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="group-stats">
                            <div className="stat">
                                <span className="stat-value">{selectedGroup.currentOccupancy}/{selectedGroup.maxSeats}</span>
                                <span className="stat-label">Seats</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{selectedGroup.baseDistanceMiles?.toFixed(1) || '?'}</span>
                                <span className="stat-label">Base Miles</span>
                            </div>
                            <div className="stat">
                                <span className={`stat-value status-${selectedGroup.status?.toLowerCase()}`}>
                                    {selectedGroup.status}
                                </span>
                                <span className="stat-label">Status</span>
                            </div>
                        </div>

                        <div className="members-section">
                            <h3>Members</h3>
                            <div className="members-list">
                                {selectedGroup.members?.map(renderMemberCard)}
                            </div>
                        </div>

                        {pendingRequests.length > 0 && (
                            <div className="pending-section">
                                <h3>Pending Requests</h3>
                                <div className="requests-list">
                                    {pendingRequests.map(renderPendingRequest)}
                                </div>
                            </div>
                        )}

                        <div className="group-actions">
                            {selectedGroup.members?.find(m => m.isSelf && m.role === 'DRIVER') ? (
                                <button 
                                    className="btn-danger"
                                    onClick={() => handleCloseGroup(selectedGroup.id)}
                                >
                                    Close Group
                                </button>
                            ) : (
                                <button 
                                    className="btn-danger"
                                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                                >
                                    Leave Group
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Create Carpool Group</h2>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Group Name (optional)</label>
                                <input 
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g., Morning Commute Crew"
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Seats: {newGroupSeats}</label>
                                <input 
                                    type="range"
                                    min="2"
                                    max="7"
                                    value={newGroupSeats}
                                    onChange={(e) => setNewGroupSeats(Number(e.target.value))}
                                />
                            </div>
                            <p className="modal-note">
                                You will be the driver of this group. Your home and office addresses will be used as the route.
                            </p>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Groups;
