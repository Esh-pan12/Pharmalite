const express = require('express')
const { body, validationResult } = require('express-validator')
const Sale = require('../models/Sale.model')
const Medicine = require('../models/Medicine.model')
const auth = require('../middleware/auth')

const router = express.Router()

/* ── GET /api/sales ── List with optional date filter ── */
router.get('/', auth, async (req, res, next) => {
    try {
        const { from, to, payment, page = 1, limit = 20 } = req.query
        const filter = {}

        if (from || to) {
            filter.createdAt = {}
            if (from) filter.createdAt.$gte = new Date(from)
            if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z')
        }
        if (payment) filter.payment = payment

        const total = await Sale.countDocuments(filter)
        const sales = await Sale.find(filter)
            .populate('staff', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))

        res.json({ sales, total, page: Number(page) })
    } catch (err) { next(err) }
})

/* ── GET /api/sales/summary?period=today ── KPI ── */
router.get('/summary', auth, async (req, res, next) => {
    try {
        const { period = 'today' } = req.query
        const now = new Date()
        let from = new Date()

        if (period === 'today') from.setHours(0, 0, 0, 0)
        else if (period === 'week') from.setDate(now.getDate() - 6)
        else if (period === 'month') from.setDate(now.getDate() - 29)
        else from = new Date(0)

        const sales = await Sale.find({ createdAt: { $gte: from } })
        const revenue = sales.reduce((s, t) => s + t.total, 0)
        const txns = sales.length
        const avgTicket = txns ? Math.round(revenue / txns) : 0

        const byPayment = sales.reduce((acc, s) => {
            acc[s.payment] = (acc[s.payment] || 0) + 1
            return acc
        }, {})

        res.json({ revenue, txns, avgTicket, byPayment })
    } catch (err) { next(err) }
})

/* ── POST /api/sales ── Create sale + deduct stock ── */
router.post('/', auth, [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('payment').isIn(['cash', 'upi', 'card', 'credit']).withMessage('Invalid payment method'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

        const { customer, items, payment } = req.body

        // Validate stock and calculate total
        let total = 0
        const enriched = []
        for (const item of items) {
            const med = await Medicine.findById(item.medicine)
            if (!med) return res.status(404).json({ message: `Medicine ${item.medicine} not found.` })
            if (med.stock < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${med.name}. Available: ${med.stock}` })
            }
            total += med.mrp * item.qty
            enriched.push({ medicine: med._id, name: med.name, qty: item.qty, price: med.mrp })
        }

        // Deduct stock
        for (const item of enriched) {
            await Medicine.findByIdAndUpdate(item.medicine, { $inc: { stock: -item.qty } })
        }

        const sale = await Sale.create({
            customer: customer || 'Walk-in',
            items: enriched,
            total: Math.round(total * 100) / 100,
            payment,
            staff: req.user._id,
        })

        res.status(201).json({ sale })
    } catch (err) { next(err) }
})

/* ── GET /api/sales/:id ── Single sale ── */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('staff', 'name')
        if (!sale) return res.status(404).json({ message: 'Sale not found.' })
        res.json({ sale })
    } catch (err) { next(err) }
})

module.exports = router
