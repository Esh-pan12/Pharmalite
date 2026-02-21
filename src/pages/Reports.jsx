import { Link } from 'react-router-dom'
import DashboardLayout from '../dashboard/DashboardLayout'
import './Stub.css'

export default function Reports() {
    return (
        <DashboardLayout title="Reports">
            <div className="dash-page-header">
                <div><h1>📑 Reports</h1><p>Advanced analytics and export tools.</p></div>
            </div>

            <div className="stub-page">
                <div className="stub-illustration">
                    <div className="stub-illustration-bg" style={{ background: 'var(--primary)' }} />
                    <div className="stub-illustration-icon">📑</div>
                </div>

                <span className="stub-badge green">🚧 In Development</span>

                <h2 className="stub-title">Advanced Reports<br />Coming Soon</h2>
                <p className="stub-desc">
                    We're building a powerful reporting suite with customisable date ranges,
                    exportable PDFs, and deep-dive analytics for sales, inventory, and staff performance.
                </p>

                <div className="stub-progress-wrap">
                    <div className="stub-progress-label">
                        <span>Development Progress</span><span>68%</span>
                    </div>
                    <div className="stub-progress-track">
                        <div className="stub-progress-bar" style={{ width: '68%' }} />
                    </div>
                </div>

                <div className="stub-features">
                    {[
                        { icon: '📈', label: 'Revenue Charts', sub: 'Daily, weekly, monthly, yearly trends' },
                        { icon: '📦', label: 'Stock Reports', sub: 'Turnover, dead stock, wastage analysis' },
                        { icon: '⬇️', label: 'PDF / CSV Export', sub: 'One-click export to any format' },
                    ].map(f => (
                        <div className="stub-feature-card" key={f.label}>
                            <div className="stub-feature-icon">{f.icon}</div>
                            <div className="stub-feature-label">{f.label}</div>
                            <div className="stub-feature-sub">{f.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="stub-actions">
                    <Link to="/sales" className="btn btn-primary" style={{ padding: '11px 24px' }}>
                        📊 View Sales Now
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '11px 24px' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
