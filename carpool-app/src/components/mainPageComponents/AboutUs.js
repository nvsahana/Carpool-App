import React from 'react'
import './AboutUs.css'

function AboutUs() {
    return (
        <div className="about-page">
            <div className="about-container">
                {/* Hero Section */}
                <div className="about-hero">
                    <div className="hero-badge">About Us</div>
                    <h1 className="about-title">Built with Purpose, Driven by Innovation</h1>
                    <p className="about-subtitle">
                        Transforming daily commutes into meaningful connections
                    </p>
                </div>

                {/* Mission Card */}
                <div className="about-card mission-card">
                    <div className="card-glow"></div>
                    <div className="card-shine"></div>
                    <div className="about-icon-wrapper">
                        <svg className="about-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="missionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff"/>
                                    <stop offset="100%" stopColor="#e0e0e0"/>
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="35" stroke="url(#missionGradient)" strokeWidth="4" fill="none"/>
                            <path d="M 50 20 L 50 50 L 70 65" stroke="url(#missionGradient)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                            <circle cx="50" cy="50" r="5" fill="url(#missionGradient)"/>
                        </svg>
                    </div>
                    <h2 className="card-title">The Problem I'm Solving</h2>
                    <p className="card-description">
                        Every day, millions of commuters across the state face the same challenges: sitting in endless traffic, 
                        watching empty carpool lanes fly by, and spending a fortune on daily transportation costs. The average 
                        commuter wastes hours in traffic and spends hundreds of dollars each month, wasting valuable time and money that could be better spent.
                    </p>
                    <p className="card-description">
                        Traditional carpooling solutions are complicated, force payment systems, or lack trust-building features. 
                        I knew there had to be a better way.
                    </p>
                </div>

                {/* Solution Card */}
                <div className="about-card solution-card">
                    <div className="card-glow"></div>
                    <div className="card-shine"></div>
                    <div className="about-icon-wrapper">
                        <svg className="about-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="solutionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff"/>
                                    <stop offset="100%" stopColor="#e5e5e5"/>
                                </linearGradient>
                            </defs>
                            <path d="M 30 70 L 30 50 Q 30 35 45 35 L 55 35 Q 70 35 70 50 L 70 70" 
                                  stroke="url(#solutionGradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                            <circle cx="40" cy="25" r="8" fill="url(#solutionGradient)"/>
                            <circle cx="60" cy="25" r="8" fill="url(#solutionGradient)"/>
                            <path d="M 25 75 L 75 75" stroke="url(#solutionGradient)" strokeWidth="5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className="card-title">My Solution</h2>
                    <p className="card-description">
                        This Carpool App is built on a simple philosophy: <strong>connect, don't complicate</strong>. I don't force 
                        payments or impose rigid structures. Instead, I focus on what matters most: helping genuine people find 
                        each other.
                    </p>
                    <div className="features-list">
                        <div className="feature-item">
                            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                            </svg>
                            <span>Connect with verified colleagues from your office</span>
                        </div>
                        <div className="feature-item">
                            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor"/>
                            </svg>
                            <span>Access carpool lanes and reduce travel time</span>
                        </div>
                        <div className="feature-item">
                            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
                            </svg>
                            <span>Split costs without bias</span>
                        </div>
                        <div className="feature-item">
                            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.67-2.08C6.38 20.73 7 21 7.72 21c1.66 0 2.86-1.37 2.86-3.03 0-.64-.22-1.23-.6-1.72-.12-.16-.24-.3-.38-.44 1.71-3.06 4.9-5.81 7.4-6.81V8z" fill="currentColor"/>
                                <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2 7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S12.33 11 11.5 11 10 10.33 10 9.5z" fill="currentColor"/>
                            </svg>
                            <span>Reduce your carbon footprint together</span>
                        </div>
                        <div className="feature-item">
                            <svg className="feature-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                            </svg>
                            <span>Build a community of trusted commuters</span>
                        </div>
                    </div>
                </div>

                {/* Creator Card */}
                <div className="about-card creator-card">
                    <div className="card-glow"></div>
                    <div className="card-shine"></div>
                    <div className="about-icon-wrapper">
                        <svg className="about-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="creatorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff"/>
                                    <stop offset="100%" stopColor="#ebebeb"/>
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="35" r="18" fill="url(#creatorGradient)"/>
                            <path d="M 25 70 Q 50 55 75 70 L 75 85 L 25 85 Z" fill="url(#creatorGradient)"/>
                            <rect x="35" y="52" width="30" height="3" fill="url(#creatorGradient)" rx="1.5"/>
                            <circle cx="45" cy="35" r="3" fill="rgba(102, 126, 234, 0.8)"/>
                            <circle cx="55" cy="35" r="3" fill="rgba(102, 126, 234, 0.8)"/>
                            <path d="M 43 42 Q 50 45 57 42" stroke="rgba(102, 126, 234, 0.8)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className="card-title">Meet the Creator</h2>
                    <p className="card-description">
                        Hi, I'm <strong>Sahana</strong>, a full-stack developer passionate about solving real-world challenges 
                        through technology. As someone who understands the daily commute struggle firsthand, I created this app 
                        to make a tangible difference in people's lives.
                    </p>
                    <p className="card-description">
                        I believe that the best solutions come from understanding real problems. This app isn't just about 
                        carpooling; it's about building trust, fostering community, and making our daily journeys more enjoyable 
                        and sustainable.
                    </p>
                    <p className="card-description">
                        Every feature you see here is designed with the commuter in mind: from easy ride matching to flexible 
                        cost-sharing arrangements. My goal is to help people leverage carpool lanes, save money, reduce stress, 
                        and maybe even make a few friends along the way.
                    </p>
                    <div className="creator-cta">
                        <p className="cta-text">Want to see more of my work?</p>
                        <a 
                            href="https://nvsahana.netlify.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="portfolio-link"
                        >
                            <span>Visit My Portfolio</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10H15M15 10L11 6M15 10L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Vision Card */}
                <div className="about-card vision-card">
                    <div className="card-glow"></div>
                    <div className="card-shine"></div>
                    <div className="about-icon-wrapper">
                        <svg className="about-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="visionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff"/>
                                    <stop offset="100%" stopColor="#e8e8e8"/>
                                </linearGradient>
                            </defs>
                            <polygon points="50,20 65,40 85,45 67,62 71,82 50,71 29,82 33,62 15,45 35,40" 
                                     fill="url(#visionGradient)"/>
                            <circle cx="50" cy="50" r="12" fill="rgba(102, 126, 234, 0.3)"/>
                        </svg>
                    </div>
                    <h2 className="card-title">My Vision</h2>
                    <p className="card-description">
                        I envision a future where commuting is no longer a solitary, stressful experience but a chance to connect, 
                        save, and contribute to a greener planet. Every carpool formed through this app is a step toward less traffic, 
                        cleaner air, and stronger communities.
                    </p>
                    <p className="card-description">
                        My goal is to make daily commutes more meaningful, transforming what used to be wasted time into opportunities 
                        for connection, cost savings, and environmental impact. Through this platform, I'm working to prove that 
                        technology can solve real problems and improve people's daily lives in tangible ways.
                    </p>
                </div>

                {/* Call to Action */}
                <div className="about-cta-section">
                    <div className="card-glow"></div>
                    <div className="card-shine"></div>
                    <h2 className="cta-title">Ready to Transform Your Commute?</h2>
                    <p className="cta-description">
                        Join thousands of commuters who are already saving time, money, and helping the environment.
                    </p>
                    <a href="/signup" className="cta-button">
                        Get Started Today
                    </a>
                </div>
            </div>
        </div>
    )
}

export default AboutUs
