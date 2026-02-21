import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './Dashboard.css'

export default function DashboardLayout({ title = 'Dashboard', children }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="dash-shell">
            <Sidebar
                collapsed={collapsed}
                onCollapse={() => setCollapsed(c => !c)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className={`dash-main${collapsed ? ' sidebar-collapsed' : ''}`}>
                <TopBar
                    title={title}
                    onMobileMenuToggle={() => setMobileOpen(o => !o)}
                />
                <div className="dash-content">
                    {children}
                </div>
            </div>
        </div>
    )
}
