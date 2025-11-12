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

                {/* Premium Feature Cards */}
                <div className="features-showcase">
                    {/* Card 1 - Find Rides */}
                    <div className="premium-card">
                        <div className="card-glow"></div>
                        <div className="card-shine"></div>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <div className="icon-bg"></div>
                                <svg className="feature-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff"/>
                                            <stop offset="100%" stopColor="#e0e0e0"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="40" cy="40" r="25" stroke="url(#searchGradient)" strokeWidth="7" fill="none"/>
                                    <line x1="58" y1="58" x2="85" y2="85" stroke="url(#searchGradient)" strokeWidth="7" strokeLinecap="round"/>
                                    <circle cx="40" cy="40" r="15" fill="url(#searchGradient)" opacity="0.3"/>
                                </svg>
                            </div>
                            <h3 className="premium-title">Find Rides</h3>
                            <p className="premium-description">
                                Discover rides instantly with real-time matching
                            </p>
                            <div className="card-number">01</div>
                        </div>
                    </div>
                    
                    {/* Card 2 - Save Money */}
                    <div className="premium-card">
                        <div className="card-glow"></div>
                        <div className="card-shine"></div>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <div className="icon-bg"></div>
                                <svg className="feature-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="moneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff"/>
                                            <stop offset="100%" stopColor="#e8e8e8"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="40" fill="url(#moneyGradient)" opacity="0.3"/>
                                    <text x="50" y="68" fontSize="50" fill="url(#moneyGradient)" fontWeight="bold" textAnchor="middle">$</text>
                                    <path d="M 20 40 Q 50 25 80 40" stroke="url(#moneyGradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3 className="premium-title">Save Money</h3>
                            <p className="premium-description">
                                Split costs and keep more in your wallet
                            </p>
                            <div className="card-number">02</div>
                        </div>
                    </div>
                    
                    {/* Card 3 - Go Green */}
                    <div className="premium-card">
                        <div className="card-glow"></div>
                        <div className="card-shine"></div>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <div className="icon-bg"></div>
                                <svg className="feature-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff"/>
                                            <stop offset="100%" stopColor="#e5e5e5"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="38" fill="url(#greenGradient)" opacity="0.3"/>
                                    <path d="M 35 40 Q 42 30 50 40 L 53 45 L 50 50 L 45 47 Z" fill="url(#greenGradient)"/>
                                    <path d="M 55 50 Q 62 45 68 52 L 66 58 L 60 60 Z" fill="url(#greenGradient)"/>
                                    <path d="M 40 60 Q 45 55 50 60 L 52 66 L 47 68 Z" fill="url(#greenGradient)"/>
                                    <ellipse cx="50" cy="50" rx="38" ry="15" fill="none" stroke="url(#greenGradient)" strokeWidth="2" opacity="0.5"/>
                                </svg>
                            </div>
                            <h3 className="premium-title">Go Green</h3>
                            <p className="premium-description">
                                Reduce emissions and protect our planet
                            </p>
                            <div className="card-number">03</div>
                        </div>
                    </div>

                    {/* Card 4 - Community */}
                    <div className="premium-card">
                        <div className="card-glow"></div>
                        <div className="card-shine"></div>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <div className="icon-bg"></div>
                                <svg className="feature-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff"/>
                                            <stop offset="100%" stopColor="#ebebeb"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="30" cy="35" r="12" fill="url(#communityGradient)"/>
                                    <circle cx="50" cy="30" r="14" fill="url(#communityGradient)"/>
                                    <circle cx="70" cy="35" r="12" fill="url(#communityGradient)"/>
                                    <path d="M 20 55 Q 30 50 40 55 L 40 70 L 20 70 Z" fill="url(#communityGradient)" opacity="0.9"/>
                                    <path d="M 40 50 Q 50 45 60 50 L 60 70 L 40 70 Z" fill="url(#communityGradient)" opacity="0.9"/>
                                    <path d="M 60 55 Q 70 50 80 55 L 80 70 L 60 70 Z" fill="url(#communityGradient)" opacity="0.9"/>
                                    <path d="M 25 60 L 75 60" stroke="url(#communityGradient)" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3 className="premium-title">Build Community</h3>
                            <p className="premium-description">
                                Connect with amazing people every day
                            </p>
                            <div className="card-number">04</div>
                        </div>
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
                <Link to="/searchCars" className="cta-button">
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
