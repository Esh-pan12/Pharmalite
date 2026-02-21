import './Features.css'

const features = [
    {
        icon: '📦',
        color: 'green',
        title: 'Smart Inventory',
        desc: 'Real-time stock tracking with low-stock alerts. Never run out of essential medicines again.',
    },
    {
        icon: '💊',
        color: 'purple',
        title: 'Medicine Tracking',
        desc: 'Barcode-based medicine entry with batch number, manufacturer, and unit-wise pricing.',
    },
    {
        icon: '🔔',
        color: 'orange',
        title: 'Expiry Alerts',
        desc: 'Automated notifications for medicines nearing expiry — 30, 15, and 7 day warnings.',
    },
    {
        icon: '📊',
        color: 'blue',
        title: 'Sales Reports',
        desc: 'Daily, weekly, and monthly sales analytics with visual charts to track your growth.',
    },
    {
        icon: '👤',
        color: 'pink',
        title: 'Staff Management',
        desc: 'Role-based access for pharmacists, cashiers, and admins. Full audit trail.',
    },
    {
        icon: '🔐',
        color: 'teal',
        title: 'Secure & Encrypted',
        desc: 'JWT authentication, encrypted data storage, and automatic cloud backups.',
    },
]

export default function Features() {
    return (
        <section className="features" id="features">
            <div className="container">
                <div className="features-header">
                    <div className="section-label">✦ Features</div>
                    <h2 className="section-title">
                        Everything your pharmacy <span className="text-gradient">needs to thrive</span>
                    </h2>
                    <p className="section-subtitle">
                        From inventory tracking to expiry alerts — PharmaLite gives you all the tools
                        to run a modern, efficient pharmacy.
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-card-content">
                                <div className={`feature-icon-wrap ${f.color}`}>
                                    {f.icon}
                                </div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                            <div className="feature-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
