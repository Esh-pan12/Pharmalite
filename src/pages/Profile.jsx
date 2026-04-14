import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { put } from '../api/client'
import DashboardLayout from '../dashboard/DashboardLayout'
import './Settings.css' // Reuse Settings CSS for now to maintain layout

function Toast({ msg, type }) {
    if (!msg) return null
    return (
        <div className={`settings-toast ${type}`}>
            {type === 'success' ? '✅' : '❌'} {msg}
        </div>
    )
}

export default function Profile() {
    const { user, refreshUser } = useAuth()
    
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
            if (data?.user) refreshUser()
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
        <DashboardLayout title="My Profile">
            <div className="dash-page-header">
                <div>
                    <h1>👤 My Profile</h1>
                    <p>Manage your personal information and pharmacy details.</p>
                </div>
            </div>

            <div className="settings-layout" style={{ display: 'block' }}>
                <Toast msg={toast?.msg} type={toast?.type} />

                {/* Avatar card */}
                <div className="settings-card" style={{ marginBottom: 24 }}>
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
            </div>
        </DashboardLayout>
    )
}
