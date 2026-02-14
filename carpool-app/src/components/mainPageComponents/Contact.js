import React from 'react';
import './Contact.css';

function Contact() {
    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-header">
                    <h1>Get in Touch</h1>
                    <p>We'd love to hear from you</p>
                </div>

                <div className="contact-content">
                    <div className="contact-card">
                        <div className="contact-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <h2>Contact Us</h2>
                        <p className="contact-description">
                            If you have any feedback, questions, or wish to connect, feel free to reach out!
                        </p>
                        <a 
                            href="mailto:nvsahana1920@outlook.com" 
                            className="contact-email"
                        >
                            <i className="fas fa-paper-plane"></i>
                            nvsahana1920@outlook.com
                        </a>
                    </div>

                    <div className="contact-info-cards">
                        <div className="info-card">
                            <i className="fas fa-comments"></i>
                            <h3>Feedback</h3>
                            <p>Share your thoughts to help us improve</p>
                        </div>
                        <div className="info-card">
                            <i className="fas fa-question-circle"></i>
                            <h3>Questions</h3>
                            <p>We're here to help with any queries</p>
                        </div>
                        <div className="info-card">
                            <i className="fas fa-handshake"></i>
                            <h3>Connect</h3>
                            <p>Let's collaborate and build together</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
