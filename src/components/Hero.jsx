import { Link } from 'react-router-dom'
import './Hero.css'

const chartHeights = [30, 50, 40, 70, 55, 80, 65, 90, 75, 60, 85, 100]

export default function Hero() {
    return (
        <section className="hero" id="hero">
            {/* Background blobs */}
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="container">
                {/* ── Left: Copy ── */}
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot">✨</span>
                        Now with AI-powered expiry alerts
                    </div>

                    <h1 className="hero-title">
                        The <span className="text-gradient">Smart Way</span> to
                        <br />Manage Your Pharmacy
                    </h1>

                    <p className="hero-desc">
                        PharmaLite helps independent pharmacies modernize their operations —
                        track inventory, monitor expiry dates, manage staff, and grow revenue
                        from one clean dashboard.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary">
                            🚀 Start Free Trial
                        </Link>
                        <Link to="/login" className="btn btn-outline">
                            ▶ Sign In
                        </Link>
                    </div>

                    <div className="hero-trust">
                        <div className="hero-avatars">
                            {['AR', 'PK', 'MS', 'NR'].map((initials, i) => (
                                <div key={i} className="hero-avatar" style={{ background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)' }}>
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <p className="hero-trust-text">
                            Trusted by <strong>500+ pharmacies</strong> across India
                        </p>
                    </div>
                </div>

                {/* ── Right: Dashboard Visual ── */}
                <div className="hero-visual">
                    {/* Floating badges */}
                    <div className="hero-float-badge badge-1">
                        <span className="badge-icon">📦</span>
                        <div>
                            <div className="badge-value">1,284</div>
                            <div className="badge-label">Items in Stock</div>
                        </div>
                    </div>
                    <div className="hero-float-badge badge-2">
                        <span className="badge-icon">⚡</span>
                        <div>
                            <div className="badge-value">99.9%</div>
                            <div className="badge-label">Uptime</div>
                        </div>
                    </div>

                    <div className="hero-dashboard">
                        <div className="dashboard-header">
                            <div className="dashboard-dots">
                                <span /><span /><span />
                            </div>
                            <span className="dashboard-title">PHARMALITE DASHBOARD</span>
                            <span className="dashboard-title">Today</span>
                        </div>

                        <div className="dashboard-stats">
                            <div className="dash-stat">
                                <div className="dash-stat-icon">💊</div>
                                <div className="dash-stat-value">1,284</div>
                                <div className="dash-stat-label">Total Items</div>
                            </div>
                            <div className="dash-stat">
                                <div className="dash-stat-icon">💰</div>
                                <div className="dash-stat-value">₹48k</div>
                                <div className="dash-stat-label">Today's Sales</div>
                            </div>
                            <div className="dash-stat">
                                <div className="dash-stat-icon">⚠️</div>
                                <div className="dash-stat-value">7</div>
                                <div className="dash-stat-label">Expiry Alerts</div>
                            </div>
                        </div>

                        <div className="dashboard-chart">
                            <div className="chart-label">WEEKLY SALES OVERVIEW</div>
                            <div className="chart-bars">
                                {chartHeights.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`chart-bar${i === chartHeights.length - 3 ? ' active' : ''}`}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-alerts">
                            <div className="dash-alert">
                                <div className="dash-alert-dot" style={{ background: '#f59e0b' }} />
                                <span>Paracetamol 500mg – expires in 14 days</span>
                            </div>
                            <div className="dash-alert">
                                <div className="dash-alert-dot" style={{ background: '#10b981' }} />
                                <span>Restocked: Amoxicillin 250mg · +200 units</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
