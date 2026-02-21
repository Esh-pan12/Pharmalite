import { useState } from 'react'
import './CTA.css'

export default function CTA() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (email.trim()) setSubmitted(true)
    }

    return (
        <section className="cta-section" id="contact">
            <div className="container">
                <div className="cta-inner">
                    <div className="cta-content">
                        <div className="section-label" style={{ margin: '0 auto 20px', display: 'inline-flex' }}>
                            ✦ Get Started
                        </div>
                        <h2 className="cta-title">
                            Ready to modernize<br />
                            your <span className="text-gradient">pharmacy?</span>
                        </h2>
                        <p className="cta-desc">
                            Join 500+ pharmacies already using PharmaLite.
                            No credit card required — just your email to start.
                        </p>

                        {!submitted ? (
                            <>
                                <form className="cta-form" onSubmit={handleSubmit}>
                                    <input
                                        className="cta-input"
                                        type="email"
                                        placeholder="Enter your work email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        🚀 Start Free Trial
                                    </button>
                                </form>
                                <p className="cta-note">
                                    By signing up, you agree to our{' '}
                                    <a href="#">Terms of Service</a> and{' '}
                                    <a href="#">Privacy Policy</a>.
                                </p>
                            </>
                        ) : (
                            <div style={{ marginTop: '8px' }}>
                                <div className="section-label" style={{ margin: '0 auto', display: 'inline-flex', background: 'rgba(0,168,120,0.2)', fontSize: '1rem', padding: '12px 24px' }}>
                                    🎉 You're on the list! We'll be in touch soon.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
