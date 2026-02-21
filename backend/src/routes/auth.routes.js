const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User.model')
const auth = require('../middleware/auth')

const router = express.Router()

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

/* ── POST /api/auth/register ── */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

        const { name, email, password, pharmacyName, licenseNo } = req.body

        const existing = await User.findOne({ email })
        if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

        const user = await User.create({ name, email, password, pharmacyName, licenseNo })
        const token = signToken(user._id)

        res.status(201).json({ token, user })
    } catch (err) { next(err) }
})

/* ── POST /api/auth/login ── */
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

        const { email, password } = req.body

        const user = await User.findOne({ email }).select('+password')
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

        const match = await user.comparePassword(password)
        if (!match) return res.status(401).json({ message: 'Invalid email or password.' })

        const token = signToken(user._id)
        res.json({ token, user })
    } catch (err) { next(err) }
})

/* ── GET /api/auth/me ── */
router.get('/me', auth, (req, res) => {
    res.json({ user: req.user })
})

/* ── PUT /api/auth/me ── Update profile */
router.put('/me', auth, async (req, res, next) => {
    try {
        const allowed = ['name', 'phone', 'pharmacyName', 'licenseNo', 'address', 'city', 'state', 'pincode']
        const updates = {}
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
        res.json({ user })
    } catch (err) { next(err) }
})

/* ── POST /api/auth/change-password ── */
router.post('/change-password', auth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: 'Current and new password are required.' })
        if (newPassword.length < 6)
            return res.status(400).json({ message: 'New password must be at least 6 characters.' })

        const user = await User.findById(req.user._id).select('+password')
        const match = await user.comparePassword(currentPassword)
        if (!match) return res.status(401).json({ message: 'Current password is incorrect.' })

        user.password = newPassword
        await user.save()
        res.json({ message: 'Password updated successfully.' })
    } catch (err) { next(err) }
})

module.exports = router
