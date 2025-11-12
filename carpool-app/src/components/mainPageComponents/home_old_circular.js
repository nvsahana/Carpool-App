import { Link } from "react-router-dom";
import './home.css';

function Home() {
    return (
        <div className="home-container">
            {/* Animated Background */}
            <div className="bg-animation">
                <div className="floating-shapes">
                    <div className="shape"></div>
                    <div className="shape"></div>
                    <div className="shape"></div>
                    <div className="shape"></div>
                    <div className="shape"></div>
                    <div className="shape"></div>
                </div>
            </div>

            {/* Main Hero Content */}
            <div className="hero-content">
                <h1 className="hero-title">
                    Welcome to Carpooling
                </h1>
                <p className="hero-subtitle">
                    Connect, Share, Save; Your Journey Starts Here
                </p>

                {/* Feature Cards with Center Avatar */}
                <div className="features-container">
                    {/* Center Happy Face */}
                    <div className="center-avatar">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="faceGradient" cx="30%" cy="30%">
                                    <stop offset="0%" stopColor="#FFD700"/>
                                    <stop offset="100%" stopColor="#FFA500"/>
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="50" r="45" fill="url(#faceGradient)"/>
                            <circle cx="35" cy="40" r="5" fill="#2c3e50"/>
                            <circle cx="65" cy="40" r="5" fill="#2c3e50"/>
                            <path d="M 30 60 Q 50 75 70 60" stroke="#2c3e50" strokeWidth="4" fill="none" strokeLinecap="round"/>
                            <circle cx="25" cy="55" r="6" fill="#FF69B4" opacity="0.4"/>
                            <circle cx="75" cy="55" r="6" fill="#FF69B4" opacity="0.4"/>
                        </svg>
                        
                        {/* Sparkles */}
                        <div className="center-sparkle">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                            </svg>
                        </div>
                        <div className="center-sparkle">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                            </svg>
                        </div>
                        <div className="center-sparkle">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                            </svg>
                        </div>
                        <div className="center-sparkle">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                            </svg>
                        </div>
                    </div>

                    {/* Card 1 - Top Left */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="40" cy="40" r="25" stroke="#3498db" strokeWidth="6" fill="none"/>
                                <line x1="58" y1="58" x2="80" y2="80" stroke="#3498db" strokeWidth="6" strokeLinecap="round"/>
                                <rect x="25" y="35" width="30" height="12" rx="2" fill="#3498db"/>
                                <circle cx="30" cy="47" r="3" fill="#2c3e50"/>
                                <circle cx="50" cy="47" r="3" fill="#2c3e50"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">Find Your Ride</h3>
                        <p className="feature-text">
                            Discover people heading to your destination
                        </p>
                    </div>
                    
                    {/* Card 2 - Top Right */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="50" cy="55" rx="35" ry="30" fill="#f39c12"/>
                                <circle cx="50" cy="55" r="25" fill="#f39c12"/>
                                <rect x="45" y="30" width="10" height="3" fill="#c0392b"/>
                                <circle cx="42" cy="50" r="3" fill="#2c3e50"/>
                                <circle cx="58" cy="50" r="3" fill="#2c3e50"/>
                                <ellipse cx="50" cy="60" rx="8" ry="6" fill="#e67e22"/>
                                <circle cx="47" cy="60" r="1.5" fill="#2c3e50"/>
                                <circle cx="53" cy="60" r="1.5" fill="#2c3e50"/>
                                <text x="50" y="50" fontSize="20" fill="#27ae60" fontWeight="bold" textAnchor="middle">$</text>
                            </svg>
                        </div>
                        <h3 className="feature-title">Save Money</h3>
                        <p className="feature-text">
                            Split costs and reduce expenses
                        </p>
                    </div>
                    
                    {/* Card 3 - Bottom Left */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <radialGradient id="earthGradient">
                                        <stop offset="0%" stopColor="#3498db"/>
                                        <stop offset="100%" stopColor="#2980b9"/>
                                    </radialGradient>
                                </defs>
                                <circle cx="50" cy="50" r="40" fill="url(#earthGradient)"/>
                                <path d="M 30 30 Q 40 25 50 30 L 55 35 L 50 40 L 45 38 L 40 35 Z" fill="#27ae60"/>
                                <path d="M 60 45 Q 70 42 75 50 L 72 58 L 65 60 L 60 55 Z" fill="#27ae60"/>
                                <path d="M 35 55 Q 40 50 45 55 L 48 62 L 42 65 L 35 62 Z" fill="#27ae60"/>
                                <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3"/>
                                <path d="M 50 20 L 53 17 Q 56 14 58 17 Q 60 20 58 23 L 50 30 L 42 23 Q 40 20 42 17 Q 44 14 47 17 Z" fill="#e74c3c"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">Go Green</h3>
                        <p className="feature-text">
                            Reduce carbon footprint together
                        </p>
                    </div>

                    {/* Card 4 - Bottom Right */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="35" cy="35" r="15" fill="#ffd89b"/>
                                <circle cx="28" cy="33" r="2" fill="#2c3e50"/>
                                <circle cx="42" cy="33" r="2" fill="#2c3e50"/>
                                <path d="M 28 38 Q 35 42 42 38" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                <path d="M 20 50 Q 35 45 50 50 L 50 70 L 20 70 Z" fill="#3498db"/>
                                <circle cx="65" cy="35" r="15" fill="#ffd89b"/>
                                <circle cx="58" cy="33" r="2" fill="#2c3e50"/>
                                <circle cx="72" cy="33" r="2" fill="#2c3e50"/>
                                <path d="M 58 38 Q 65 42 72 38" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                <path d="M 50 50 Q 65 45 80 50 L 80 70 L 50 70 Z" fill="#e74c3c"/>
                                <ellipse cx="50" cy="40" rx="45" ry="12" fill="none" stroke="#f39c12" strokeWidth="3" strokeDasharray="5,3"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">Build Community</h3>
                        <p className="feature-text">
                            Connect with fellow commuters
                        </p>
                    </div>
                </div>

                {/* Car Animation */}
                <div className="car-animation-section">
                    <div className="road"></div>
                    
                    {/* Car with SVG */}
                    <div className="car-wrapper">
                        <svg className="car-svg" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="30" width="80" height="25" rx="5" fill="#3498db"/>
                            <path d="M 20 30 Q 35 10 50 10 Q 65 10 80 30" fill="#2980b9"/>
                            <rect x="25" y="15" width="20" height="15" rx="3" fill="#ecf0f1" opacity="0.8"/>
                            <rect x="55" y="15" width="20" height="15" rx="3" fill="#ecf0f1" opacity="0.8"/>
                            <circle cx="25" cy="55" r="8" fill="#2c3e50"/>
                            <circle cx="25" cy="55" r="4" fill="#95a5a6"/>
                            <circle cx="75" cy="55" r="8" fill="#2c3e50"/>
                            <circle cx="75" cy="55" r="4" fill="#95a5a6"/>
                            <circle cx="88" cy="40" r="3" fill="#f39c12"/>
                        </svg>
                    </div>

                    {/* Passengers in the car */}
                    <div className="passengers-in-car">
                        <div className="passenger-in-car">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#e74c3c"/>
                            </svg>
                        </div>
                        <div className="passenger-in-car">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#3498db"/>
                            </svg>
                        </div>
                        <div className="passenger-in-car">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#2ecc71"/>
                            </svg>
                        </div>
                    </div>
                    
                    {/* Passenger stops */}
                    <div className="passenger-stops">
                        <div className="passenger stop-1">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <circle cx="20" cy="13" r="2" fill="#2c3e50"/>
                                <circle cx="30" cy="13" r="2" fill="#2c3e50"/>
                                <path d="M 20 18 Q 25 21 30 18" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#e74c3c"/>
                                <rect x="13" y="32" width="5" height="13" fill="#c0392b"/>
                            </svg>
                        </div>
                        
                        <div className="passenger stop-2">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <circle cx="20" cy="13" r="2" fill="#2c3e50"/>
                                <circle cx="30" cy="13" r="2" fill="#2c3e50"/>
                                <path d="M 20 18 Q 25 21 30 18" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#3498db"/>
                                <rect x="13" y="32" width="5" height="13" fill="#2980b9"/>
                            </svg>
                        </div>
                        
                        <div className="passenger stop-3">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <circle cx="20" cy="13" r="2" fill="#2c3e50"/>
                                <circle cx="30" cy="13" r="2" fill="#2c3e50"/>
                                <path d="M 20 18 Q 25 21 30 18" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#2ecc71"/>
                                <rect x="13" y="32" width="5" height="13" fill="#27ae60"/>
                            </svg>
                        </div>
                    </div>

                    {/* Office Building */}
                    <div className="office-building">
                        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="20" width="80" height="100" fill="#34495e" stroke="#2c3e50" strokeWidth="2"/>
                            <g fill="#f39c12">
                                {[0, 1, 2, 3, 4].map(row => (
                                    <g key={row}>
                                        <rect x="20" y={30 + row * 16} width="12" height="10" rx="1"/>
                                        <rect x="44" y={30 + row * 16} width="12" height="10" rx="1"/>
                                        <rect x="68" y={30 + row * 16} width="12" height="10" rx="1"/>
                                    </g>
                                ))}
                            </g>
                            <rect x="40" y="100" width="20" height="20" fill="#c0392b"/>
                            <polygon points="10,20 50,5 90,20" fill="#e74c3c"/>
                        </svg>
                    </div>

                    {/* Passengers at building */}
                    <div className="passengers-at-building">
                        <div className="passenger-at-building">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#e74c3c"/>
                            </svg>
                        </div>
                        <div className="passenger-at-building">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#3498db"/>
                            </svg>
                        </div>
                        <div className="passenger-at-building">
                            <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="15" r="10" fill="#ffd89b"/>
                                <path d="M 15 30 Q 25 25 35 30 L 35 45 L 15 45 Z" fill="#2ecc71"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <Link to="/login" className="cta-button">
                    <span>
                        <svg style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '8px'}} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor"/>
                        </svg>
                        Start Your Journey
                    </span>
                </Link>
            </div>
        </div>
    );
}

export default Home;
