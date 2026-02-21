const express = require('express')
const User = require('../models/User.model')
const auth = require('../middleware/auth')

const router = express.Router()

/* List all staff (admin only) */
router.get('/', auth, async (req, res, next) => {
    try {
        const staff = await User.find().select('-password').sort('-createdAt')
        res.json({ staff })
    } catch (err) { next(err) }
})

/* Update role/details */
router.put('/:id', auth, async (req, res, next) => {
    try {
        const { name, role, pharmacyName, licenseNo } = req.body
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, role, pharmacyName, licenseNo },
            { new: true, runValidators: true }
        ).select('-password')
        if (!user) return res.status(404).json({ message: 'Staff member not found.' })
        res.json({ user })
    } catch (err) { next(err) }
})

/* Deactivate (delete) staff */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account.' })
        }
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ message: 'Staff member not found.' })
        res.json({ message: 'Staff member removed.' })
    } catch (err) { next(err) }
})

module.exports = router
