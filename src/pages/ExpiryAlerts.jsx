import { useState, useMemo, useEffect, useCallback } from 'react'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get, del } from '../api/client'
import './ExpiryAlerts.css'

/* ── Helpers ──────────────────────────────────────────────── */
function daysUntil(expiry) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return Math.ceil((new Date(expiry) - today) / 86400000)
}

function getUrgency(days) {
    if (days < 0) return 'expired'
    if (days <= 7) return 'danger'
    if (days <= 30) return 'warning'
    return 'ok'
}

function countdownText(days) {
    if (days < 0) return `Expired ${Math.abs(days)}d ago`
    if (days === 0) return 'Expires TODAY'
    if (days === 1) return 'Expires tomorrow'
    return `Expires in ${days} days`
}

function countdownIcon(urgency) {
    return { expired: '💀', danger: '🔴', warning: '⚠️', ok: '✅' }[urgency]
}

const URGENCY_META = {
    expired: { label: 'Expired', color: '#ef4444', dot: '#ef4444' },
    danger: { label: 'Expires this week', color: '#f97316', dot: '#f97316' },
    warning: { label: 'Expires this month', color: '#f59e0b', dot: '#f59e0b' },
    ok: { label: 'Monitored (31–90d)', color: '#00A878', dot: '#00A878' },
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Alert Card ───────────────────────────────────────────── */
function AlertCard({ med, urgency, days, selected, onSelect, onDispose, disposing }) {
    return (
        <div className={`alert-card ${urgency}`}>
            {/* checkbox */}
            <div className={`alert-card-check${selected ? ' checked' : ''}`} onClick={() => onSelect(med._id)}>
                {selected && '✓'}
            </div>

            {/* top row */}
            <div className="alert-card-top">
                <div className="alert-medicine-icon">💊</div>
                <div>
                    <div className="alert-name">{med.name}</div>
                    <div className="alert-meta">{med.generic || med.batch} · {med.manufacturer}</div>
                </div>
            </div>

            {/* countdown pill */}
            <span className={`countdown-pill ${urgency}`}>
                {countdownIcon(urgency)} {countdownText(days)}
            </span>

            {/* detail grid */}
            <div className="alert-details">
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Expiry Date</div>
                    <div className="alert-detail-val">{formatDate(med.expiry)}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Batch No.</div>
                    <div className="alert-detail-val">{med.batch}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Stock Left</div>
                    <div className="alert-detail-val">{med.stock} {med.unit}</div>
                </div>
                <div className="alert-detail-item">
                    <div className="alert-detail-label">Category</div>
                    <div className="alert-detail-val">{med.category}</div>
                </div>
            </div>

            {/* actions */}
            <div className="alert-actions">
                <button className="alert-btn primary"
                    onClick={() => window.open(`/inventory`, '_self')}>
                    👁 View
                </button>
                <button className="alert-btn danger" disabled={disposing}
                    onClick={() => onDispose(med._id)}>
                    {disposing ? '⏳' : '🗑 Dispose'}
                </button>
            </div>
        </div>
    )
}

/* ── Confirm Dispose Modal ─────────────────────────────────── */
function DisposeModal({ count, onConfirm, onClose, saving }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal confirm-modal">
                <div className="confirm-body">
                    <div className="confirm-icon">🗑️</div>
                    <div className="confirm-title">Dispose {count} Medicine{count > 1 ? 's' : ''}?</div>
                    <p className="confirm-desc">
                        This will permanently delete {count > 1 ? 'these medicines' : 'this medicine'} from your inventory.
                        This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                        <button className="btn btn-danger" onClick={onConfirm} disabled={saving}>
                            {saving ? 'Disposing…' : `🗑 Dispose ${count > 1 ? 'All' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main Component ───────────────────────────────────────── */
export default function ExpiryAlerts() {
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(null)
    const [disposing, setDisposing] = useState(null) // id being disposed, or 'bulk'

    const [selected, setSelected] = useState(new Set())
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [bulkModal, setBulkModal] = useState(false)

    /* ── Fetch from API (days=90 gives expired + expiring soon + ok range) ── */
    const fetchMedicines = useCallback(async () => {
        setLoading(true)
        setApiError(null)
        try {
            const data = await get('/api/medicines/expiry?days=90')
            setMedicines(data.medicines || [])
        } catch (err) {
            setApiError(err.message || 'Failed to load expiry data.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMedicines() }, [fetchMedicines])

    /* ── Enrich with days + urgency ── */
    const enriched = useMemo(() =>
        medicines.map(m => ({
            ...m,
            days: daysUntil(m.expiry),
            urgency: getUrgency(daysUntil(m.expiry)),
        })),
        [medicines]
    )

    const counts = useMemo(() => ({
        expired: enriched.filter(m => m.urgency === 'expired').length,
        danger: enriched.filter(m => m.urgency === 'danger').length,
        warning: enriched.filter(m => m.urgency === 'warning').length,
        ok: enriched.filter(m => m.urgency === 'ok').length,
    }), [enriched])

    const categories = ['All', ...new Set(medicines.map(m => m.category))]

    const filtered = useMemo(() => {
        let list = enriched
        if (filter !== 'all') list = list.filter(m => m.urgency === filter)
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
    }, [enriched, filter, category, search])

    const grouped = useMemo(() => {
        const order = ['expired', 'danger', 'warning', 'ok']
        return order
            .map(u => ({ urgency: u, items: filtered.filter(m => m.urgency === u) }))
            .filter(g => g.items.length > 0)
    }, [filtered])

    /* ── Selection ── */
    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    /* ── Single dispose ── */
    const handleDispose = async (id) => {
        setDisposing(id)
        try {
            await del(`/api/medicines/${id}`)
            setMedicines(ms => ms.filter(m => m._id !== id))
            setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setDisposing(null)
        }
    }

    /* ── Bulk dispose ── */
    const handleBulkDispose = async () => {
        setDisposing('bulk')
        try {
            await Promise.all([...selected].map(id => del(`/api/medicines/${id}`)))
            setMedicines(ms => ms.filter(m => !selected.has(m._id)))
            setSelected(new Set())
            setBulkModal(false)
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setDisposing(null)
        }
    }

    return (
        <DashboardLayout title="Expiry Alerts">
            {/* ── Page header ── */}
            <div className="dash-page-header">
                <div>
                    <h1>⚠️ Expiry Alerts</h1>
                    <p>
                        {loading ? 'Loading…' : `${counts.expired + counts.danger} medicines need immediate attention.`}
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
                    { key: 'all', label: 'All Alerts', icon: '💊', count: enriched.length, cls: 'ok' },
                    { key: 'expired', label: 'Expired', icon: '💀', count: counts.expired, cls: 'expired' },
                    { key: 'danger', label: 'Expires this week', icon: '🔴', count: counts.danger, cls: 'danger' },
                    { key: 'warning', label: 'Expires this month', icon: '⚠️', count: counts.warning, cls: 'warning' },
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

            {/* ── Timeline hint ── */}
            <div className="expiry-timeline">
                <div className="expiry-tl-seg expired">💀 Already Expired</div>
                <div className="expiry-tl-seg danger">🔴 1–7 Days Left</div>
                <div className="expiry-tl-seg warning">⚠️ 8–30 Days Left</div>
                <div className="expiry-tl-seg ok">✅ 31–90 Days (Monitor)</div>
            </div>

            {/* ── Toolbar ── */}
            <div className="expiry-toolbar">
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
                    <div>Checking expiry dates from inventory…</div>
                </div>
            ) : grouped.length === 0 ? (
                <div className="expiry-empty">
                    <div className="expiry-empty-icon">🎉</div>
                    <div className="expiry-empty-title">
                        {medicines.length === 0 ? 'No medicines in inventory yet' : 'No expiry alerts!'}
                    </div>
                    <p>
                        {medicines.length === 0
                            ? 'Add medicines in the Inventory page to start tracking expiry.'
                            : 'All medicines are within safe date ranges.'}
                    </p>
                </div>
            ) : (
                grouped.map(({ urgency, items }) => (
                    <div className="urgency-section" key={urgency}>
                        <div className="urgency-header">
                            <div className="urgency-dot" style={{ background: URGENCY_META[urgency].dot }} />
                            <span className="urgency-title">{URGENCY_META[urgency].label}</span>
                            <span className={`urgency-count ${urgency}`}>{items.length} medicine{items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="alert-cards">
                            {items.map(m => (
                                <AlertCard
                                    key={m._id}
                                    med={m}
                                    urgency={m.urgency}
                                    days={m.days}
                                    selected={selected.has(m._id)}
                                    onSelect={toggleSelect}
                                    onDispose={handleDispose}
                                    disposing={disposing === m._id}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* ── Bulk action bar ── */}
            {selected.size > 0 && (
                <div className="bulk-bar">
                    <span className="bulk-bar-text">
                        <span className="bulk-bar-count">{selected.size}</span>{' '}
                        medicine{selected.size > 1 ? 's' : ''} selected
                    </span>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                        onClick={() => setSelected(new Set())}>
                        Clear
                    </button>
                    <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                        onClick={() => setBulkModal(true)}>
                        🗑 Dispose All
                    </button>
                </div>
            )}

            {/* ── Bulk Dispose Confirm Modal ── */}
            {bulkModal && (
                <DisposeModal
                    count={selected.size}
                    onConfirm={handleBulkDispose}
                    onClose={() => setBulkModal(false)}
                    saving={disposing === 'bulk'}
                />
            )}
        </DashboardLayout>
    )
}
