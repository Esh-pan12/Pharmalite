const express = require('express')
const Supplier = require('../models/Supplier.model')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', auth, async (req, res, next) => {
    try {
        const suppliers = await Supplier.find({ createdBy: req.user._id }).sort('-createdAt')
        res.json({ suppliers })
    } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
    try {
        const supplier = await Supplier.create({ ...req.body, createdBy: req.user._id })
        res.status(201).json({ supplier })
    } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        )
        if (!supplier) return res.status(404).json({ message: 'Supplier not found.' })
        res.json({ supplier })
    } catch (err) { next(err) }
})

router.delete('/:id', auth, async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
        if (!supplier) return res.status(404).json({ message: 'Supplier not found.' })
        res.json({ message: 'Supplier deleted.' })
    } catch (err) { next(err) }
})

module.exports = router
