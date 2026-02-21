const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
        type: String,
        enum: ['admin', 'pharmacist', 'billing', 'staff'],
        default: 'admin',
    },
    pharmacyName: { type: String, default: '' },
    licenseNo: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
}, { timestamps: true })

/* Hash password before saving */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

/* Compare password helper */
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

/* Never return password in JSON */
userSchema.set('toJSON', {
    transform: (_, obj) => { delete obj.password; return obj },
})

module.exports = mongoose.model('User', userSchema)
