import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../Routes/api';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (isAuthenticated) {
                const count = await getUnreadCount();
                setUnreadCount(count);
            }
        };
        
        fetchUnreadCount();
        
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [location.pathname, isAuthenticated]); // Re-fetch when page changes or auth changes

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <i className="fas fa-car"></i>
                    Carpooling App
                </Link>
                
                <nav className="nav-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/about" 
                        className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    >
                        About Us
                    </Link>
                    <Link 
                        to="/contact" 
                        className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                    >
                        Contact
                    </Link>
                    {isAuthenticated && (
                        <Link 
                            to="/profile" 
                            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                        >
                            Profile
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link to="/messages" className={`nav-link ${location.pathname.startsWith('/messages') ? 'active' : ''}`}>
                            Messages
                            {unreadCount > 0 && (
                                <span className="unread-count-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link 
                            to="/groups" 
                            className={`nav-link ${location.pathname === '/groups' ? 'active' : ''}`}
                        >
                            Groups
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <button className="nav-link logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <Link 
                            to="/login" 
                            className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;