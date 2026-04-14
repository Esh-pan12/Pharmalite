import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { get } from '../api/client'
import './TopBar.css'

/* ── Search Box ───────────────────────────────────────────── */
function SearchBox() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const inputRef = useRef(null)
    const wrapRef = useRef(null)
    const timerRef = useRef(null)

    /* Ctrl+K focuses the search */
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    /* Close on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* Debounced search */
    const handleChange = (e) => {
        const val = e.target.value
        setQuery(val)
        setActive(-1)
        clearTimeout(timerRef.current)
        if (!val.trim()) { setResults([]); setOpen(false); return }
        timerRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const data = await get(`/api/medicines?search=${encodeURIComponent(val)}&limit=7`)
                setResults(data.medicines || [])
                setOpen(true)
            } catch { }
            finally { setLoading(false) }
        }, 280)
    }

    /* Keyboard navigation */
    const handleKeyDown = (e) => {
        if (!open) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
        if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
        if (e.key === 'Enter' && active >= 0) { goToInventory(results[active]) }
        if (e.key === 'Enter' && active < 0 && query.trim()) { goToInventorySearch() }
    }

    const goToInventory = (med) => {
        setOpen(false); setQuery('')
        navigate(`/inventory?highlight=${med._id}`)
    }

    const goToInventorySearch = () => {
        setOpen(false)
        navigate(`/inventory?search=${encodeURIComponent(query)}`)
        setQuery('')
    }

    const stockColor = (m) => {
        if (m.stock <= 0) return '#f87171'
        if (m.stock <= (m.reorderLevel || 20)) return '#fb923c'
        return 'var(--primary)'
    }

    return (
        <div className="topbar-search" ref={wrapRef}>
            <span className="topbar-search-icon">{loading ? '⏳' : '🔍'}</span>
            <input
                ref={inputRef}
                className="topbar-search-input"
                type="text"
                placeholder="Search medicines…"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && results.length && setOpen(true)}
                autoComplete="off"
            />
            <div className="topbar-search-kbd">
                <kbd>Ctrl</kbd><kbd>K</kbd>
            </div>

            {open && (
                <div className="search-dropdown">
                    {results.length === 0 ? (
                        <div className="search-no-results">No medicines match "{query}"</div>
                    ) : (
                        <>
                            {results.map((m, i) => (
                                <div
                                    key={m._id}
                                    className={`search-result-item${active === i ? ' active' : ''}`}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => goToInventory(m)}
                                >
                                    <span className="search-result-icon">💊</span>
                                    <div className="search-result-body">
                                        <div className="search-result-name">{m.name}</div>
                                        <div className="search-result-meta">{m.category} · Batch {m.batch}</div>
                                    </div>
                                    <span className="search-result-stock" style={{ color: stockColor(m) }}>
                                        {m.stock} {m.unit}
                                    </span>
                                </div>
                            ))}
                            <div className="search-footer" onClick={goToInventorySearch}>
                                🔍 Search all results for "{query}"
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

/* ── Notification panel ───────────────────────────────────── */
function NotifPanel({ notifs, unreadIds, loading, onMarkAllRead, onMarkRead, onClose }) {
    return (
        <div className="notif-panel" onClick={e => e.stopPropagation()}>
            <div className="notif-panel-header">
                <span className="notif-panel-title">🔔 Notifications</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unreadIds.size > 0 && (
                        <button className="notif-mark-all" onClick={onMarkAllRead}>
                            Mark all read
                        </button>
                    )}
                    <button className="notif-close-btn" onClick={onClose}>✕</button>
                </div>
            </div>

            {loading ? (
                <div className="notif-empty">
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⏳</div>
                    <div>Checking alerts…</div>
                </div>
            ) : notifs.length === 0 ? (
                <div className="notif-empty">
                    <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🎉</div>
                    <div>All clear! No alerts right now.</div>
                </div>
            ) : (
                <div className="notif-list">
                    {notifs.map(n => (
                        <div
                            key={n.id}
                            className={`notif-item ${n.type}${unreadIds.has(n.id) ? ' unread' : ''}`}
                            onClick={() => onMarkRead(n.id)}
                        >
                            <div className="notif-item-icon">{n.icon}</div>
                            <div className="notif-item-body">
                                <div className="notif-item-title">{n.title}</div>
                                <div className="notif-item-sub">{n.sub}</div>
                            </div>
                            {unreadIds.has(n.id) && <span className="notif-unread-dot" />}
                        </div>
                    ))}
                </div>
            )}

            <div className="notif-panel-footer">
                <a href="/expiry" className="notif-footer-link" onClick={onClose}>View all expiry alerts →</a>
            </div>
        </div>
    )
}

/* ── Main TopBar ─────────────────────────────────────────── */
export default function TopBar({ title, onMobileMenuToggle }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [notifs, setNotifs] = useState([])
    const [unreadIds, setUnreadIds] = useState(new Set())
    const [notifLoading, setNotifLoading] = useState(false)

    const dropRef = useRef(null)
    const notifRef = useRef(null)

    /* Close both dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* Build notifications from API data */
    const fetchNotifs = useCallback(async () => {
        setNotifLoading(true)
        try {
            const [expiryData, statsData] = await Promise.all([
                get('/api/medicines/expiry?days=30'),
                get('/api/medicines/stats'),
            ])

            const built = []

            const expiring = expiryData.medicines || []
            const expired = expiring.filter(m => {
                const d = Math.ceil((new Date(m.expiry) - new Date()) / 86400000)
                return d < 0
            })
            const danger = expiring.filter(m => {
                const d = Math.ceil((new Date(m.expiry) - new Date()) / 86400000)
                return d >= 0 && d <= 7
            })
            const warning = expiring.filter(m => {
                const d = Math.ceil((new Date(m.expiry) - new Date()) / 86400000)
                return d > 7 && d <= 30
            })

            if (expired.length > 0) {
                built.push({
                    id: 'expired', type: 'danger',
                    icon: '💀',
                    title: `${expired.length} medicine${expired.length > 1 ? 's' : ''} have expired`,
                    sub: expired.slice(0, 2).map(m => m.name).join(', ') + (expired.length > 2 ? ` +${expired.length - 2} more` : ''),
                })
            }

            if (danger.length > 0) {
                built.push({
                    id: 'danger', type: 'danger',
                    icon: '🔴',
                    title: `${danger.length} medicine${danger.length > 1 ? 's' : ''} expire this week`,
                    sub: danger.slice(0, 2).map(m => m.name).join(', ') + (danger.length > 2 ? ` +${danger.length - 2} more` : ''),
                })
            }

            if (warning.length > 0) {
                built.push({
                    id: 'warning', type: 'warning',
                    icon: '⚠️',
                    title: `${warning.length} medicine${warning.length > 1 ? 's' : ''} expire this month`,
                    sub: warning.slice(0, 2).map(m => m.name).join(', ') + (warning.length > 2 ? ` +${warning.length - 2} more` : ''),
                })
            }

            if ((statsData.low || 0) > 0) {
                built.push({
                    id: 'low_stock', type: 'warning',
                    icon: '📦',
                    title: `${statsData.low} low-stock item${statsData.low > 1 ? 's' : ''}`,
                    sub: 'Check inventory to reorder',
                })
            }

            if ((statsData.outOfStock || 0) > 0) {
                built.push({
                    id: 'out_of_stock', type: 'danger',
                    icon: '❌',
                    title: `${statsData.outOfStock} item${statsData.outOfStock > 1 ? 's' : ''} out of stock`,
                    sub: 'Immediate reorder required',
                })
            }

            setNotifs(built)

            // Mark all as unread on first load if they're new
            const readKey = 'pharmalite_read_notifs'
            const read = JSON.parse(localStorage.getItem(readKey) || '[]')
            const newIds = new Set(built.map(n => n.id).filter(id => !read.includes(id)))
            setUnreadIds(newIds)
        } catch (err) {
            console.error('Notif fetch error', err)
        } finally {
            setNotifLoading(false)
        }
    }, [])

    /* Fetch on mount, refresh every 5 minutes */
    useEffect(() => {
        fetchNotifs()
        const interval = setInterval(fetchNotifs, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [fetchNotifs])

    /* Re-fetch when navigating to a new page */
    useEffect(() => { fetchNotifs() }, [location.pathname, fetchNotifs])

    const markRead = (id) => {
        setUnreadIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            const readKey = 'pharmalite_read_notifs'
            const read = JSON.parse(localStorage.getItem(readKey) || '[]')
            if (!read.includes(id)) localStorage.setItem(readKey, JSON.stringify([...read, id]))
            return next
        })
    }

    const markAllRead = () => {
        const ids = notifs.map(n => n.id)
        localStorage.setItem('pharmalite_read_notifs', JSON.stringify(ids))
        setUnreadIds(new Set())
    }

    const toggleNotif = () => {
        setNotifOpen(o => !o)
        setDropdownOpen(false)
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PL'

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const handleLogout = () => {
        setDropdownOpen(false)
        logout()
        navigate('/')
    }

    return (
        <header className="topbar">
            {/* Mobile hamburger */}
            <button className="topbar-hamburger" onClick={onMobileMenuToggle} aria-label="Toggle menu">
                <span /><span /><span />
            </button>

            {/* Page title */}
            <span className="topbar-title">{title}</span>

            {/* Search */}
            <SearchBox />

            <div className="topbar-actions">
                {/* Date chip */}
                <div className="topbar-date">📅 {dateStr}</div>

                {/* Notifications */}
                <div className="notif-wrap" ref={notifRef}>
                    <button
                        className={`topbar-icon-btn${notifOpen ? ' active' : ''}`}
                        title="Notifications"
                        onClick={toggleNotif}
                    >
                        🔔
                        {unreadIds.size > 0 && (
                            <span className="notif-badge">{unreadIds.size > 9 ? '9+' : unreadIds.size}</span>
                        )}
                    </button>

                    {notifOpen && (
                        <NotifPanel
                            notifs={notifs}
                            unreadIds={unreadIds}
                            loading={notifLoading}
                            onMarkAllRead={markAllRead}
                            onMarkRead={markRead}
                            onClose={() => setNotifOpen(false)}
                        />
                    )}
                </div>

                {/* Theme toggle */}
                <button
                    className={`topbar-theme-btn${theme === 'light' ? ' light' : ''}`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    <span className="theme-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                    <span className="theme-track">
                        <span className="theme-thumb" />
                    </span>
                </button>

                {/* User dropdown */}
                <div
                    className={`topbar-user${dropdownOpen ? ' open' : ''}`}
                    ref={dropRef}
                    onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false) }}
                >
                    <div className="topbar-user-avatar">{initials}</div>
                    <span className="topbar-user-name">{user?.name}</span>
                    <span className="topbar-chevron">▾</span>

                    {dropdownOpen && (
                        <div className="topbar-dropdown" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-user-info">
                                <div className="dropdown-user-name">{user?.name}</div>
                                <div className="dropdown-user-email">{user?.email}</div>
                                <span className="dropdown-user-badge">{user?.role}</span>
                            </div>

                            {[
                                { icon: '👤', label: 'My Profile', path: '/profile' },
                                { icon: '⚙️', label: 'Settings', path: '/settings' },
                                { icon: '❓', label: 'Help & Support', path: '#' },
                            ].map(item => (
                                <div 
                                    className="dropdown-item" 
                                    key={item.label} 
                                    onClick={() => { setDropdownOpen(false); if(item.path && item.path !== '#') navigate(item.path) }}
                                >
                                    <span className="dropdown-item-icon">{item.icon}</span>
                                    {item.label}
                                </div>
                            ))}

                            <div className="dropdown-divider" />

                            <div className="dropdown-item danger" onClick={handleLogout}>
                                <span className="dropdown-item-icon">🚪</span>
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
