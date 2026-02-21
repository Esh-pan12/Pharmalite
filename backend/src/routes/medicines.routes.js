const express = require('express')
const { body, query, validationResult } = require('express-validator')
const Medicine = require('../models/Medicine.model')
const auth = require('../middleware/auth')

const router = express.Router()

/* ── GET /api/medicines — List with search / filter / sort ── */
router.get('/', auth, async (req, res, next) => {
    try {
        const { search, category, status, sort = '-createdAt', page = 1, limit = 20 } = req.query
        const filter = {}

        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { generic: { $regex: search, $options: 'i' } },
            { manufacturer: { $regex: search, $options: 'i' } },
            { batch: { $regex: search, $options: 'i' } },
        ]
        if (category && category !== 'All') filter.category = category

        let medicines = await Medicine.find(filter).sort(sort)
            .skip((page - 1) * limit).limit(Number(limit))

        // Filter by status after hydration (uses virtual)
        if (status && status !== 'all') {
            medicines = medicines.filter(m => m.status === status)
        }

        const total = await Medicine.countDocuments(filter)
        res.json({ medicines, total, page: Number(page) })
    } catch (err) { next(err) }
})

/* ── GET /api/medicines/stats ── KPI counts ── */
router.get('/stats', auth, async (req, res, next) => {
    try {
        const all = await Medicine.find()
        const total = all.length
        const inStock = all.filter(m => m.status === 'in_stock').length
        const low = all.filter(m => m.status === 'low').length
        const expiring = all.filter(m => m.status === 'expiring').length
        const expired = all.filter(m => m.status === 'expired').length
        const outOfStock = all.filter(m => m.status === 'out_of_stock').length
        res.json({ total, inStock, low, expiring, expired, outOfStock })
    } catch (err) { next(err) }
})

/* ── GET /api/medicines/expiry?days=30 ── Expiring soon ── */
router.get('/expiry', auth, async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() + days)

        const medicines = await Medicine.find({ expiry: { $lte: cutoff } }).sort('expiry')
        res.json({ medicines })
    } catch (err) { next(err) }
})

/* ── POST /api/medicines ── Add ── */
router.post('/', auth, [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('batch').notEmpty().withMessage('Batch number is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
    body('expiry').isISO8601().withMessage('Valid expiry date required'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

        const medicine = await Medicine.create({ ...req.body, createdBy: req.user._id })
        res.status(201).json({ medicine })
    } catch (err) { next(err) }
})

/* ── PUT /api/medicines/:id ── Edit ── */
router.put('/:id', auth, async (req, res, next) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        })
        if (!medicine) return res.status(404).json({ message: 'Medicine not found.' })
        res.json({ medicine })
    } catch (err) { next(err) }
})

/* ── DELETE /api/medicines/:id ── ── */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id)
        if (!medicine) return res.status(404).json({ message: 'Medicine not found.' })
        res.json({ message: 'Medicine deleted.' })
    } catch (err) { next(err) }
})

module.exports = router
