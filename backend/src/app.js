const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth.routes')
const medicineRoutes = require('./routes/medicines.routes')
const salesRoutes = require('./routes/sales.routes')
const supplierRoutes = require('./routes/suppliers.routes')
const staffRoutes = require('./routes/staff.routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

/* ── CORS ── */
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
]
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (curl, Postman) and listed origins
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
        cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
}))

/* ── Body parsing ── */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ── MongoDB connection ── */
mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,  // Use IPv4, avoids some TLS SNI issues on Windows
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    })

/* ── Health check ── */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

/* ── Routes ── */
app.use('/api/auth', authRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/staff', staffRoutes)

/* ── 404 handler ── */
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.url} not found` }))

/* ── Global error handler ── */
app.use(errorHandler)

module.exports = app
