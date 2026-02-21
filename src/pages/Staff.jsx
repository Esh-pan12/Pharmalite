import { Link } from 'react-router-dom'
import DashboardLayout from '../dashboard/DashboardLayout'
import './Stub.css'

export default function Staff() {
    return (
        <DashboardLayout title="Staff">
            <div className="dash-page-header">
                <div><h1>👤 Staff</h1><p>Manage pharmacy staff, roles, and access control.</p></div>
            </div>

            <div className="stub-page">
                <div className="stub-illustration">
                    <div className="stub-illustration-bg" style={{ background: '#3b82f6' }} />
                    <div className="stub-illustration-icon">👥</div>
                </div>

                <span className="stub-badge blue">🚧 In Development</span>

                <h2 className="stub-title">Staff Management<br />Coming Soon</h2>
                <p className="stub-desc">
                    Add and manage pharmacists, assistants, and billing staff with role-based
                    access control, activity logs, and shift scheduling.
                </p>

                <div className="stub-progress-wrap">
                    <div className="stub-progress-label">
                        <span>Development Progress</span><span>29%</span>
                    </div>
                    <div className="stub-progress-track">
                        <div className="stub-progress-bar" style={{ width: '29%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    </div>
                </div>

                <div className="stub-features">
                    {[
                        { icon: '🔐', label: 'Role-Based Access', sub: 'Admin, Pharmacist, Billing roles' },
                        { icon: '📋', label: 'Activity Logs', sub: 'Track every login, sale, and edit' },
                        { icon: '🕐', label: 'Shift Scheduling', sub: 'Manage rosters and working hours' },
                    ].map(f => (
                        <div className="stub-feature-card" key={f.label}>
                            <div className="stub-feature-icon">{f.icon}</div>
                            <div className="stub-feature-label">{f.label}</div>
                            <div className="stub-feature-sub">{f.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="stub-actions">
                    <Link to="/settings" className="btn btn-primary" style={{ padding: '11px 24px' }}>
                        ⚙️ Go to Settings
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '11px 24px' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
