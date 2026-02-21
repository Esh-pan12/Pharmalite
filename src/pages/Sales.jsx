import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get, post } from '../api/client'
import './Sales.css'

/* ── Helpers ──────────────────────────────────────────────── */
const fmtINR = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
const PAGE_SIZE = 10

const PERIOD_MAP = { Today: 'today', Week: 'week', Month: 'month', 'All Time': 'all' }

/* ── Category donut (pure SVG, static breakdown) ─────────── */
const CATEGORIES = [
    { name: 'Antibiotics', pct: 28, color: '#00A878' },
    { name: 'Diabetes', pct: 24, color: '#7C3AED' },
    { name: 'Supplements', pct: 18, color: '#3b82f6' },
    { name: 'Analgesics', pct: 14, color: '#f59e0b' },
    { name: 'Others', pct: 16, color: '#64748b' },
]

function DonutChart({ weekTotal }) {
    const R = 70; const cx = 80; const cy = 80
    const circumference = 2 * Math.PI * R
    let offset = 0
    const slices = CATEGORIES.map(c => {
        const dasharray = (c.pct / 100) * circumference
        const dashoffset = circumference - offset
        offset += dasharray
        return { ...c, dasharray, dashoffset }
    })
    return (
        <div className="donut-wrap">
            <div className="donut-svg-wrap">
                <svg width="160" height="160" viewBox="0 0 160 160">
                    {slices.map((s, i) => (
                        <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color}
                            strokeWidth="22"
                            strokeDasharray={`${s.dasharray} ${circumference - s.dasharray}`}
                            strokeDashoffset={s.dashoffset}
                            style={{ transition: 'stroke-dasharray 1s ease' }} />
                    ))}
                </svg>
                <div className="donut-center">
                    <div className="donut-center-val">{fmtINR(weekTotal)}</div>
                    <div className="donut-center-label">This Week</div>
                </div>
            </div>
            <div className="donut-legend">
                {CATEGORIES.map((c, i) => (
                    <div className="donut-legend-item" key={i}>
                        <div className="donut-legend-dot" style={{ background: c.color }} />
                        <span className="donut-legend-name">{c.name}</span>
                        <div className="donut-legend-bar-wrap">
                            <div className="donut-legend-bar" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                        <span className="donut-legend-pct">{c.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── New Sale Modal ───────────────────────────────────── */
const PAYMENT_OPTS = [
    { key: 'cash', icon: '💵', label: 'Cash' },
    { key: 'upi', icon: '📱', label: 'UPI' },
    { key: 'card', icon: '💳', label: 'Card' },
    { key: 'credit', icon: '📋', label: 'Credit' },
]

function NewSaleModal({ onClose, onSuccess }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [cart, setCart] = useState([])          // [{ medicine, name, mrp, qty }]
    const [customer, setCustomer] = useState('')
    const [payment, setPayment] = useState('cash')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)        // { invoiceNo, total }
    const searchRef = useRef(null)
    const debounce = useRef(null)

    // Auto-focus medicine search on open
    useEffect(() => { searchRef.current?.focus() }, [])

    // Debounced medicine search
    useEffect(() => {
        clearTimeout(debounce.current)
        if (!query.trim()) { setResults([]); return }
        debounce.current = setTimeout(async () => {
            setSearching(true)
            try {
                const data = await get(`/api/medicines?search=${encodeURIComponent(query)}&limit=8`)
                setResults(data.medicines || [])
            } catch { setResults([]) }
            finally { setSearching(false) }
        }, 280)
    }, [query])

    const addToCart = (med) => {
        setQuery(''); setResults([])
        setCart(c => {
            const idx = c.findIndex(i => i.medicine === med._id)
            if (idx > -1) {
                const updated = [...c]
                updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 }
                return updated
            }
            return [...c, { medicine: med._id, name: med.name, mrp: med.mrp, unit: med.unit || '', stock: med.stock, qty: 1 }]
        })
    }

    const setQty = (medicine, val) => {
        const n = Math.max(1, parseInt(val) || 1)
        setCart(c => c.map(i => i.medicine === medicine ? { ...i, qty: n } : i))
    }

    const removeItem = (medicine) => setCart(c => c.filter(i => i.medicine !== medicine))

    const total = cart.reduce((s, i) => s + i.mrp * i.qty, 0)

    const handleConfirm = async () => {
        if (cart.length === 0) return setError('Add at least one medicine to the cart.')
        // Check qty vs stock
        for (const item of cart) {
            if (item.qty > item.stock) return setError(`Insufficient stock for ${item.name}. Available: ${item.stock}`)
        }
        setSaving(true); setError('')
        try {
            const result = await post('/api/sales', {
                customer: customer.trim() || 'Walk-in',
                payment,
                items: cart.map(i => ({ medicine: i.medicine, qty: i.qty })),
            })
            setSuccess({ invoiceNo: result.sale.invoiceNo, total: result.sale.total })
            onSuccess()
        } catch (err) {
            setError(err.message || 'Failed to record sale.')
        } finally {
            setSaving(false)
        }
    }

    // Success screen
    if (success) return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Sale Recorded!</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                    Invoice <strong style={{ color: 'var(--primary)' }}>{success.invoiceNo}</strong> · ₹{success.total.toLocaleString('en-IN')}
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 28px' }} onClick={onClose}>Done</button>
            </div>
        </div>
    )

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal new-sale-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <span className="modal-title">🛒 New Sale</span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="new-sale-body">
                    {/* Left: Medicine search + cart */}
                    <div className="new-sale-left">
                        {/* Medicine search */}
                        <div className="ns-section-label">Add Medicines</div>
                        <div className="ns-search-wrap">
                            <span className="ns-search-icon">🔍</span>
                            <input
                                ref={searchRef}
                                className="ns-search"
                                placeholder="Search medicine name, generic…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                            {searching && <span className="ns-spinner" />}
                        </div>

                        {/* Search results */}
                        {results.length > 0 && (
                            <div className="ns-results">
                                {results.map(med => (
                                    <div key={med._id} className="ns-result-item" onClick={() => addToCart(med)}>
                                        <div className="ns-result-name">{med.name}</div>
                                        <div className="ns-result-meta">{med.generic || med.manufacturer} · {med.unit}</div>
                                        <div className="ns-result-right">
                                            <span className="ns-result-price">₹{med.mrp}</span>
                                            <span className={`ns-stock-badge ${med.stock <= 0 ? 'out' : med.stock <= 20 ? 'low' : 'ok'}`}>
                                                {med.stock <= 0 ? 'Out' : `${med.stock} left`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cart */}
                        <div className="ns-section-label" style={{ marginTop: 16 }}>Cart {cart.length > 0 && <span className="ns-cart-count">{cart.length}</span>}</div>
                        {cart.length === 0 ? (
                            <div className="ns-empty-cart">No medicines added yet</div>
                        ) : (
                            <div className="ns-cart">
                                {cart.map(item => (
                                    <div key={item.medicine} className="ns-cart-item">
                                        <div className="ns-cart-info">
                                            <div className="ns-cart-name">{item.name}</div>
                                            <div className="ns-cart-meta">₹{item.mrp} × {item.qty} = <strong style={{ color: 'var(--primary)' }}>₹{(item.mrp * item.qty).toFixed(2)}</strong></div>
                                        </div>
                                        <div className="ns-cart-controls">
                                            <button className="ns-qty-btn" onClick={() => setQty(item.medicine, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                                            <input
                                                className="ns-qty-input"
                                                type="number"
                                                min="1"
                                                max={item.stock}
                                                value={item.qty}
                                                onChange={e => setQty(item.medicine, e.target.value)}
                                            />
                                            <button className="ns-qty-btn" onClick={() => setQty(item.medicine, item.qty + 1)} disabled={item.qty >= item.stock}>+</button>
                                            <button className="ns-remove-btn" onClick={() => removeItem(item.medicine)} title="Remove">🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Billing details */}
                    <div className="new-sale-right">
                        <div className="ns-section-label">Customer</div>
                        <input
                            className="sf-input"
                            placeholder="Customer name (optional)"
                            value={customer}
                            onChange={e => setCustomer(e.target.value)}
                            style={{ marginBottom: 20 }}
                        />

                        <div className="ns-section-label">Payment Method</div>
                        <div className="ns-payment-grid">
                            {PAYMENT_OPTS.map(p => (
                                <div
                                    key={p.key}
                                    className={`ns-payment-card${payment === p.key ? ' selected' : ''}`}
                                    onClick={() => setPayment(p.key)}
                                >
                                    <span className="ns-payment-icon">{p.icon}</span>
                                    <span className="ns-payment-label">{p.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bill summary */}
                        <div className="ns-bill">
                            <div className="ns-bill-row">
                                <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="ns-bill-row">
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tax</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Incl. in MRP</span>
                            </div>
                            <div className="ns-bill-total">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && <div className="ns-error">⚠️ {error}</div>}

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 4 }}
                            onClick={handleConfirm}
                            disabled={saving || cart.length === 0}
                        >
                            {saving ? <><span className="auth-spinner" /> Recording…</> : `✅ Confirm Sale · ₹${total.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main Component ─────────────────────────────────────── */
export default function Sales() {
    const [period, setPeriod] = useState('Today')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [showNewSale, setShowNewSale] = useState(false)

    const [sales, setSales] = useState([])
    const [summary, setSummary] = useState(null)
    const [weekSales, setWeekSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(null)

    /* ── Fetch sales list + KPI summary ── */
    const fetchSales = useCallback(async (p) => {
        setLoading(true)
        setApiError(null)
        try {
            const periodKey = PERIOD_MAP[p] || 'today'
            const [salesData, sumData, weekData] = await Promise.all([
                get('/api/sales?limit=500'),
                get(`/api/sales/summary?period=${periodKey}`),
                get('/api/sales?limit=500'),  // reuse for weekly chart
            ])
            setSales(salesData.sales || [])
            setSummary(sumData)

            // Build 7-day revenue chart
            const allSales = weekData.sales || []
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                const label = d.toLocaleDateString('en-IN', { weekday: 'short' })
                const dateStr = d.toISOString().slice(0, 10)
                const rev = allSales
                    .filter(s => s.createdAt?.slice(0, 10) === dateStr)
                    .reduce((sum, s) => sum + s.total, 0)
                return { label, value: rev, isToday: i === 6 }
            })
            setWeekSales(days)
        } catch (err) {
            setApiError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSales(period) }, [fetchSales, period])

    /* ── Client-side filter by period + search ── */
    const filtered = useMemo(() => {
        const now = new Date()
        const cutoff = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
        const todayStr = now.toISOString().slice(0, 10)

        let list = sales
        if (period === 'Today') list = list.filter(s => s.createdAt?.slice(0, 10) === todayStr)
        else if (period === 'Week') list = list.filter(s => s.createdAt?.slice(0, 10) >= cutoff(6))
        else if (period === 'Month') list = list.filter(s => s.createdAt?.slice(0, 10) >= cutoff(29))

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(s =>
                s.invoiceNo?.toLowerCase().includes(q) ||
                s.customer?.toLowerCase().includes(q) ||
                s.items?.some(i => i.name?.toLowerCase().includes(q))
            )
        }
        return list
    }, [sales, period, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const byPayment = useMemo(() => {
        return filtered.reduce((acc, s) => {
            acc[s.payment] = (acc[s.payment] || 0) + 1
            return acc
        }, {})
    }, [filtered])

    const maxWeek = Math.max(...weekSales.map(d => d.value), 1)
    const weekTotal = weekSales.reduce((s, d) => s + d.value, 0)

    return (
        <DashboardLayout title="Sales & Reports">
            {showNewSale && (
                <NewSaleModal
                    onClose={() => setShowNewSale(false)}
                    onSuccess={() => { setShowNewSale(false); fetchSales(period) }}
                />
            )}

            {/* ── Page header ── */}
            <div className="dash-page-header">
                <div>
                    <h1>📊 Sales &amp; Reports</h1>
                    <p>Track revenue, transactions, and category performance.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                        onClick={() => fetchSales(period)} disabled={loading}>
                        {loading ? '⏳' : '↻ Refresh'}
                    </button>
                    <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        onClick={() => setShowNewSale(true)}>
                        🛒 New Sale
                    </button>
                </div>
            </div>

            {/* ── API Error banner ── */}
            {apiError && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }}>
                    ⚠️ {apiError}
                </div>
            )}

            {/* ── Period Tabs ── */}
            <div className="sales-tabs">
                {['Today', 'Week', 'Month', 'All Time'].map(t => (
                    <button key={t} className={`sales-tab${period === t ? ' active' : ''}`}
                        onClick={() => { setPeriod(t); setPage(1); setSearch('') }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ── KPI Strip ── */}
            <div className="kpi-strip">
                <div className="kpi-card">
                    <div className="kpi-icon green">💰</div>
                    <div className="kpi-info">
                        <div className="kpi-value">{loading ? '…' : fmtINR(summary?.revenue ?? 0)}</div>
                        <div className="kpi-label">Total Revenue</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon purple">🧾</div>
                    <div className="kpi-info">
                        <div className="kpi-value">{loading ? '…' : (summary?.txns ?? 0)}</div>
                        <div className="kpi-label">Transactions</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon orange">🎯</div>
                    <div className="kpi-info">
                        <div className="kpi-value">₹{loading ? '…' : (summary?.avgTicket ?? 0)}</div>
                        <div className="kpi-label">Avg. Ticket Size</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon blue">📱</div>
                    <div className="kpi-info">
                        <div className="kpi-value">
                            {loading ? '…' : (() => {
                                const digital = (byPayment.upi || 0) + (byPayment.card || 0)
                                const total = filtered.length
                                return total ? `${Math.round((digital / total) * 100)}%` : '0%'
                            })()}
                        </div>
                        <div className="kpi-label">Digital Payments</div>
                    </div>
                </div>
            </div>

            {/* ── Charts row ── */}
            <div className="charts-row">
                {/* Revenue Bar Chart */}
                <div className="s-widget">
                    <div className="s-widget-header">
                        <span className="s-widget-title">📈 Weekly Revenue</span>
                        <span className="s-widget-meta">{fmtINR(weekTotal)} total</span>
                    </div>
                    <div className="revenue-chart">
                        <div className="y-axis">
                            {['80k', '60k', '40k', '20k', '0'].map(l => <span key={l} className="y-label">{l}</span>)}
                        </div>
                        <div className="chart-grid">
                            {[0, 1, 2, 3, 4].map(i => <div key={i} className="chart-grid-line" />)}
                        </div>
                        <div className="bars-area">
                            {weekSales.map((d, i) => (
                                <div className="rev-col" key={i}>
                                    <div className="rev-col-wrap">
                                        <div className={`rev-bar${d.isToday ? ' today' : ''}`}
                                            style={{ height: `${(d.value / maxWeek) * 100}%` }}
                                            data-tip={fmtINR(d.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="x-axis">
                            {weekSales.map((d, i) => <span key={i} className="x-label">{d.label}</span>)}
                        </div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }} /> Today</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(0,168,120,0.3)' }} /> Previous Days</div>
                        <div className="legend-item" style={{ marginLeft: 'auto' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Week Total:</strong>&nbsp;{fmtINR(weekTotal)}
                        </div>
                    </div>
                </div>

                {/* Category Donut */}
                <div className="s-widget">
                    <div className="s-widget-header">
                        <span className="s-widget-title">🏷 By Category</span>
                        <span className="s-widget-meta">Estimated</span>
                    </div>
                    <DonutChart weekTotal={weekTotal} />
                </div>
            </div>

            {/* ── Payment Method Summary ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Cash', icon: '💵', key: 'cash', color: 'var(--primary)' },
                    { label: 'UPI', icon: '📱', key: 'upi', color: '#60a5fa' },
                    { label: 'Card', icon: '💳', key: 'card', color: '#a78bfa' },
                    { label: 'Credit', icon: '📋', key: 'credit', color: '#fb923c' },
                ].map(p => (
                    <div key={p.label} className="s-widget" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: p.color }}>
                                {byPayment[p.key] || 0}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.label} Payments</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Sales Table ── */}
            <div className="sales-table-wrap">
                <div className="sales-table-toolbar">
                    <span className="sales-table-title">🧾 Transaction History</span>
                    <div className="sales-search-wrap">
                        <span className="sales-search-icon">🔍</span>
                        <input className="sales-search" placeholder="Search invoice, customer…"
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
                        <div>Loading transactions…</div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                        <p>{search ? 'No transactions match your search.' : 'No transactions recorded for this period.'}</p>
                    </div>
                ) : (
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Date &amp; Time</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Payment</th>
                                <th>Staff</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(s => {
                                const dt = new Date(s.createdAt)
                                const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                const firstItem = s.items?.[0]
                                return (
                                    <tr key={s._id}>
                                        <td className="invoice-id">{s.invoiceNo}</td>
                                        <td>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{dateStr}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeStr}</div>
                                        </td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.customer || 'Walk-in'}</td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {firstItem ? `${firstItem.name} ×${firstItem.qty}` : '—'}
                                                {s.items?.length > 1 && (
                                                    <span style={{ marginLeft: '4px', background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: '99px', fontSize: '0.7rem' }}>
                                                        +{s.items.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`payment-badge ${s.payment}`}>
                                                {s.payment === 'cash' ? '💵' : s.payment === 'upi' ? '📱' : s.payment === 'card' ? '💳' : '📋'} {s.payment?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{s.staff?.name || '—'}</td>
                                        <td className="amount" style={{ textAlign: 'right' }}>₹{s.total?.toLocaleString('en-IN')}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="sales-pagination">
                        <span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                        <div className="sales-page-btns">
                            <button className="sales-page-btn" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => Math.abs(p - currentPage) <= 2)
                                .map(p => (
                                    <button key={p} className={`sales-page-btn${p === currentPage ? ' active' : ''}`}
                                        onClick={() => setPage(p)}>{p}</button>
                                ))}
                            <button className="sales-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
