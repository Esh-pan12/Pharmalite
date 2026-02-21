import { useState, useMemo, useEffect, useCallback } from 'react'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get, post, put, del } from '../api/client'
import './Inventory.css'

const CATEGORIES = ['All', 'Analgesic', 'Antibiotic', 'Cough & Cold', 'Supplement',
    'Rehydration', 'Diabetes', 'Allergy', 'Gastric', 'Cardiac', 'Cardiovascular', 'Other']

const PAGE_SIZE = 8

const EMPTY_FORM = {
    name: '', generic: '', category: '', manufacturer: '',
    stock: '', unit: 'Strip', mrp: '', price: '', expiry: '', batch: '', reorderLevel: '20',
}

/* ── Helpers ────────────────────────────────────────────── */
function getStatus(stock, expiry, reorderLevel = 20) {
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / 86400000)
    if (daysLeft <= 0) return 'critical'
    if (daysLeft <= 30) return 'expiring'
    if (stock <= 0) return 'critical'
    if (stock <= reorderLevel) return 'low'
    return 'good'
}

function statusLabel(s) {
    return { good: '✓ In Stock', low: '⚡ Low Stock', critical: '🔴 Critical', expiring: '⏳ Expiring Soon' }[s] ?? s
}

function expiryClass(expiry) {
    const d = Math.ceil((new Date(expiry) - new Date()) / 86400000)
    if (d <= 7) return 'danger'
    if (d <= 30) return 'warn'
    return ''
}

function formatExpiry(expiry) {
    return new Date(expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Form Field (defined at module scope to avoid remounting) ── */
function Field({ label, k, type, placeholder, options, form, errors, onChange }) {
    const t = type || 'text'
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {options ? (
                <select className="form-input" value={form[k]} onChange={onChange(k)}
                    style={errors[k] ? { borderColor: '#f87171' } : {}}>
                    <option value="">Select…</option>
                    {options.filter(o => o !== 'All').map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    className="form-input" type={t} placeholder={placeholder || ''}
                    value={form[k]} onChange={onChange(k)}
                    style={errors[k] ? { borderColor: '#f87171' } : {}}
                />
            )}
            {errors[k] && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>⚠ {errors[k]}</span>}
        </div>
    )
}

/* ── Add / Edit Modal ───────────────────────────────────── */
function MedicineModal({ medicine, onSave, onClose, saving }) {
    const isEdit = Boolean(medicine?._id)
    const [form, setForm] = useState(() => {
        if (isEdit) {
            return {
                name: medicine.name ?? '',
                generic: medicine.generic ?? '',
                category: medicine.category ?? '',
                manufacturer: medicine.manufacturer ?? '',
                stock: String(medicine.stock ?? ''),
                unit: medicine.unit ?? 'Strip',
                mrp: String(medicine.mrp ?? ''),
                price: String(medicine.price ?? ''),
                expiry: medicine.expiry ? medicine.expiry.slice(0, 10) : '',
                batch: medicine.batch ?? '',
                reorderLevel: String(medicine.reorderLevel ?? 20),
            }
        }
        return { ...EMPTY_FORM }
    })
    const [errors, setErrors] = useState({})

    const set = (k) => (e) => {
        setForm(f => ({ ...f, [k]: e.target.value }))
        setErrors(er => ({ ...er, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Required'
        if (!form.category) e.category = 'Required'
        if (!form.manufacturer.trim()) e.manufacturer = 'Required'
        if (!form.batch.trim()) e.batch = 'Required'
        if (form.stock === '' || isNaN(+form.stock) || +form.stock < 0) e.stock = 'Valid number'
        if (!form.mrp || isNaN(+form.mrp) || +form.mrp <= 0) e.mrp = 'Valid price'
        if (!form.expiry) e.expiry = 'Required'
        return e
    }

    const handleSave = () => {
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        onSave({
            ...form,
            stock: +form.stock,
            mrp: +form.mrp,
            price: form.price !== '' ? +form.price : +form.mrp,
            reorderLevel: +form.reorderLevel || 20,
        })
    }


    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">
                        {isEdit ? '✏️ Edit' : '➕ Add New'} <span>Medicine</span>
                    </span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="modal-grid">
                        <Field label="Medicine Name *" k="name" placeholder="e.g. Paracetamol" form={form} errors={errors} onChange={set} />
                        <Field label="Generic / Strength" k="generic" placeholder="e.g. 500mg tablet" form={form} errors={errors} onChange={set} />
                        <Field label="Category *" k="category" options={CATEGORIES} form={form} errors={errors} onChange={set} />
                        <Field label="Manufacturer *" k="manufacturer" placeholder="e.g. Cipla" form={form} errors={errors} onChange={set} />
                        <Field label="Stock Quantity *" k="stock" type="number" placeholder="0" form={form} errors={errors} onChange={set} />
                        <Field label="Unit" k="unit" options={['Tablet', 'Capsule', 'Injection', 'Unit', 'Strip', 'Bottle', 'Sachet', 'Pen', 'Vial', 'Tube', 'Box']} form={form} errors={errors} onChange={set} />
                        <Field label="Selling Price / MRP (₹) *" k="mrp" type="number" placeholder="0.00" form={form} errors={errors} onChange={set} />
                        <Field label="Cost Price (₹)" k="price" type="number" placeholder="0.00" form={form} errors={errors} onChange={set} />
                        <Field label="Expiry Date *" k="expiry" type="date" form={form} errors={errors} onChange={set} />
                        <Field label="Batch Number *" k="batch" placeholder="e.g. MH2024A" form={form} errors={errors} onChange={set} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><span className="auth-spinner" /> Saving…</> : isEdit ? '💾 Save Changes' : '➕ Add Medicine'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ── Delete Confirm Modal ───────────────────────────────── */
function DeleteModal({ medicine, onConfirm, onClose, saving }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal confirm-modal">
                <div className="confirm-body">
                    <div className="confirm-icon">🗑️</div>
                    <div className="confirm-title">Delete Medicine?</div>
                    <p className="confirm-desc">
                        Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>
                            {medicine.name} ({medicine.generic || medicine.batch})
                        </strong>? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                        <button className="btn btn-danger" onClick={onConfirm} disabled={saving}>
                            {saving ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main Component ─────────────────────────────────────── */
export default function Inventory() {
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(null)
    const [saving, setSaving] = useState(false)

    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [sortKey, setSortKey] = useState('name')
    const [sortDir, setSortDir] = useState(1)
    const [page, setPage] = useState(1)
    const [modal, setModal] = useState(null)

    /* ── Fetch from API ─── */
    const fetchMedicines = useCallback(async () => {
        setLoading(true)
        setApiError(null)
        try {
            const data = await get('/api/medicines?limit=200')
            setMedicines(data.medicines || [])
        } catch (err) {
            setApiError(err.message || 'Failed to load medicines.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMedicines() }, [fetchMedicines])

    /* ── Filtered / sorted list ─── */
    const filtered = useMemo(() => {
        let list = medicines.map(m => ({
            ...m,
            _status: getStatus(m.stock, m.expiry, m.reorderLevel),
        }))
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(m =>
                m.name?.toLowerCase().includes(q) ||
                m.generic?.toLowerCase().includes(q) ||
                m.manufacturer?.toLowerCase().includes(q) ||
                m.batch?.toLowerCase().includes(q)
            )
        }
        if (catFilter !== 'All') list = list.filter(m => m.category === catFilter)
        if (statusFilter !== 'All') list = list.filter(m => m._status === statusFilter)

        list.sort((a, b) => {
            const av = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : (a[sortKey] ?? 0)
            const bv = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : (b[sortKey] ?? 0)
            return av < bv ? -sortDir : av > bv ? sortDir : 0
        })
        return list
    }, [medicines, search, catFilter, statusFilter, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const counts = useMemo(() => ({
        all: medicines.length,
        good: medicines.filter(m => getStatus(m.stock, m.expiry, m.reorderLevel) === 'good').length,
        low: medicines.filter(m => getStatus(m.stock, m.expiry, m.reorderLevel) === 'low').length,
        critical: medicines.filter(m => getStatus(m.stock, m.expiry, m.reorderLevel) === 'critical').length,
        expiring: medicines.filter(m => getStatus(m.stock, m.expiry, m.reorderLevel) === 'expiring').length,
    }), [medicines])

    /* ── Sort ─── */
    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => -d)
        else { setSortKey(key); setSortDir(1) }
        setPage(1)
    }
    const SortIcon = ({ k }) => <span className="sort-icon">{sortKey === k ? (sortDir === 1 ? '↑' : '↓') : '↕'}</span>

    /* ── CRUD ─── */
    const handleSave = async (formData) => {
        setSaving(true)
        try {
            if (modal?.medicine?._id) {
                // Edit
                const result = await put(`/api/medicines/${modal.medicine._id}`, formData)
                setMedicines(ms => ms.map(m => m._id === result.medicine._id ? result.medicine : m))
            } else {
                // Add
                const result = await post('/api/medicines', formData)
                setMedicines(ms => [result.medicine, ...ms])
            }
            setModal(null)
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await del(`/api/medicines/${modal.medicine._id}`)
            setMedicines(ms => ms.filter(m => m._id !== modal.medicine._id))
            setModal(null)
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const cols = [
        { key: 'name', label: 'Medicine' },
        { key: 'category', label: 'Category' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'stock', label: 'Stock' },
        { key: 'mrp', label: 'Price' },
        { key: 'expiry', label: 'Expiry' },
        { key: '_status', label: 'Status' },
    ]

    return (
        <DashboardLayout title="Inventory">
            {/* ── Page header ── */}
            <div className="dash-page-header">
                <div>
                    <h1>💊 Inventory</h1>
                    <p>{medicines.length} medicines · {counts.critical} critical · {counts.expiring} expiring soon</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                        onClick={fetchMedicines} disabled={loading}>
                        {loading ? '⏳ Loading…' : '↻ Refresh'}
                    </button>
                    <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                        onClick={() => setModal({ type: 'add' })}>
                        + Add Medicine
                    </button>
                </div>
            </div>

            {/* ── API Error banner ── */}
            {apiError && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }}>
                    ⚠️ {apiError} — <button onClick={fetchMedicines} style={{ color: '#f87171', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="inv-toolbar">
                <div className="inv-search-wrap">
                    <span className="inv-search-icon">🔍</span>
                    <input className="inv-search" placeholder="Search by name, batch, manufacturer…"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                </div>
                <select className="inv-select" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                </select>
                <select className="inv-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                    {['All', 'good', 'low', 'critical', 'expiring'].map(s => (
                        <option key={s} value={s}>{s === 'All' ? 'All Status' : statusLabel(s)}</option>
                    ))}
                </select>
                <div className="toolbar-spacer" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Summary chips ── */}
            <div className="inv-summary">
                {[
                    { label: 'Total', val: counts.all, icon: '💊', status: 'All' },
                    { label: 'In Stock', val: counts.good, icon: '✅', status: 'good' },
                    { label: 'Low Stock', val: counts.low, icon: '⚡', status: 'low' },
                    { label: 'Critical', val: counts.critical, icon: '🔴', status: 'critical' },
                    { label: 'Expiring', val: counts.expiring, icon: '⏳', status: 'expiring' },
                ].map(c => (
                    <div key={c.label}
                        className={`inv-chip${statusFilter === c.status ? ' active' : ''}`}
                        onClick={() => { setStatusFilter(c.status); setPage(1) }}>
                        <span className="inv-chip-icon">{c.icon}</span>
                        <span className="inv-chip-label">{c.label}</span>
                        <span className="inv-chip-value">{c.val}</span>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="inv-table-wrap">
                <div className="inv-table-header">
                    <span className="inv-table-title">Medicine List</span>
                    <span className="inv-count">{filtered.length} items</span>
                </div>

                {/* Loading skeleton */}
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
                        <div>Loading inventory from server…</div>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="inv-empty">
                        <div className="inv-empty-icon">🔍</div>
                        <div className="inv-empty-title">
                            {medicines.length === 0 ? 'No medicines yet' : 'No medicines found'}
                        </div>
                        <p className="inv-empty-sub">
                            {medicines.length === 0
                                ? 'Click "+ Add Medicine" to add your first medicine.'
                                : 'Try adjusting your search or filters'}
                        </p>
                    </div>
                ) : (
                    <table className="inv-table">
                        <thead>
                            <tr>
                                {cols.map(c => (
                                    <th key={c.key} onClick={() => handleSort(c.key)} className={sortKey === c.key ? 'sorted' : ''}>
                                        {c.label}<SortIcon k={c.key} />
                                    </th>
                                ))}
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(m => {
                                const maxStock = Math.max(200, m.stock)
                                const pct = Math.min(100, (m.stock / maxStock) * 100)
                                const barColor = m._status === 'good' ? 'var(--primary)' : m._status === 'low' ? '#fb923c' : '#f87171'
                                return (
                                    <tr key={m._id}>
                                        <td>
                                            <div className="cell-name">{m.name}</div>
                                            <div className="cell-name-sub">{m.generic} · {m.batch}</div>
                                        </td>
                                        <td>{m.category}</td>
                                        <td>{m.manufacturer}</td>
                                        <td>
                                            <div className="stock-bar-wrap">
                                                <span className="cell-stock">{m.stock}</span>
                                                <div className="stock-bar">
                                                    <div className="stock-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                                                </div>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.unit}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{m.mrp}</td>
                                        <td className={`cell-expiry ${expiryClass(m.expiry)}`}>{formatExpiry(m.expiry)}</td>
                                        <td><span className={`status-badge ${m._status}`}>{statusLabel(m._status)}</span></td>
                                        <td>
                                            <div className="inv-actions">
                                                <button className="inv-action-btn edit" title="Edit"
                                                    onClick={() => setModal({ type: 'edit', medicine: m })}>✏️</button>
                                                <button className="inv-action-btn delete" title="Delete"
                                                    onClick={() => setModal({ type: 'delete', medicine: m })}>🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="inv-pagination">
                        <span className="inv-pagination-info">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="inv-pagination-btns">
                            <button className="inv-page-btn" disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
                            <button className="inv-page-btn" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => Math.abs(p - currentPage) <= 2)
                                .map(p => (
                                    <button key={p} className={`inv-page-btn${p === currentPage ? ' active' : ''}`}
                                        onClick={() => setPage(p)}>{p}</button>
                                ))}
                            <button className="inv-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                            <button className="inv-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {modal?.type === 'add' && (
                <MedicineModal onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
            )}
            {modal?.type === 'edit' && (
                <MedicineModal medicine={modal.medicine} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal
                    medicine={modal.medicine}
                    onConfirm={handleDelete}
                    onClose={() => setModal(null)}
                    saving={saving}
                />
            )}
        </DashboardLayout>
    )
}
