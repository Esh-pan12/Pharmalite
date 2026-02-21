import { useEffect, useRef, useState } from 'react'
import './Stats.css'

const stats = [
    { value: 500, suffix: '+', label: 'Pharmacies Onboarded', sub: 'Across India' },
    { value: 50000, suffix: '+', label: 'Medicines Tracked', sub: 'Daily' },
    { value: 99.9, suffix: '%', label: 'Platform Uptime', sub: 'SLA Guaranteed' },
    { value: 24, suffix: '/7', label: 'Customer Support', sub: 'Always Available' },
]

function useCountUp(target, duration = 1600, started) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!started) return
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(parseFloat(start.toFixed(target < 100 ? 1 : 0)))
        }, 16)
        return () => clearInterval(timer)
    }, [started, target, duration])
    return count
}

function StatItem({ stat }) {
    const ref = useRef(null)
    const [started, setStarted] = useState(false)
    const count = useCountUp(stat.value, 1800, started)

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
            { threshold: 0.5 }
        )
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [])

    return (
        <div className="stat-item" ref={ref}>
            <div className="stat-value">
                {count}{stat.suffix}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-sublabel">{stat.sub}</div>
        </div>
    )
}

export default function Stats() {
    return (
        <section className="stats">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((s, i) => <StatItem key={i} stat={s} />)}
                </div>
            </div>
        </section>
    )
}
