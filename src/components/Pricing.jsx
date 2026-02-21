import './Pricing.css'

const plans = [
    {
        name: 'Free',
        price: '0',
        period: '/month',
        tagline: 'Perfect for getting started',
        features: [
            { label: 'Up to 200 SKUs', ok: true },
            { label: '1 Staff Account', ok: true },
            { label: 'Basic Sales Reports', ok: true },
            { label: 'Expiry Alerts (7-day)', ok: true },
            { label: 'Advanced Analytics', ok: false },
            { label: 'CSV Import / Export', ok: false },
            { label: 'Priority Support', ok: false },
        ],
        cta: 'Get Started Free',
        ctaClass: 'btn-outline',
        popular: false,
    },
    {
        name: 'Pro',
        price: '499',
        period: '/month',
        tagline: 'Best for growing pharmacies',
        features: [
            { label: 'Unlimited SKUs', ok: true },
            { label: '10 Staff Accounts', ok: true },
            { label: 'Advanced Analytics', ok: true },
            { label: 'Expiry Alerts (30/15/7-day)', ok: true },
            { label: 'CSV Import / Export', ok: true },
            { label: 'Custom Reports', ok: true },
            { label: 'Priority Support', ok: false },
        ],
        cta: 'Start Pro Trial',
        ctaClass: 'btn-primary',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '1,499',
        period: '/month',
        tagline: 'For pharmacy chains & groups',
        features: [
            { label: 'Unlimited SKUs & Branches', ok: true },
            { label: 'Unlimited Staff Accounts', ok: true },
            { label: 'Full Analytics Suite', ok: true },
            { label: 'All Alert Types', ok: true },
            { label: 'API Access', ok: true },
            { label: 'Custom Integrations', ok: true },
            { label: '24/7 Dedicated Support', ok: true },
        ],
        cta: 'Contact Sales',
        ctaClass: 'btn-outline',
        popular: false,
    },
]

export default function Pricing() {
    return (
        <section className="pricing" id="pricing">
            <div className="container">
                <div className="pricing-header">
                    <div className="section-label">✦ Pricing</div>
                    <h2 className="section-title">
                        Simple, <span className="text-gradient">transparent pricing</span>
                    </h2>
                    <p className="section-subtitle">
                        Start free, upgrade when you need more. No hidden fees, no surprises.
                    </p>
                </div>

                <div className="pricing-grid">
                    {plans.map((plan, i) => (
                        <div key={i} className={`pricing-card${plan.popular ? ' popular' : ''}`}>
                            {plan.popular && <span className="popular-badge">Most Popular</span>}
                            <div className="plan-name">{plan.name}</div>
                            <div className="plan-price">
                                <span className="plan-currency">₹</span>
                                <span className="plan-amount">{plan.price}</span>
                                <span className="plan-period">{plan.period}</span>
                            </div>
                            <p className="plan-tagline">{plan.tagline}</p>
                            <ul className="plan-features">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="plan-feature">
                                        <span className={`plan-feature-icon ${f.ok ? 'check' : 'cross'}`}>
                                            {f.ok ? '✓' : '×'}
                                        </span>
                                        {f.label}
                                    </li>
                                ))}
                            </ul>
                            <a href="#contact" className={`btn ${plan.ctaClass}`}>{plan.cta}</a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
