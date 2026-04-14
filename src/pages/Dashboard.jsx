import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get } from '../api/client'
import '../dashboard/Dashboard.css'

const fmtINR = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`

function getStatus(stock, expiry, reorderLevel = 20) {
    const d = Math.ceil((new Date(expiry) - new Date()) / 86400000)
    if (d <= 0 || stock <= 0) return 'critical'
    if (d <= 30) return 'expiring'
    if (stock <= reorderLevel) return 'low'
    return 'good'
}

export default function Dashboard() {
    const { user } = useAuth()
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = user?.name?.split(' ')[0] ?? 'there'

    const [medStats, setMedStats] = useState(null)
    const [salesSum, setSalesSum] = useState(null)
    const [expiryMeds, setExpiryMeds] = useState([])
    const [quickInv, setQuickInv] = useState([])
    const [weekSales, setWeekSales] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const [mStats, sSum, expiry, inv, salesWeek] = await Promise.all([
                get('/api/medicines/stats'),
                get(`/api/sales/summary?from=${today.toISOString()}`),
                get('/api/medicines/expiry?days=90'),
                get('/api/medicines?limit=5&sort=stock'),
                get('/api/sales?limit=200'),
            ])
            setMedStats(mStats)
            setSalesSum(sSum)
            setExpiryMeds(expiry.medicines || [])
            setQuickInv(inv.medicines || [])

            // Build 7-day revenue chart from sales list
            const allSales = salesWeek.sales || []
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                const label = d.toLocaleDateString('en-IN', { weekday: 'short' })
                const rev = allSales
                    .filter(s => {
                        const sd = new Date(s.createdAt)
                        return sd.getDate() === d.getDate() && 
                               sd.getMonth() === d.getMonth() && 
                               sd.getFullYear() === d.getFullYear()
                    })
                    .reduce((sum, s) => sum + s.total, 0)
                return { label, value: rev, isToday: i === 6 }
            })
            setWeekSales(days)
        } catch (err) {
            console.error('Dashboard fetch error', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    const maxWeek = Math.max(...weekSales.map(d => d.value), 1)
    const weekTotal = weekSales.reduce((s, d) => s + d.value, 0)

    return (
        <DashboardLayout title="Dashboard">
            {/* ── Page header ── */}
            <div className="dash-page-header">
                <div>
                    <h1>{greeting}, {firstName} 👋</h1>
                    <p>Here's what's happening at your pharmacy today.</p>
                </div>
                <Link to="/sales" className="btn btn-primary" style={{ padding: '11px 22px', fontSize: '0.88rem', textDecoration: 'none' }}>
                    📊 View Sales
                </Link>
            </div>

            {/* ── Stats Cards ── */}
            <div className="stats-grid">
                {/* Total Stock */}
                <div className="stat-card green">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">💊</div>
                        {!loading && <span className="stat-card-trending up">↑ {medStats?.inStock ?? '—'} ok</span>}
                    </div>
                    <div>
                        <div className="stat-card-value">{loading ? '…' : (medStats?.total ?? '0')}</div>
                        <div className="stat-card-label">Total Medicines</div>
                        <div className="stat-card-sub">
                            {loading ? '' : `${medStats?.low ?? 0} low · ${medStats?.outOfStock ?? 0} out of stock`}
                        </div>
                    </div>
                </div>

                {/* Today's Revenue */}
                <div className="stat-card purple">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">💰</div>
                        {!loading && <span className="stat-card-trending up">↑ {salesSum?.txns ?? 0} txns</span>}
                    </div>
                    <div>
                        <div className="stat-card-value">{loading ? '…' : fmtINR(salesSum?.revenue ?? 0)}</div>
                        <div className="stat-card-label">Today's Revenue</div>
                        <div className="stat-card-sub">Avg ticket ₹{salesSum?.avgTicket ?? 0}</div>
                    </div>
                </div>

                {/* Expiry Alerts */}
                <div className="stat-card orange">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">⚠️</div>
                        {!loading && <span className="stat-card-trending down">≤ 90 days</span>}
                    </div>
                    <div>
                        <div className="stat-card-value">{loading ? '…' : expiryMeds.length}</div>
                        <div className="stat-card-label">Expiry Alerts</div>
                        <div className="stat-card-sub">{loading ? '' : `${medStats?.expired ?? 0} already expired`}</div>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="stat-card blue">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">📦</div>
                        {!loading && <span className="stat-card-trending down">{medStats?.critical ?? 0} critical</span>}
                    </div>
                    <div>
                        <div className="stat-card-value">{loading ? '…' : (medStats?.low ?? 0)}</div>
                        <div className="stat-card-label">Low Stock Items</div>
                        <div className="stat-card-sub">Need reorder soon</div>
                    </div>
                </div>
            </div>

            {/* ── Widgets row ── */}
            <div className="dash-widgets">
                {/* Weekly Sales Chart */}
                <div className="widget">
                    <div className="widget-header">
                        <span className="widget-title">📈 Weekly Sales Overview</span>
                        <span className="widget-badge">{fmtINR(weekTotal)} total</span>
                    </div>
                    <div className="chart-widget-bars">
                        {loading
                            ? Array.from({ length: 7 }, (_, i) => (
                                <div className="chart-col" key={i}>
                                    <div className="chart-col-bar-wrap">
                                        <div className="chart-col-bar" style={{ height: '30%', opacity: 0.3 }} />
                                    </div>
                                    <span className="chart-col-label">—</span>
                                </div>
                            ))
                            : weekSales.map((d, i) => (
                                <div className="chart-col" key={i}>
                                    <div className="chart-col-bar-wrap">
                                        <div
                                            className={`chart-col-bar${d.isToday ? ' active' : ''}`}
                                            style={{ height: `${(d.value / maxWeek) * 100}%` }}
                                            data-value={fmtINR(d.value)}
                                        />
                                    </div>
                                    <span className="chart-col-label">{d.label}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="chart-summary">
                        <div className="chart-summary-item">
                            <div className="chart-summary-val">{fmtINR(weekTotal)}</div>
                            <div className="chart-summary-label">Week Total</div>
                        </div>
                        <div className="chart-summary-item">
                            <div className="chart-summary-val">{fmtINR(salesSum?.revenue ?? 0)}</div>
                            <div className="chart-summary-label">Today</div>
                        </div>
                        <div className="chart-summary-item">
                            <div className="chart-summary-val">{salesSum?.txns ?? 0} txns</div>
                            <div className="chart-summary-label">Today</div>
                        </div>
                    </div>
                </div>

                {/* Expiry Alerts widget */}
                <div className="widget">
                    <div className="widget-header">
                        <span className="widget-title">⏳ Expiring Soon</span>
                        <span className="widget-badge">{expiryMeds.length} medicines</span>
                    </div>
                    <div className="activity-list">
                        {loading ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
                        ) : expiryMeds.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                ✅ No medicines expiring in 90 days
                            </div>
                        ) : expiryMeds.slice(0, 6).map(m => {
                            const days = Math.ceil((new Date(m.expiry) - new Date()) / 86400000)
                            const color = days <= 0 ? 'red' : days <= 30 ? 'orange' : 'green'
                            return (
                                <div className="activity-item" key={m._id}>
                                    <div className={`activity-dot ${color}`}>💊</div>
                                    <div className="activity-text">
                                        <div className="activity-title">{m.name}</div>
                                        <div className="activity-sub">Batch: {m.batch} · {m.stock} units</div>
                                    </div>
                                    <span className="activity-time" style={{ color: days <= 0 ? '#f87171' : days <= 30 ? '#fb923c' : 'var(--text-muted)' }}>
                                        {days <= 0 ? 'Expired' : `${days}d`}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Quick Inventory Snapshot ── */}
            <div className="widget" style={{ marginTop: '20px' }}>
                <div className="widget-header">
                    <span className="widget-title">💊 Low Stock Snapshot</span>
                    <Link to="/inventory" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        View All →
                    </Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Medicine', 'Category', 'Stock', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(loading ? [] : quickInv).slice(0, 5).map((item) => {
                                const st = getStatus(item.stock, item.expiry, item.reorderLevel)
                                return (
                                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border)', cursor: 'default' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {item.name}
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.batch}</div>
                                        </td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{item.category}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{item.stock} {item.unit}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '3px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                                ...(st === 'good'
                                                    ? { background: 'rgba(0,168,120,0.12)', color: 'var(--primary)' }
                                                    : st === 'low'
                                                        ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c' }
                                                        : { background: 'rgba(248,113,113,0.12)', color: '#f87171' }),
                                            }}>
                                                {st === 'good' ? '✓ Good' : st === 'low' ? '⚡ Low' : '🔴 Critical'}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && quickInv.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No medicines in inventory yet.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}
