import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { put, post } from '../api/client'
import DashboardLayout from '../dashboard/DashboardLayout'
import './Settings.css'

/* ── Nav tabs ────────────────────────────────────────────── */
const NAV = [
    { key: 'profile', icon: '👤', label: 'Profile' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
    { key: 'security', icon: '🔒', label: 'Security' },
    { key: 'appearance', icon: '🎨', label: 'Appearance' },
]

/* ── Toast helper ────────────────────────────────────────── */
function Toast({ msg, type }) {
    if (!msg) return null
    return (
        <div className={`settings-toast ${type}`}>
            {type === 'success' ? '✅' : '❌'} {msg}
        </div>
    )
}

/* ── Toggle helper ───────────────────────────────────────── */
function Toggle({ checked, onChange }) {
    return (
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="toggle-track" />
        </label>
    )
}

/* ── Profile Tab ─────────────────────────────────────────── */
function ProfileTab({ user, onUserUpdate }) {
    const [form, setForm] = useState({
        firstName: user?.name?.split(' ')[0] ?? '',
        lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        pharmacy: user?.pharmacyName ?? '',
        license: user?.licenseNo ?? '',
        address: user?.address ?? '',
        city: user?.city ?? '',
        state: user?.state ?? '',
        pincode: user?.pincode ?? '',
    })
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const initials = ((form.firstName[0] ?? '') + (form.lastName[0] ?? '')).toUpperCase() || user?.name?.[0]?.toUpperCase() || 'PL'

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await put('/api/auth/me', {
                name: `${form.firstName} ${form.lastName}`.trim(),
                phone: form.phone,
                pharmacyName: form.pharmacy,
                licenseNo: form.license,
                address: form.address,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
            })
            onUserUpdate(data?.user)
            showToast('Profile saved successfully!')
        } catch (err) {
            showToast(err.message || 'Failed to save profile.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setForm({
            firstName: user?.name?.split(' ')[0] ?? '',
            lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? '',
            pharmacy: user?.pharmacyName ?? '',
            license: user?.licenseNo ?? '',
            address: user?.address ?? '',
            city: user?.city ?? '',
            state: user?.state ?? '',
            pincode: user?.pincode ?? '',
        })
    }

    return (
        <>
            <Toast msg={toast?.msg} type={toast?.type} />

            {/* Avatar card */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Profile Photo</div>
                    <div className="settings-card-sub">Your avatar shows your initials until a photo is uploaded</div>
                </div>
                <div className="settings-card-body">
                    <div className="avatar-section">
                        <div className="avatar-wrap">
                            <div className="avatar-large">{initials}</div>
                        </div>
                        <div className="avatar-info">
                            <h3>{form.firstName} {form.lastName}</h3>
                            <p>{form.email}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user?.role ?? 'admin'} · {form.pharmacy || 'No pharmacy set'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal info card */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Personal Information</div>
                    <div className="settings-card-sub">Update your name, contact details, and pharmacy info</div>
                </div>
                <div className="settings-card-body">
                    <div className="settings-form">
                        <div className="settings-form-row">
                            <div className="sf-group">
                                <label className="sf-label">First Name</label>
                                <input className="sf-input" value={form.firstName} onChange={set('firstName')} placeholder="First name" />
                            </div>
                            <div className="sf-group">
                                <label className="sf-label">Last Name</label>
                                <input className="sf-input" value={form.lastName} onChange={set('lastName')} placeholder="Last name" />
                            </div>
                        </div>

                        <div className="settings-form-row">
                            <div className="sf-group">
                                <label className="sf-label">Email Address</label>
                                <input className="sf-input" type="email" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                <span className="sf-hint">Email cannot be changed</span>
                            </div>
                            <div className="sf-group">
                                <label className="sf-label">Phone Number</label>
                                <input className="sf-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div className="settings-form-row">
                            <div className="sf-group">
                                <label className="sf-label">Role</label>
                                <input className="sf-input" value={user?.role ?? 'admin'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                <span className="sf-hint">Managed by account administrator</span>
                            </div>
                            <div className="sf-group">
                                <label className="sf-label">Drug License No.</label>
                                <input className="sf-input" value={form.license} onChange={set('license')} placeholder="e.g. DL-2024-MH-00482" />
                            </div>
                        </div>

                        <div className="settings-form-row full">
                            <div className="sf-group">
                                <label className="sf-label">Pharmacy Name</label>
                                <input className="sf-input" value={form.pharmacy} onChange={set('pharmacy')} placeholder="e.g. City Medical Store" />
                            </div>
                        </div>

                        <div className="settings-form-row full">
                            <div className="sf-group">
                                <label className="sf-label">Street Address</label>
                                <input className="sf-input" value={form.address} onChange={set('address')} placeholder="e.g. 34, MG Road, Andheri West" />
                            </div>
                        </div>

                        <div className="settings-form-row">
                            <div className="sf-group">
                                <label className="sf-label">City</label>
                                <input className="sf-input" value={form.city} onChange={set('city')} placeholder="e.g. Mumbai" />
                            </div>
                            <div className="sf-group">
                                <label className="sf-label">State</label>
                                <input className="sf-input" value={form.state} onChange={set('state')} placeholder="e.g. Maharashtra" />
                            </div>
                        </div>

                        <div className="settings-form-footer">
                            <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }} onClick={handleDiscard} disabled={saving}>Discard</button>
                            <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }} onClick={handleSave} disabled={saving}>
                                {saving ? <><span className="auth-spinner" /> Saving…</> : '💾 Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

/* ── Notifications Tab ───────────────────────────────────── */
const NOTIF_DEFAULTS = {
    expiry_push: true, expiry_email: true,
    low_stock_push: true, low_stock_email: false,
    sales_daily: true, sales_weekly: true,
    staff_login: false, system_updates: true, marketing: false,
}
const NOTIF_KEY = 'pharmalite_notif_prefs'

function NotificationsTab() {
    const [prefs, setPrefs] = useState(() => {
        try { return { ...NOTIF_DEFAULTS, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') } }
        catch { return NOTIF_DEFAULTS }
    })
    const [saved, setSaved] = useState(false)

    const set = k => v => setPrefs(p => ({ ...p, [k]: v }))

    const handleSave = () => {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const groups = [
        {
            title: '💊 Inventory Alerts',
            rows: [
                { key: 'expiry_push', title: 'Expiry Alerts — Push', sub: 'Browser notification when medicines near expiry' },
                { key: 'expiry_email', title: 'Expiry Alerts — Email', sub: 'Daily digest of medicines expiring within 30 days' },
                { key: 'low_stock_push', title: 'Low Stock — Push', sub: 'Alert when stock falls below reorder threshold' },
                { key: 'low_stock_email', title: 'Low Stock — Email', sub: 'Weekly report of low-stock items' },
            ],
        },
        {
            title: '📊 Reports',
            rows: [
                { key: 'sales_daily', title: 'Daily Sales Summary', sub: 'End-of-day revenue and transaction count' },
                { key: 'sales_weekly', title: 'Weekly Report Email', sub: 'Every Monday — week-in-review digest' },
            ],
        },
        {
            title: '⚙️ System',
            rows: [
                { key: 'staff_login', title: 'Staff Login Alerts', sub: 'Notify when staff members sign in' },
                { key: 'system_updates', title: 'System Updates', sub: 'New features and maintenance windows' },
                { key: 'marketing', title: 'Tips & Newsletters', sub: 'Product news and pharmacy management tips' },
            ],
        },
    ]

    return (
        <>
            {groups.map(g => (
                <div className="settings-card" key={g.title}>
                    <div className="settings-card-header">
                        <div className="settings-card-title">{g.title}</div>
                    </div>
                    <div className="settings-card-body">
                        <div className="toggle-list">
                            {g.rows.map(r => (
                                <div className="toggle-row" key={r.key}>
                                    <div className="toggle-info">
                                        <div className="toggle-title">{r.title}</div>
                                        <div className="toggle-sub">{r.sub}</div>
                                    </div>
                                    <Toggle checked={prefs[r.key]} onChange={set(r.key)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }} onClick={handleSave}>
                    {saved ? '✅ Preferences Saved!' : '💾 Save Preferences'}
                </button>
            </div>
        </>
    )
}

/* ── Security Tab ────────────────────────────────────────── */
function SecurityTab() {
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConf, setShowConf] = useState(false)
    const [pw, setPw] = useState({ old: '', new: '', conf: '' })
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const handleChange = async () => {
        if (!pw.old || !pw.new || !pw.conf) return showToast('All password fields are required.', 'error')
        if (pw.new !== pw.conf) return showToast('New passwords do not match.', 'error')
        if (pw.new.length < 6) return showToast('New password must be at least 6 characters.', 'error')

        setSaving(true)
        try {
            await post('/api/auth/change-password', { currentPassword: pw.old, newPassword: pw.new })
            showToast('Password updated successfully!')
            setPw({ old: '', new: '', conf: '' })
        } catch (err) {
            showToast(err.message || 'Failed to update password.', 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Toast msg={toast?.msg} type={toast?.type} />

            {/* Status cards */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Security Overview</div>
                    <div className="settings-card-sub">Current security status of your account</div>
                </div>
                <div className="settings-card-body">
                    {[
                        { icon: '🔐', cls: 'green', title: 'Password', sub: 'Password-based authentication is active', status: 'Set', statusCls: 'on' },
                        { icon: '📱', cls: 'blue', title: 'Two-Factor Auth (2FA)', sub: 'Adds a second layer of security', status: 'Disabled', statusCls: 'off' },
                        { icon: '🔑', cls: 'orange', title: 'Active Sessions', sub: 'JWT-based session — 7 day token lifetime', status: 'Active', statusCls: 'on' },
                    ].map(s => (
                        <div className="security-item" key={s.title}>
                            <div className={`security-icon ${s.cls}`}>{s.icon}</div>
                            <div className="security-info">
                                <div className="security-title">{s.title}</div>
                                <div className="security-sub">{s.sub}</div>
                            </div>
                            <span className={`security-status ${s.statusCls}`}>{s.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change password */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Change Password</div>
                    <div className="settings-card-sub">Use a strong password with at least 6 characters</div>
                </div>
                <div className="settings-card-body">
                    <div className="settings-form">
                        <div className="settings-form-row full">
                            <div className="sf-group">
                                <label className="sf-label">Current Password</label>
                                <div className="sf-input-wrap">
                                    <input className="sf-input" type={showOld ? 'text' : 'password'} placeholder="Enter current password" value={pw.old} onChange={e => setPw(p => ({ ...p, old: e.target.value }))} />
                                    <button className="sf-eye-btn" onClick={() => setShowOld(v => !v)} type="button">{showOld ? '🙈' : '👁'}</button>
                                </div>
                            </div>
                        </div>
                        <div className="settings-form-row">
                            <div className="sf-group">
                                <label className="sf-label">New Password</label>
                                <div className="sf-input-wrap">
                                    <input className="sf-input" type={showNew ? 'text' : 'password'} placeholder="Min 6 characters" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} />
                                    <button className="sf-eye-btn" onClick={() => setShowNew(v => !v)} type="button">{showNew ? '🙈' : '👁'}</button>
                                </div>
                            </div>
                            <div className="sf-group">
                                <label className="sf-label">Confirm New Password</label>
                                <div className="sf-input-wrap">
                                    <input className="sf-input" type={showConf ? 'text' : 'password'} placeholder="Re-enter new password" value={pw.conf} onChange={e => setPw(p => ({ ...p, conf: e.target.value }))} />
                                    <button className="sf-eye-btn" onClick={() => setShowConf(v => !v)} type="button">{showConf ? '🙈' : '👁'}</button>
                                </div>
                            </div>
                        </div>
                        <div className="settings-form-footer">
                            <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }} onClick={handleChange} disabled={saving}>
                                {saving ? <><span className="auth-spinner" /> Updating…</> : '🔒 Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

/* ── Appearance Tab ──────────────────────────────────────── */
const ACCENT_COLORS = [
    { hex: '#00A878', name: 'Emerald' },
    { hex: '#7C3AED', name: 'Violet' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#06b6d4', name: 'Cyan' },
]

function AppearanceTab() {
    const { theme, toggleTheme } = useTheme()
    const [accent, setAccent] = useState(() => localStorage.getItem('pharmalite_accent') || '#00A878')
    const [saved, setSaved] = useState(false)

    // Apply accent color live via CSS variable
    useEffect(() => {
        document.documentElement.style.setProperty('--primary', accent)
    }, [accent])

    const handleSaveAccent = () => {
        localStorage.setItem('pharmalite_accent', accent)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    return (
        <>
            {/* Theme */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Theme</div>
                    <div className="settings-card-sub">Choose how PharmaLite looks. Preference is saved automatically.</div>
                </div>
                <div className="settings-card-body">
                    <div className="appearance-grid">
                        {[
                            { key: 'dark', label: 'Dark', sub: 'Default · easy on eyes', icon: '🌙' },
                            { key: 'light', label: 'Light', sub: 'Classic light mode', icon: '☀️' },
                        ].map(t => (
                            <div
                                key={t.key}
                                className={`appearance-card${theme === t.key ? ' selected' : ''}`}
                                onClick={() => { if (theme !== t.key) toggleTheme() }}
                            >
                                <div className={`appearance-preview ${t.key}`}>{t.icon}</div>
                                <div className="appearance-label">{t.label}</div>
                                <div className="appearance-sub">{t.sub}</div>
                                {theme === t.key && <div className="appearance-check">✓</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Accent Color */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-title">Accent Color</div>
                    <div className="settings-card-sub">Primary colour used for buttons, links, and highlights</div>
                </div>
                <div className="settings-card-body">
                    <div className="color-picker">
                        {ACCENT_COLORS.map(c => (
                            <div
                                key={c.hex}
                                className={`color-dot${accent === c.hex ? ' selected' : ''}`}
                                style={{ background: c.hex }}
                                onClick={() => setAccent(c.hex)}
                                title={c.name}
                            />
                        ))}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '14px' }}>
                        Selected: <strong style={{ color: accent }}>{ACCENT_COLORS.find(c => c.hex === accent)?.name ?? accent}</strong>
                        <code style={{ color: 'var(--text-primary)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>{accent}</code>
                    </p>
                    <div style={{ marginTop: '16px' }}>
                        <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }} onClick={handleSaveAccent}>
                            {saved ? '✅ Accent Saved!' : '🎨 Apply Accent'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

/* ── Main Component ───────────────────────────────────────── */
export default function Settings() {
    const { user, logout, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')

    const handleUserUpdate = (updatedUser) => {
        if (updatedUser) refreshUser()
    }

    const tabContent = {
        profile: <ProfileTab user={user} onUserUpdate={handleUserUpdate} />,
        notifications: <NotificationsTab />,
        security: <SecurityTab />,
        appearance: <AppearanceTab />,
    }

    return (
        <DashboardLayout title="Settings">
            <div className="dash-page-header">
                <div>
                    <h1>⚙️ Profile & Settings</h1>
                    <p>Manage your account, notifications, and preferences.</p>
                </div>
            </div>

            <div className="settings-layout">
                {/* Sidebar nav */}
                <nav className="settings-nav">
                    {NAV.map(n => (
                        <button
                            key={n.key}
                            className={`settings-nav-item${activeTab === n.key ? ' active' : ''}`}
                            onClick={() => setActiveTab(n.key)}
                        >
                            <span className="settings-nav-icon">{n.icon}</span>
                            {n.label}
                        </button>
                    ))}
                    <div className="settings-nav-divider" />
                    <button
                        className="settings-nav-item danger"
                        onClick={() => { logout(); navigate('/login') }}
                    >
                        <span className="settings-nav-icon">🚪</span>
                        Sign Out
                    </button>
                </nav>

                {/* Tab panels */}
                <div className="settings-panel">
                    {tabContent[activeTab]}
                </div>
            </div>
        </DashboardLayout>
    )
}
