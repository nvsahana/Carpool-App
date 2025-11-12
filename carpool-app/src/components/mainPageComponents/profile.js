import { useEffect, useState } from 'react';
import './profile.css';
import { getCurrentUser, API_BASE } from '../../Routes/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getCurrentUser();
        if (mounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-error">No user data.</div>;

  let avatarSrc = null;
  if (user.profilePath) {
    const rel = user.profilePath.split('uploads/')[1];
    if (rel) {
      avatarSrc = `${API_BASE}/uploads/${rel}`;
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card" aria-label="User profile">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {avatarSrc ? (
              <>
                <div className="avatar-ring" />
                <img src={avatarSrc} alt="Profile" className="profile-avatar" />
              </>
            ) : (
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)', fontSize: '3rem', fontWeight: 700
              }}>?</div>
            )}
          </div>
          <div>
            <h1 className="profile-title">{user.firstName} {user.lastName}</h1>
            <p className="profile-sub">Role: {user.role}</p>
          </div>
        </div>
        <div className="profile-grid">
          <div className="profile-item">
            <div className="profile-label">Email</div>
            <div className="profile-value">{user.email}</div>
          </div>
          {user.phone && (
            <div className="profile-item">
              <div className="profile-label">Phone</div>
              <div className="profile-value">{user.phone}</div>
            </div>
          )}
          <div className="profile-item">
            <div className="profile-label">Driver's License</div>
            <div className="profile-value">{user.hasDriversLicense ? 'Yes' : 'No'}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">Willing To Take</div>
            <div className="profile-value">{user.willingToTake && user.willingToTake.length ? user.willingToTake.join(', ') : 'N/A'}</div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="profile-btn" type="button" onClick={() => alert('Edit coming soon')}>Edit Profile</button>
          <button className="profile-btn" type="button" onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login'; }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;