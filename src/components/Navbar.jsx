import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <>
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
                <div className="container">
                    <a href="#" className="nav-logo">
                        <div className="nav-logo-icon">💊</div>
                        Pharma<span>Lite</span>
                    </a>

                    <div className="nav-links">
                        {navLinks.map(l => (
                            <a key={l.href} href={l.href}>{l.label}</a>
                        ))}
                    </div>

                    <div className="nav-actions">
                        <Link to="/login" className="nav-login">Log in</Link>
                        <Link to="/register" className="btn btn-primary">Get Started Free</Link>
                        <button
                            className={`hamburger${menuOpen ? ' open' : ''}`}
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Toggle menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
                {navLinks.map(l => (
                    <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
                ))}
                <Link to="/login" className="nav-login" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
            </div>
        </>
    )
}
