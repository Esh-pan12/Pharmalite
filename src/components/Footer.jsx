import './Footer.css'

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About Us', 'Blog', 'Careers', 'Press Kit'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
}

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">💊</div>
                            Pharma<span>Lite</span>
                        </div>
                        <p className="footer-tagline">
                            The smart, modern pharmacy management system built for independent pharmacies across India.
                        </p>
                        <div className="footer-social">
                            {[
                                { icon: '𝕏', label: 'Twitter' },
                                { icon: '💼', label: 'LinkedIn' },
                                { icon: '🐙', label: 'GitHub' },
                                { icon: '📸', label: 'Instagram' },
                            ].map(s => (
                                <a key={s.label} href="#" className="social-btn" aria-label={s.label}>
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([col, links]) => (
                        <div key={col}>
                            <div className="footer-col-title">{col}</div>
                            <ul className="footer-links">
                                {links.map(l => (
                                    <li key={l}><a href="#">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} PharmaLite. All rights reserved. Made with ❤️ in India.
                    </p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
