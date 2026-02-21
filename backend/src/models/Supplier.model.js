const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true },
    email: { type: String, default: '' },
    gst: { type: String, default: '' },
    address: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Supplier', supplierSchema)
