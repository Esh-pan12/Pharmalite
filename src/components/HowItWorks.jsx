import './HowItWorks.css'

const steps = [
    {
        num: '01',
        emoji: '🎯',
        title: 'Create Your Account',
        desc: 'Sign up in under 2 minutes. No credit card required. Get instant access to your pharmacy dashboard.',
    },
    {
        num: '02',
        emoji: '📥',
        title: 'Add Your Inventory',
        desc: 'Import existing stock via CSV or add medicines one by one with our simple, guided form.',
    },
    {
        num: '03',
        emoji: '🚀',
        title: 'Manage & Grow',
        desc: 'Track sales, get expiry alerts, generate reports, and scale your pharmacy operations with confidence.',
    },
]

export default function HowItWorks() {
    return (
        <section className="how-it-works" id="how-it-works">
            <div className="container">
                <div className="how-header">
                    <div className="section-label">✦ Process</div>
                    <h2 className="section-title">
                        Up and running in <span className="text-gradient">3 simple steps</span>
                    </h2>
                    <p className="section-subtitle">
                        Getting started with PharmaLite is effortless — no technical knowledge required,
                        no lengthy onboarding.
                    </p>
                </div>

                <div className="steps-grid">
                    {steps.map((step, i) => (
                        <div className="step-card" key={i}>
                            <div className="step-number-wrap">
                                <div className="step-number">{step.num}</div>
                                <span className="step-emoji">{step.emoji}</span>
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
