/**
 * PharmaLite – Data Isolation Diagnostic
 * Run: node backend/scripts/diagnose.js
 * Checks how many Medicine/Supplier documents have no createdBy field,
 * and lists unique user IDs in each collection.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')

const Medicine = require('../src/models/Medicine.model')
const Sale = require('../src/models/Sale.model')
const Supplier = require('../src/models/Supplier.model')
const User = require('../src/models/User.model')

async function diagnose() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    // List all users
    const users = await User.find().select('name email _id').lean()
    console.log(`👥 Users (${users.length}):`)
    users.forEach(u => console.log(`   ${u.name} (${u.email}) → ${u._id}`))

    // Medicines
    const totalMeds = await Medicine.countDocuments()
    const unownedMeds = await Medicine.countDocuments({ createdBy: { $exists: false } })
    const ownedMedOwners = await Medicine.distinct('createdBy')
    console.log(`\n💊 Medicines: ${totalMeds} total, ${unownedMeds} have NO createdBy`)
    console.log(`   Owned by ${ownedMedOwners.length} user(s): ${ownedMedOwners.join(', ')}`)

    // Sales
    const totalSales = await Sale.countDocuments()
    const unownedSales = await Sale.countDocuments({ staff: { $exists: false } })
    const saleOwners = await Sale.distinct('staff')
    console.log(`\n🧾 Sales: ${totalSales} total, ${unownedSales} have NO staff`)
    console.log(`   Owned by ${saleOwners.length} user(s): ${saleOwners.join(', ')}`)

    // Suppliers
    const totalSups = await Supplier.countDocuments()
    const unownedSups = await Supplier.countDocuments({ createdBy: { $exists: false } })
    const supOwners = await Supplier.distinct('createdBy')
    console.log(`\n🏭 Suppliers: ${totalSups} total, ${unownedSups} have NO createdBy`)
    console.log(`   Owned by ${supOwners.length} user(s): ${supOwners.join(', ')}`)

    console.log('\n--- Cross-reference ---')
    users.forEach(u => {
        const hasMeds = ownedMedOwners.map(String).includes(String(u._id))
        const hasSales = saleOwners.map(String).includes(String(u._id))
        const hasSups = supOwners.map(String).includes(String(u._id))
        console.log(`   ${u.name}: meds=${hasMeds}, sales=${hasSales}, suppliers=${hasSups}`)
    })

    await mongoose.disconnect()
}

diagnose().catch(err => { console.error(err); process.exit(1) })
