import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="copyright">
                    © {currentYear} Sahana_Narasipura_Vasudevarao. All rights reserved.
                </div>
                
                <div className="social-links">
                    <a 
                        href="https://linkedin.com/in/your-linkedin" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <i className="fab fa-linkedin"></i>
                        LinkedIn
                    </a>
                    
                    <a 
                        href="https://github.com/nvsahana" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <i className="fab fa-github"></i>
                        GitHub
                    </a>
                    
                    <a 
                        href="https://your-portfolio-url.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <i className="fas fa-user-circle"></i>
                        Portfolio
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;