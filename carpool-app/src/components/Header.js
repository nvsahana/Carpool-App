import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const location = useLocation();
    
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
                    {localStorage.getItem('access_token') && (
                        <Link 
                            to="/profile" 
                            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                        >
                            Profile
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;