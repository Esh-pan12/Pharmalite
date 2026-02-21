import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../pages/Auth.css'

const brandFeatures = [
    { icon: '📦', color: 'green', title: 'Real-time Inventory', desc: 'Track every medicine unit live' },
    { icon: '🔔', color: 'purple', title: 'Smart Expiry Alerts', desc: 'Never miss a near-expiry batch' },
    { icon: '📊', color: 'blue', title: 'Instant Sales Reports', desc: 'Daily & monthly analytics' },
]

function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const map = [
        { label: '', color: 'transparent' },
        { label: 'Weak', color: '#f87171' },
        { label: 'Fair', color: '#fb923c' },
        { label: 'Good', color: '#facc15' },
        { label: 'Strong', color: 'var(--primary)' },
    ]
    return { score, ...map[score] }
}

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '',
        password: '', confirmPassword: '', agree: false,
    })
    const [errors, setErrors] = useState({})
    const [showPw, setShowPw] = useState(false)
    const [showCp, setShowCp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    const pwStrength = getPasswordStrength(form.password)

    const validate = () => {
        const e = {}
        if (!form.firstName.trim()) e.firstName = 'First name is required'
        if (!form.lastName.trim()) e.lastName = 'Last name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 8) e.password = 'Minimum 8 characters'
        else if (pwStrength.score < 2) e.password = 'Password is too weak'
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
        if (!form.agree) e.agree = 'You must accept the terms'
        return e
    }

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm(f => ({ ...f, [field]: value }))
        if (errors[field]) setErrors(err => ({ ...err, [field]: '' }))
        setAlert(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            await register({
                name: `${form.firstName} ${form.lastName}`,
                email: form.email,
                password: form.password,
            })
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
                        Start managing smarter,<br />
                        <span className="text-gradient">starting today.</span>
                    </h2>
                    <p className="auth-brand-desc">
                        Set up your pharmacy on PharmaLite in under 2 minutes.
                        No credit card required. Cancel anytime.
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
                    {[['Free', 'To Get Started'], ['2 min', 'Setup Time'], ['0', 'Budget Required']].map(([v, l]) => (
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
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                </p>

                <div className="auth-form-inner">
                    <h1 className="auth-form-title">Create your account ✨</h1>
                    <p className="auth-form-subtitle">
                        Get your pharmacy online in minutes — it's free.
                    </p>

                    {alert && (
                        <div className={`auth-alert ${alert.type}`} style={{ marginBottom: 16 }}>
                            {alert.type === 'error' ? '⚠️' : '✅'} {alert.msg}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {/* Name row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <div className="form-input-wrap">
                                    <span className="form-input-icon">👤</span>
                                    <input
                                        type="text"
                                        className={`form-input${errors.firstName ? ' error' : ''}`}
                                        placeholder="Arjun"
                                        value={form.firstName}
                                        onChange={handleChange('firstName')}
                                        autoComplete="given-name"
                                    />
                                </div>
                                {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <div className="form-input-wrap">
                                    <span className="form-input-icon">👤</span>
                                    <input
                                        type="text"
                                        className={`form-input${errors.lastName ? ' error' : ''}`}
                                        placeholder="Sharma"
                                        value={form.lastName}
                                        onChange={handleChange('lastName')}
                                        autoComplete="family-name"
                                    />
                                </div>
                                {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Work Email</label>
                            <div className="form-input-wrap">
                                <span className="form-input-icon">✉️</span>
                                <input
                                    type="email"
                                    className={`form-input${errors.email ? ' error' : ''}`}
                                    placeholder="you@yourpharmacy.com"
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
                                    type={showPw ? 'text' : 'password'}
                                    className={`form-input${errors.password ? ' error' : form.password && pwStrength.score >= 3 ? ' success' : ''}`}
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={handleChange('password')}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {form.password && (
                                <div className="pw-strength">
                                    <div className="pw-strength-bar">
                                        <div
                                            className="pw-strength-fill"
                                            style={{ width: `${(pwStrength.score / 4) * 100}%`, background: pwStrength.color }}
                                        />
                                    </div>
                                    <span className="pw-strength-label" style={{ color: pwStrength.color }}>
                                        {pwStrength.label}
                                    </span>
                                </div>
                            )}
                            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="form-input-wrap">
                                <span className="form-input-icon">🔐</span>
                                <input
                                    type={showCp ? 'text' : 'password'}
                                    className={`form-input${errors.confirmPassword ? ' error' : form.confirmPassword && form.confirmPassword === form.password ? ' success' : ''}`}
                                    placeholder="Repeat your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowCp(v => !v)} aria-label="Toggle confirm password">
                                    {showCp ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
                        </div>

                        {/* Terms */}
                        <div className="form-group">
                            <label className="form-check">
                                <input type="checkbox" checked={form.agree} onChange={handleChange('agree')} />
                                <span className="form-check-label">
                                    I agree to PharmaLite's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.agree && <span className="form-error">⚠ {errors.agree}</span>}
                        </div>

                        {/* Submit */}
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading
                                ? <><span className="auth-spinner" /> Creating account…</>
                                : '🚀 Create Free Account'
                            }
                        </button>

                        <div className="auth-divider">or sign up with</div>

                        <div className="oauth-btns">
                            <button type="button" className="oauth-btn">🌐 Google</button>
                            <button type="button" className="oauth-btn">🐙 GitHub</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
