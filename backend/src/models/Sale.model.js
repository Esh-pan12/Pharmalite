const mongoose = require('mongoose')

const saleItemSchema = new mongoose.Schema({
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },   // snapshot at time of sale
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },   // MRP at time of sale
})

const saleSchema = new mongoose.Schema({
    invoiceNo: { type: String, unique: true },
    customer: { type: String, default: 'Walk-in' },
    items: { type: [saleItemSchema], required: true },
    total: { type: Number, required: true },
    payment: {
        type: String,
        enum: ['cash', 'upi', 'card', 'credit'],
        required: true,
    },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

/* Auto-generate invoice number (per-user sequence) */
saleSchema.pre('save', async function (next) {
    if (!this.invoiceNo) {
        const count = await mongoose.model('Sale').countDocuments({ staff: this.staff })
        this.invoiceNo = `INV-${String(count + 1).padStart(5, '0')}`
    }
    next()
})

module.exports = mongoose.model('Sale', saleSchema)
