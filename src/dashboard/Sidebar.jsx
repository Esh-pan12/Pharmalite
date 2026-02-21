import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const navGroups = [
    {
        label: 'Main',
        items: [
            { icon: '🏠', label: 'Dashboard', to: '/dashboard', badge: null },
            { icon: '💊', label: 'Inventory', to: '/inventory', badge: null },
            { icon: '💰', label: 'Sales', to: '/sales', badge: null },
            { icon: '📊', label: 'Reports', to: '/reports', badge: null },
        ],
    },
    {
        label: 'Management',
        items: [
            { icon: '⚠️', label: 'Expiry Alerts', to: '/expiry', badge: '7' },
            { icon: '📦', label: 'Suppliers', to: '/suppliers', badge: null },
            { icon: '👤', label: 'Staff', to: '/staff', badge: null },
        ],
    },
    {
        label: 'Settings',
        items: [
            { icon: '⚙️', label: 'Settings', to: '/settings', badge: null },
            { icon: '👤', label: 'Profile', to: '/settings', badge: null },
        ],
    },
]

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PL'

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay${mobileOpen ? ' active' : ''}`}
                onClick={onMobileClose}
            />

            <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
                {/* Collapse toggle (desktop) */}
                <button
                    className="sidebar-collapse-btn"
                    onClick={onCollapse}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '›' : '‹'}
                </button>

                {/* Logo */}
                <NavLink to="/" className="sidebar-logo">
                    <div className="sidebar-logo-icon">💊</div>
                    <span className="sidebar-logo-text">Pharma<span>Lite</span></span>
                </NavLink>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navGroups.map(group => (
                        <div key={group.label}>
                            <div className="sidebar-section-label">{group.label}</div>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    data-label={item.label}
                                    className={({ isActive }) =>
                                        `sidebar-item${isActive ? ' active' : ''}`
                                    }
                                    onClick={onMobileClose}
                                >
                                    <span className="sidebar-item-icon">{item.icon}</span>
                                    <span className="sidebar-item-label">{item.label}</span>
                                    {item.badge && (
                                        <span className="sidebar-badge">{item.badge}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Bottom user card */}
                <div className="sidebar-user">
                    <div className="sidebar-user-inner" onClick={handleLogout} title="Sign out">
                        <div className="sidebar-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name ?? 'Pharmacist'}</div>
                            <div className="sidebar-user-role">{user?.role ?? 'Admin'} · Sign out</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
