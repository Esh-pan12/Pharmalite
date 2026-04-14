import { useState, useMemo, useEffect, useCallback } from 'react'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get } from '../api/client'
import './ExpiryAlerts.css'

/* ── Alert Card ───────────────────────────────────────────── */
function AlertCard({ med, statusInfo }) {
    return (
        <div className={`alert-card ${statusInfo.urgency}`}>
            {/* checkbox (hidden for low stock since we don't dispose them, we reorder them) */}
            
            {/* top row */}
            <div className="alert-card-top" style={{ paddingLeft: 14 }}>
                <div className="alert-medicine-icon">📦</div>
                <div>
                    <div className="alert-name">{med.name}</div>
                    <div className="alert-meta">{med.generic || med.batch} · {med.manufacturer}</div>
                </div>
            </div>

            {/* status pill */}
            <span className={`countdown-pill ${statusInfo.urgency}`}>
                {statusInfo.icon} {statusInfo.label}
            </span>

            {/* detail grid */}
            <div className="alert-details">
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Current Stock</div>
                    <div className="alert-detail-val" style={{ color: statusInfo.color, fontWeight: 800 }}>{med.stock} {med.unit}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Reorder Level</div>
                    <div className="alert-detail-val">{med.reorderLevel || 20} {med.unit}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Category</div>
                    <div className="alert-detail-val">{med.category}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Supplier</div>
                    <div className="alert-detail-val">{med.supplier || 'N/A'}</div>
                </div>
            </div>

            {/* actions */}
            <div className="alert-actions" style={{ paddingLeft: 14 }}>
                <button className="alert-btn primary"
                    onClick={() => window.open(`/inventory?search=${encodeURIComponent(med.name)}`, '_self')}>
                    👁 View in Inventory
                </button>
            </div>
        </div>
    )
}

const STATUS_META = {
    out_of_stock: { label: 'Out of Stock', urgency: 'expired', color: '#ef4444', dot: '#ef4444', icon: '❌' },
    low: { label: 'Low Stock', urgency: 'danger', color: '#f97316', dot: '#f97316', icon: '⚠️' }
}

/* ── Main Component ───────────────────────────────────────── */
export default function LowStock() {
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(null)

    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')

    const fetchMedicines = useCallback(async () => {
        setLoading(true)
        setApiError(null)
        try {
            // Fetch a large page and filter locally to match Big Data UI
            const data = await get('/api/medicines?limit=5000')
            // Filter only low/out of stock
            const lowItems = (data.medicines || []).filter(m => m.status === 'low' || m.status === 'out_of_stock')
            setMedicines(lowItems)
        } catch (err) {
            setApiError(err.message || 'Failed to load low stock data.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMedicines() }, [fetchMedicines])

    const counts = useMemo(() => ({
        out: medicines.filter(m => m.status === 'out_of_stock').length,
        low: medicines.filter(m => m.status === 'low').length,
    }), [medicines])

    const categories = ['All', ...new Set(medicines.map(m => m.category))]

    const filtered = useMemo(() => {
        let list = medicines
        if (filter !== 'all') list = list.filter(m => m.status === filter)
        if (category !== 'All') list = list.filter(m => m.category === category)
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(m =>
                m.name?.toLowerCase().includes(q) ||
                m.batch?.toLowerCase().includes(q) ||
                m.manufacturer?.toLowerCase().includes(q)
            )
        }
        return list
    }, [medicines, filter, category, search])

    const grouped = useMemo(() => {
        const order = ['out_of_stock', 'low']
        return order
            .map(u => ({ status: u, items: filtered.filter(m => m.status === u) }))
            .filter(g => g.items.length > 0)
    }, [filtered])

    return (
        <DashboardLayout title="Low Stock Alerts">
            {/* ── Page header ── */}
            <div className="dash-page-header">
                <div>
                    <h1>📉 Low Stock Alerts</h1>
                    <p>
                        {loading ? 'Crunching inventory data…' : `${medicines.length} medicines need to be reordered soon.`}
                    </p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                    onClick={fetchMedicines} disabled={loading}>
                    {loading ? '⏳' : '↻ Refresh'}
                </button>
            </div>

            {/* ── API Error banner ── */}
            {apiError && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }}>
                    ⚠️ {apiError} —{' '}
                    <button onClick={fetchMedicines} style={{ color: '#f87171', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── Summary strip ── */}
            <div className="expiry-strip">
                {[
                    { key: 'all', label: 'All Shortages', icon: '📉', count: medicines.length, cls: 'warning' },
                    { key: 'out_of_stock', label: 'Out of Stock', icon: '❌', count: counts.out, cls: 'expired' },
                    { key: 'low', label: 'Critically Low', icon: '⚠️', count: counts.low, cls: 'danger' },
                ].map(s => (
                    <div key={s.key}
                        className={`expiry-strip-card ${s.cls}${filter === s.key ? ' active' : ''}`}
                        onClick={() => setFilter(s.key)}>
                        <span className="expiry-strip-icon">{s.icon}</span>
                        <div className="expiry-strip-info">
                            <div className="expiry-strip-count">{loading ? '…' : s.count}</div>
                            <div className="expiry-strip-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="expiry-toolbar" style={{ marginTop: 24 }}>
                <div className="expiry-search-wrap">
                    <span className="expiry-search-icon">🔍</span>
                    <input className="expiry-search" placeholder="Search medicine, batch…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="expiry-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {filtered.length} medicine{filtered.length !== 1 ? 's' : ''} shown
                </span>
            </div>

            {/* ── Loading skeleton ── */}
            {loading ? (
                <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⏳</div>
                    <div>Scanning inventory for low stock…</div>
                </div>
            ) : grouped.length === 0 ? (
                <div className="expiry-empty">
                    <div className="expiry-empty-icon">🎉</div>
                    <div className="expiry-empty-title">
                        {medicines.length === 0 ? 'No low stock alerts!' : 'No matching items.'}
                    </div>
                    <p>
                        {medicines.length === 0
                            ? 'All your inventory is well-stocked.'
                            : 'Adjust your search filters.'}
                    </p>
                </div>
            ) : (
                grouped.map(({ status, items }) => {
                    const meta = STATUS_META[status]
                    return (
                        <div className="urgency-section" key={status}>
                            <div className="urgency-header">
                                <div className="urgency-dot" style={{ background: meta.dot }} />
                                <span className="urgency-title">{meta.label}</span>
                                <span className={`urgency-count ${meta.urgency}`}>{items.length} medicine{items.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="alert-cards">
                                {items.map(m => (
                                    <AlertCard
                                        key={m._id}
                                        med={m}
                                        statusInfo={meta}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })
            )}

        </DashboardLayout>
    )
}
