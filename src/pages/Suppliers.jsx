import { Link } from 'react-router-dom'
import DashboardLayout from '../dashboard/DashboardLayout'
import './Stub.css'

export default function Suppliers() {
    return (
        <DashboardLayout title="Suppliers">
            <div className="dash-page-header">
                <div><h1>📦 Suppliers</h1><p>Manage your medicine suppliers and purchase orders.</p></div>
            </div>

            <div className="stub-page">
                <div className="stub-illustration">
                    <div className="stub-illustration-bg" style={{ background: '#7C3AED' }} />
                    <div className="stub-illustration-icon">📦</div>
                </div>

                <span className="stub-badge purple">🚧 In Development</span>

                <h2 className="stub-title">Supplier Management<br />Coming Soon</h2>
                <p className="stub-desc">
                    Track your wholesale distributors, raise purchase orders, compare prices,
                    and set automatic reorder triggers — all in one place.
                </p>

                <div className="stub-progress-wrap">
                    <div className="stub-progress-label">
                        <span>Development Progress</span><span>41%</span>
                    </div>
                    <div className="stub-progress-track">
                        <div className="stub-progress-bar" style={{ width: '41%', background: 'var(--gradient-accent)' }} />
                    </div>
                </div>

                <div className="stub-features">
                    {[
                        { icon: '🏭', label: 'Supplier Directory', sub: 'GST, contact, payment terms on record' },
                        { icon: '📋', label: 'Purchase Orders', sub: 'Create, track, and receive POs' },
                        { icon: '🔔', label: 'Auto Reorder', sub: 'Set low-stock triggers per supplier' },
                    ].map(f => (
                        <div className="stub-feature-card" key={f.label}>
                            <div className="stub-feature-icon">{f.icon}</div>
                            <div className="stub-feature-label">{f.label}</div>
                            <div className="stub-feature-sub">{f.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="stub-actions">
                    <Link to="/inventory" className="btn btn-primary" style={{ padding: '11px 24px' }}>
                        💊 View Inventory
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '11px 24px' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
