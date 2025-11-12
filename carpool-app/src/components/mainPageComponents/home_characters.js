import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

function Home() {
    return (
        <div className="home-container">
            {/* Animated Background Shapes */}
            <div className="background-shapes">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Share the Ride.<br/>Share the Joy.
                    </h1>
                    <p className="hero-subtitle">
                        Connect with people, save money, and make every commute an adventure
                    </p>
                </div>

                {/* Feature Cards with Full Body Characters */}
                <div className="features-grid">
                    {/* Card 1 - Driver waving */}
                    <div className="feature-card-new">
                        <div className="character-illustration">
                            <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
                                {/* Head */}
                                <circle cx="100" cy="70" r="38" fill="#ffd89b"/>
                                {/* Hair */}
                                <path d="M 62 60 Q 68 30 100 25 Q 132 30 138 60" fill="#2c3e50"/>
                                {/* Eyes */}
                                <circle cx="86" cy="68" r="5" fill="#2c3e50"/>
                                <circle cx="114" cy="68" r="5" fill="#2c3e50"/>
                                {/* Smile */}
                                <path d="M 80 82 Q 100 92 120 82" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round"/>
                                {/* Neck */}
                                <rect x="88" y="102" width="24" height="18" fill="#ffd89b" rx="3"/>
                                {/* Body */}
                                <path d="M 70 120 L 68 200 L 82 200 L 82 270 L 98 270 L 98 200 L 102 200 L 102 270 L 118 270 L 118 200 L 132 200 L 130 120 Z" fill="#3498db"/>
                                {/* Left Arm (waving) */}
                                <path d="M 70 135 L 45 140 L 30 120" stroke="#3498db" strokeWidth="14" fill="none" strokeLinecap="round"/>
                                <circle cx="30" cy="120" r="10" fill="#ffd89b"/>
                                {/* Right Arm */}
                                <path d="M 130 135 L 155 160" stroke="#3498db" strokeWidth="14" fill="none" strokeLinecap="round"/>
                                <circle cx="155" cy="160" r="10" fill="#ffd89b"/>
                                {/* Wave motion lines */}
                                <path d="M 20 115 Q 25 108 20 100" stroke="#f39c12" strokeWidth="2.5" fill="none" opacity="0.7"/>
                                <path d="M 25 120 Q 30 113 25 105" stroke="#f39c12" strokeWidth="2.5" fill="none" opacity="0.7"/>
                                <path d="M 35 115 Q 40 108 35 100" stroke="#f39c12" strokeWidth="2.5" fill="none" opacity="0.7"/>
                                {/* Shoes */}
                                <ellipse cx="90" cy="280" rx="14" ry="6" fill="#2c3e50"/>
                                <ellipse cx="110" cy="280" rx="14" ry="6" fill="#2c3e50"/>
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3 className="feature-title-new">Become a Driver</h3>
                            <p className="feature-description">Share your daily commute and earn while helping others reach their destination</p>
                        </div>
                    </div>
                    
                    {/* Card 2 - Passenger with backpack */}
                    <div className="feature-card-new">
                        <div className="character-illustration">
                            <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
                                {/* Head */}
                                <circle cx="100" cy="70" r="38" fill="#ffd89b"/>
                                {/* Hair - ponytail style */}
                                <path d="M 62 60 Q 60 35 100 30 Q 140 35 138 60 L 135 75 L 65 75 Z" fill="#8b4513"/>
                                <ellipse cx="145" cy="70" rx="12" ry="20" fill="#8b4513"/>
                                {/* Eyes */}
                                <circle cx="86" cy="70" r="5" fill="#2c3e50"/>
                                <circle cx="114" cy="70" r="5" fill="#2c3e50"/>
                                {/* Smile */}
                                <path d="M 82 84 Q 100 94 118 84" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round"/>
                                {/* Neck */}
                                <rect x="88" y="102" width="24" height="18" fill="#ffd89b" rx="3"/>
                                {/* Body */}
                                <path d="M 70 120 L 68 200 L 82 200 L 82 270 L 98 270 L 98 200 L 102 200 L 102 270 L 118 270 L 118 200 L 132 200 L 130 120 Z" fill="#e74c3c"/>
                                {/* Backpack */}
                                <rect x="92" y="110" width="38" height="50" rx="6" fill="#2c3e50"/>
                                <rect x="98" y="118" width="26" height="38" rx="4" fill="#34495e"/>
                                <circle cx="106" cy="130" r="3" fill="#95a5a6"/>
                                <circle cx="116" cy="130" r="3" fill="#95a5a6"/>
                                <rect x="108" y="105" width="6" height="12" fill="#2c3e50" rx="2"/>
                                <rect x="116" y="105" width="6" height="12" fill="#2c3e50" rx="2"/>
                                {/* Arms */}
                                <path d="M 70 135 L 45 155" stroke="#e74c3c" strokeWidth="14" fill="none" strokeLinecap="round"/>
                                <circle cx="45" cy="155" r="10" fill="#ffd89b"/>
                                <path d="M 130 135 L 155 155" stroke="#e74c3c" strokeWidth="14" fill="none" strokeLinecap="round"/>
                                <circle cx="155" cy="155" r="10" fill="#ffd89b"/>
                                {/* Shoes */}
                                <ellipse cx="90" cy="280" rx="14" ry="6" fill="#2c3e50"/>
                                <ellipse cx="110" cy="280" rx="14" ry="6" fill="#2c3e50"/>
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3 className="feature-title-new">Find a Ride</h3>
                            <p className="feature-description">Travel comfortably with verified drivers and split costs on every journey</p>
                        </div>
                    </div>
                    
                    {/* Card 3 - Community group */}
                    <div className="feature-card-new">
                        <div className="character-illustration">
                            <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
                                {/* Person 1 - Left */}
                                <g transform="translate(-10, 20)">
                                    <circle cx="65" cy="110" r="28" fill="#ffd89b"/>
                                    <circle cx="58" cy="108" r="3" fill="#2c3e50"/>
                                    <circle cx="72" cy="108" r="3" fill="#2c3e50"/>
                                    <path d="M 58 118 Q 65 123 72 118" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                    <path d="M 50 138 L 48 195 L 58 195 L 58 245 L 65 245 L 65 195 L 72 195 L 72 245 L 79 245 L 79 195 L 82 195 L 80 138 Z" fill="#9b59b6"/>
                                    <path d="M 50 148 L 35 165" stroke="#9b59b6" strokeWidth="10" fill="none" strokeLinecap="round"/>
                                    <circle cx="35" cy="165" r="7" fill="#ffd89b"/>
                                    <path d="M 80 148 L 95 165" stroke="#9b59b6" strokeWidth="10" fill="none" strokeLinecap="round"/>
                                    <circle cx="95" cy="165" r="7" fill="#ffd89b"/>
                                    <ellipse cx="61" cy="253" rx="11" ry="5" fill="#2c3e50"/>
                                    <ellipse cx="75" cy="253" rx="11" ry="5" fill="#2c3e50"/>
                                </g>
                                
                                {/* Person 2 - Center (slightly forward) */}
                                <g transform="translate(0, 0)">
                                    <circle cx="100" cy="70" r="35" fill="#ffd89b"/>
                                    <path d="M 68 58 Q 72 35 100 32 Q 128 35 132 58" fill="#2c3e50"/>
                                    <circle cx="88" cy="68" r="4" fill="#2c3e50"/>
                                    <circle cx="112" cy="68" r="4" fill="#2c3e50"/>
                                    <path d="M 85 80 Q 100 88 115 80" stroke="#2c3e50" strokeWidth="2.5" fill="none"/>
                                    <path d="M 75 105 L 73 190 L 85 190 L 85 260 L 98 260 L 98 190 L 102 190 L 102 260 L 115 260 L 115 190 L 127 190 L 125 105 Z" fill="#2ecc71"/>
                                    <path d="M 75 120 L 50 145" stroke="#2ecc71" strokeWidth="12" fill="none" strokeLinecap="round"/>
                                    <circle cx="50" cy="145" r="9" fill="#ffd89b"/>
                                    <path d="M 125 120 L 150 145" stroke="#2ecc71" strokeWidth="12" fill="none" strokeLinecap="round"/>
                                    <circle cx="150" cy="145" r="9" fill="#ffd89b"/>
                                    <ellipse cx="91" cy="270" rx="13" ry="6" fill="#2c3e50"/>
                                    <ellipse cx="108" cy="270" rx="13" ry="6" fill="#2c3e50"/>
                                </g>
                                
                                {/* Person 3 - Right */}
                                <g transform="translate(10, 20)">
                                    <circle cx="135" cy="110" r="28" fill="#ffd89b"/>
                                    <circle cx="128" cy="108" r="3" fill="#2c3e50"/>
                                    <circle cx="142" cy="108" r="3" fill="#2c3e50"/>
                                    <path d="M 128 118 Q 135 123 142 118" stroke="#2c3e50" strokeWidth="2" fill="none"/>
                                    <path d="M 120 138 L 118 195 L 128 195 L 128 245 L 135 245 L 135 195 L 142 195 L 142 245 L 149 245 L 149 195 L 152 195 L 150 138 Z" fill="#f39c12"/>
                                    <path d="M 120 148 L 105 165" stroke="#f39c12" strokeWidth="10" fill="none" strokeLinecap="round"/>
                                    <circle cx="105" cy="165" r="7" fill="#ffd89b"/>
                                    <path d="M 150 148 L 165 165" stroke="#f39c12" strokeWidth="10" fill="none" strokeLinecap="round"/>
                                    <circle cx="165" cy="165" r="7" fill="#ffd89b"/>
                                    <ellipse cx="131" cy="253" rx="11" ry="5" fill="#2c3e50"/>
                                    <ellipse cx="145" cy="253" rx="11" ry="5" fill="#2c3e50"/>
                                </g>
                                
                                {/* Hearts connecting them */}
                                <path d="M 70 160 Q 100 155 130 160" stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeDasharray="6,4" opacity="0.7"/>
                                <path d="M 95 153 L 98 148 L 101 153 Q 103 155 101 157 L 98 160 L 95 157 Q 93 155 95 153 Z" fill="#e74c3c"/>
                                <path d="M 103 155 L 106 150 L 109 155 Q 111 157 109 159 L 106 162 L 103 159 Q 101 157 103 155 Z" fill="#e74c3c"/>
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3 className="feature-title-new">Join Community</h3>
                            <p className="feature-description">Meet amazing people and build lasting friendships on your daily commute</p>
                        </div>
                    </div>

                    {/* Card 4 - Destination with car */}
                    <div className="feature-card-new">
                        <div className="character-illustration">
                            <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
                                {/* Destination pin */}
                                <g transform="translate(0, -10)">
                                    <circle cx="100" cy="90" r="40" fill="#e74c3c" opacity="0.15"/>
                                    <circle cx="100" cy="90" r="28" fill="#e74c3c" opacity="0.3"/>
                                    <path d="M 100 55 Q 75 70 75 95 Q 75 115 100 145 Q 125 115 125 95 Q 125 70 100 55 Z" fill="#e74c3c"/>
                                    <circle cx="100" cy="90" r="12" fill="#fff"/>
                                    <path d="M 100 83 L 100 97" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M 93 90 L 107 90" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                                </g>
                                
                                {/* Connecting dotted line */}
                                <line x1="100" y1="145" x2="100" y2="170" stroke="#95a5a6" strokeWidth="3" strokeDasharray="8,6" strokeLinecap="round"/>
                                
                                {/* Road */}
                                <rect x="60" y="170" width="80" height="110" fill="#34495e" rx="5"/>
                                <rect x="95" y="185" width="10" height="18" fill="#f39c12"/>
                                <rect x="95" y="215" width="10" height="18" fill="#f39c12"/>
                                <rect x="95" y="245" width="10" height="18" fill="#f39c12"/>
                                
                                {/* Car */}
                                <g transform="translate(0, 0)">
                                    {/* Shadow */}
                                    <ellipse cx="100" cy="252" rx="38" ry="9" fill="rgba(0,0,0,0.2)"/>
                                    {/* Body */}
                                    <rect x="65" y="225" width="70" height="25" rx="10" fill="#3498db"/>
                                    {/* Top */}
                                    <path d="M 72 225 Q 88 200 100 200 Q 112 200 128 225" fill="#2980b9"/>
                                    {/* Windows */}
                                    <rect x="73" y="207" width="18" height="14" rx="3" fill="#ecf0f1" opacity="0.9"/>
                                    <rect x="109" y="207" width="18" height="14" rx="3" fill="#ecf0f1" opacity="0.9"/>
                                    {/* Wheels */}
                                    <circle cx="80" cy="250" r="10" fill="#2c3e50"/>
                                    <circle cx="80" cy="250" r="6" fill="#95a5a6"/>
                                    <circle cx="120" cy="250" r="10" fill="#2c3e50"/>
                                    <circle cx="120" cy="250" r="6" fill="#95a5a6"/>
                                    {/* Headlight */}
                                    <circle cx="132" cy="235" r="4" fill="#f39c12"/>
                                    {/* Door handle */}
                                    <rect x="95" y="235" width="8" height="3" rx="1.5" fill="#2c3e50"/>
                                </g>
                                
                                {/* Arrow showing movement */}
                                <g opacity="0.8">
                                    <path d="M 100 155 L 100 165" stroke="#2ecc71" strokeWidth="5" strokeLinecap="round"/>
                                    <path d="M 93 161 L 100 155 L 107 161" stroke="#2ecc71" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </g>
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3 className="feature-title-new">Any Destination</h3>
                            <p className="feature-description">Go wherever you need to be – work, home, or anywhere in between</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <Link to="/login" className="cta-button-new">
                    <span className="cta-icon">
                        <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor"/>
                        </svg>
                    </span>
                    <span className="cta-text">Start Your Journey Today</span>
                    <span className="cta-arrow">→</span>
                </Link>
            </section>
        </div>
    );
}

export default Home;
