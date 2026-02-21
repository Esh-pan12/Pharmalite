const mongoose = require('mongoose')

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    generic: { type: String, default: '' },
    category: { type: String, required: true },
    manufacturer: { type: String, required: true },
    batch: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: 'Tablet' },
    price: { type: Number, min: 0, default: 0 },  // purchase price (optional)
    mrp: { type: Number, required: true, min: 0 },  // selling price
    expiry: { type: Date, required: true },
    reorderLevel: { type: Number, default: 20 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

/* Virtual: days until expiry */
medicineSchema.virtual('daysUntilExpiry').get(function () {
    return Math.ceil((this.expiry - new Date()) / 86400000)
})

/* Virtual: status */
medicineSchema.virtual('status').get(function () {
    const days = this.daysUntilExpiry
    if (days < 0) return 'expired'
    if (days <= 30) return 'expiring'
    if (this.stock <= 0) return 'out_of_stock'
    if (this.stock <= this.reorderLevel) return 'low'
    return 'in_stock'
})

medicineSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Medicine', medicineSchema)
