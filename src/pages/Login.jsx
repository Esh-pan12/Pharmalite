import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../pages/Auth.css'

const brandFeatures = [
    { icon: '📦', color: 'green', title: 'Real-time Inventory', desc: 'Track every medicine unit live' },
    { icon: '🔔', color: 'purple', title: 'Smart Expiry Alerts', desc: 'Never miss a near-expiry batch' },
    { icon: '📊', color: 'blue', title: 'Instant Sales Reports', desc: 'Daily & monthly analytics' },
]

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    const validate = () => {
        const e = {}
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Minimum 6 characters'
        return e
    }

    const handleChange = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        if (errors[field]) setErrors(err => ({ ...err, [field]: '' }))
        setAlert(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setAlert({ type: 'error', msg: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* ── Left Brand Panel ── */}
            <div className="auth-brand">
                <div className="auth-blob auth-blob-1" />
                <div className="auth-blob auth-blob-2" />

                <Link to="/" className="auth-brand-logo">
                    <div className="auth-brand-logo-icon">💊</div>
                    Pharma<span>Lite</span>
                </Link>

                <div className="auth-brand-center">
                    <h2 className="auth-brand-tagline">
                        Your pharmacy,<br />
                        <span className="text-gradient">smarter every day.</span>
                    </h2>
                    <p className="auth-brand-desc">
                        Join 500+ pharmacies managing their inventory, sales, and staff
                        with PharmaLite's all-in-one platform.
                    </p>
                    <div className="auth-features">
                        {brandFeatures.map((f, i) => (
                            <div className="auth-feature-pill" key={i}>
                                <div className={`auth-feature-pill-icon ${f.color}`}>{f.icon}</div>
                                <div className="auth-feature-pill-text">
                                    <strong>{f.title}</strong>
                                    <span>{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="auth-brand-footer">
                    {[['500+', 'Pharmacies'], ['50K+', 'Medicines Tracked'], ['99.9%', 'Uptime']].map(([v, l]) => (
                        <div className="auth-brand-stat" key={l}>
                            <div className="auth-brand-stat-value">{v}</div>
                            <div className="auth-brand-stat-label">{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="auth-form-panel">
                <p className="auth-switch-link">
                    Don't have an account?
                    <Link to="/register">Sign up free</Link>
                </p>

                <div className="auth-form-inner">
                    <h1 className="auth-form-title">Welcome back 👋</h1>
                    <p className="auth-form-subtitle">
                        Sign in to your PharmaLite account to continue.
                    </p>

                    {alert && (
                        <div className={`auth-alert ${alert.type}`}>
                            {alert.type === 'error' ? '⚠️' : '✅'} {alert.msg}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="form-input-wrap">
                                <span className="form-input-icon">✉️</span>
                                <input
                                    id="login-email"
                                    type="email"
                                    className={`form-input${errors.email ? ' error' : ''}`}
                                    placeholder="admin@pharmalite.com"
                                    value={form.email}
                                    onChange={handleChange('email')}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="form-input-wrap">
                                <span className="form-input-icon">🔒</span>
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    className={`form-input${errors.password ? ' error' : ''}`}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange('password')}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPw(v => !v)}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                        </div>

                        {/* Forgot */}
                        <div className="form-forgot">
                            <a href="#">Forgot password?</a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? <><span className="auth-spinner" /> Signing in…</>
                                : '🔓 Sign In to Dashboard'
                            }
                        </button>

                        {/* Divider */}
                        <div className="auth-divider">or continue with</div>

                        {/* OAuth */}
                        <div className="oauth-btns">
                            <button type="button" className="oauth-btn">
                                🌐 Google
                            </button>
                            <button type="button" className="oauth-btn">
                                🐙 GitHub
                            </button>
                        </div>
                    </form>

                    {/* Demo hint */}
                    <p style={{ marginTop: '24px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                        Demo: <strong style={{ color: 'var(--text-secondary)' }}>admin@pharmalite.com</strong> / <strong style={{ color: 'var(--text-secondary)' }}>Admin@123</strong>
                    </p>
                </div>
            </div>
        </div>
    )
}
