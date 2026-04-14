import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../dashboard/DashboardLayout'
import { get } from '../api/client'
import './Reports.css'

const fmtINR = (v) => `₹${v.toLocaleString('en-IN')}`

/* ── Math helpers for Data Science ── */
// Simple Linear Regression (y = mx + b)
function calculateLinearRegression(dataPoints) {
    const n = dataPoints.length
    if (n === 0) return { m: 0, b: 0 }
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
    dataPoints.forEach((point) => {
        sumX += point.x
        sumY += point.y
        sumXY += point.x * point.y
        sumXX += point.x * point.x
    })
    
    const denominator = (n * sumXX) - (sumX * sumX)
    if (denominator === 0) return { m: 0, b: sumY / n }
    
    const m = ((n * sumXY) - (sumX * sumY)) / denominator
    const b = (sumY - (m * sumX)) / n
    return { m, b }
}

export default function Reports() {
    const [sales, setSales] = useState([])
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch data
    useEffect(() => {
        let active = true
        async function load() {
            try {
                // Fetch a large sample for big data analytics
                const [salesRes, medsRes] = await Promise.all([
                    get('/api/sales?limit=2000'),
                    get('/api/medicines?limit=2000')
                ])
                if (!active) return
                setSales(salesRes.sales || [])
                setMedicines(medsRes.medicines || [])
            } catch (err) {
                if (active) setError(err.message)
            } finally {
                if (active) setLoading(false)
            }
        }
        load()
        return () => { active = false }
    }, [])

    /* ── 1. Pareto Analysis (80/20 Rule) ── */
    const paretoData = useMemo(() => {
        if (!sales.length) return { list: [], thresholdIdx: 0 }
        
        let itemRev = {}
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemRev[item.name]) itemRev[item.name] = 0
                itemRev[item.name] += (item.qty * item.price)
            })
        })
        
        // Sort descending by revenue
        let sorted = Object.entries(itemRev)
            .map(([name, rev]) => ({ name, rev }))
            .sort((a, b) => b.rev - a.rev)
            
        const totalRev = sorted.reduce((sum, item) => sum + item.rev, 0)
        
        // Calculate cumulative percentage
        let agg = 0
        let thresholdIdx = -1
        let list = sorted.map((item, idx) => {
            agg += item.rev
            const pct = (agg / totalRev) * 100
            if (pct >= 80 && thresholdIdx === -1) {
                thresholdIdx = idx
            }
            return { ...item, pct, basePct: (item.rev / totalRev) * 100 }
        })
        
        return { list, thresholdIdx: thresholdIdx === -1 ? list.length - 1 : thresholdIdx, totalRev }
    }, [sales])

    /* ── 2. Sales Forecasting (Linear Regression 30-day lookback, 7-day predict) ── */
    const forecastData = useMemo(() => {
        if (!sales.length) return { history: [], prediction: [], trend: 0 }
        
        // Group sales by day for the last 30 days
        const now = new Date()
        now.setHours(0,0,0,0)
        
        let dailyData = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const daySales = sales.filter(s => {
                const sd = new Date(s.createdAt)
                return sd.getDate() === d.getDate() && 
                       sd.getMonth() === d.getMonth() && 
                       sd.getFullYear() === d.getFullYear()
            })
            const rev = daySales.reduce((sum, s) => sum + s.total, 0)
            const label = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            dailyData.push({ x: 30 - i, y: rev, label })
        }

        // Apply Linear Regression
        const { m, b } = calculateLinearRegression(dailyData)
        
        // Project next 7 days
        let prediction = []
        let predictedTotal = 0
        for (let i = 1; i <= 7; i++) {
            const d = new Date(now)
            d.setDate(d.getDate() + i)
            const dStr = d.toISOString().slice(0, 10)
            let projRev = Math.max(0, m * (30 + i) + b) // Prevent negative prediction
            prediction.push({ x: 30 + i, y: projRev, label: dStr.slice(5) })
            predictedTotal += projRev
        }
        
        return { history: dailyData, prediction, trend: m, predictedTotal }
    }, [sales])

    /* ── 3. CSV Export Function ── */
    const exportCSV = () => {
        if (!paretoData.list.length) return
        
        // Headers
        let csvContent = "data:text/csv;charset=utf-8,\n"
        csvContent += "Item Name,Total Revenue,Percentage of Total\n"
        
        paretoData.list.forEach(item => {
            csvContent += `"${item.name}",${item.rev},${item.pct.toFixed(2)}%\n`
        })
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `pharmalite_pareto_report_${new Date().toISOString().slice(0,10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <DashboardLayout title="Analytics & Reports">
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="auth-spinner" style={{ marginBottom: 16 }} />
                    <p>Crunching big data...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout title="Analytics & Reports">
                <div style={{ color: '#ef4444', padding: 24 }}>Error: {error}</div>
            </DashboardLayout>
        )
    }

    const { list: pareto, thresholdIdx, totalRev } = paretoData

    // Max Y for historical charts
    const yMaxList = [...forecastData.history, ...forecastData.prediction].map(d => d.y)
    const yMax = Math.max(...yMaxList, 1)

    return (
        <DashboardLayout title="Analytics & Reports">
            <div className="dash-page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h1>🧠 Data Science &amp; Reports</h1>
                    <p>Advanced predictive analytics powered by machine learning algorithms.</p>
                </div>
                <button className="btn btn-secondary" onClick={exportCSV}>
                    ⬇️ Export CSV Report
                </button>
            </div>

            <div className="reports-grid">
                
                {/* ── Forecasting Widget ── */}
                <div className="r-widget">
                    <div className="r-widget-header" style={{ marginBottom: 12 }}>
                        <div>
                            <div className="r-widget-title">📈 7-Day Revenue Forecast</div>
                            <div className="r-widget-desc">Linear regression analysis over the last 30 days of sales data.</div>
                        </div>
                        <div className={`trend ${forecastData.trend > 0 ? 'up' : 'down'}`}>
                            {forecastData.trend > 0 ? '↗' : '↘'} {Math.abs(forecastData.trend).toFixed(2)} / day trend
                        </div>
                    </div>
                    
                    <div className="forecast-area">
                        <div className="insight-card">
                            <div className="insight-sub">Forecasted Next 7 Days</div>
                            <div className="insight-val">{fmtINR(Math.round(forecastData.predictedTotal))}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Based on trend coefficient (r): {forecastData.trend.toFixed(3)}
                            </div>
                        </div>
                    </div>

                    <div className="lr-chart-wrap">
                        {forecastData.history.slice(-14).map(d => ( // display only last 14 days for space
                            <div key={`hist-${d.label}`} className="lr-bar" 
                                style={{ height: `${(d.y / yMax) * 100}%` }} 
                                data-tip={`${d.label}: ${fmtINR(Math.round(d.y))}`} />
                        ))}
                        <div style={{ borderLeft: '2px dashed var(--border)', height: '100%', margin: '0 4px' }} />
                        {forecastData.prediction.map(d => (
                            <div key={`pred-${d.label}`} className="lr-bar predicted" 
                                style={{ height: `${(d.y / yMax) * 100}%` }} 
                                data-tip={`${d.label}: ${fmtINR(Math.round(d.y))} (Est.)`} />
                        ))}
                    </div>
                    <div className="lr-legend">
                        <div><span className="lr-dot" style={{ background: 'var(--primary)' }} /> Actual (Last 14 Days)</div>
                        <div><span className="lr-dot" style={{ background: '#3b82f6' }} /> Predicted</div>
                    </div>
                </div>

                <div className="r-grid-2">
                    {/* ── Pareto Analysis Widget (ABC Classification) ── */}
                    <div className="r-widget">
                        <div className="r-widget-header">
                            <div>
                                <div className="r-widget-title">💎 Pareto Analysis (80/20 Rule)</div>
                                <div className="r-widget-desc">These exact products drive 80% of your total pharmacy revenue.</div>
                            </div>
                        </div>
                        
                        <table className="pareto-table">
                            <thead>
                                <tr>
                                    <th>Medicine Name</th>
                                    <th>Total Revenue</th>
                                    <th>% of Sales</th>
                                    <th>Cum. %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pareto.slice(0, thresholdIdx + 3).map((item, i) => (
                                    <tr key={item.name} style={{ background: i <= thresholdIdx ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                                        <td style={{ fontWeight: i <= thresholdIdx ? 700 : 500 }}>
                                            {item.name} {i === thresholdIdx && <span style={{ fontSize: '0.65rem', marginLeft: 6, background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>80% CUTOFF</span>}
                                        </td>
                                        <td>{fmtINR(item.rev)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span>{item.basePct.toFixed(1)}%</span>
                                                <div className="pareto-bar-wrap" style={{ width: 40 }}>
                                                    <div className="pareto-bar" style={{ width: `${item.basePct.toFixed(1)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: i <= thresholdIdx ? '#10b981' : 'var(--text-muted)' }}>
                                            {item.pct.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Analytics Quick Stats ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="r-widget" style={{ flex: 1 }}>
                            <div className="r-widget-title" style={{ marginBottom: 16 }}>📊 Deep Insights</div>
                            
                            <div className="insight-card" style={{ marginBottom: 16 }}>
                                <div className="insight-sub">Total Datapoints Analyzed</div>
                                <div className="insight-val">{sales.length + medicines.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions & Inventory Nodes</div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-sub">Profit Concentration</div>
                                <div className="insight-val">
                                    {Math.round(((thresholdIdx + 1) / Math.max(1, pareto.length)) * 100)}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    of your active catalog generates 80% of revenue. Keep these items always highly stocked.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
