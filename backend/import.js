const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: 'd:/Pharmalite/backend/.env' });
const User = require('d:/Pharmalite/backend/src/models/User.model');
const Medicine = require('d:/Pharmalite/backend/src/models/Medicine.model');

const data = [
    { name: 'Paracetamol', generic: '500mg Tablet', category: 'Analgesic', manufacturer: 'Cipla', stock: 120, unit: 'Strip', mrp: 25.00, price: 18.00, expiry: new Date('2026-12-31'), batch: 'MH2024A' },
    { name: 'Combiflam', generic: 'Ibuprofen + Paracetamol', category: 'Analgesic', manufacturer: 'Sanofi', stock: 90, unit: 'Strip', mrp: 35.00, price: 25.00, expiry: new Date('2026-08-30'), batch: 'MH2024B' },
    { name: 'Amoxicillin', generic: '250mg Capsule', category: 'Antibiotic', manufacturer: 'Sun Pharma', stock: 80, unit: 'Strip', mrp: 45.00, price: 30.00, expiry: new Date('2025-08-15'), batch: 'MH2024C' },
    { name: 'Azithromycin', generic: '500mg Tablet', category: 'Antibiotic', manufacturer: 'Lupin', stock: 60, unit: 'Strip', mrp: 95.00, price: 70.00, expiry: new Date('2025-11-20'), batch: 'MH2024D' },
    { name: 'Benadryl Syrup', generic: 'Diphenhydramine', category: 'Cough & Cold', manufacturer: 'Johnson & Johnson', stock: 50, unit: 'Bottle', mrp: 120.00, price: 95.00, expiry: new Date('2025-09-10'), batch: 'MH2024E' },
    { name: 'Ascoril', generic: 'Cough Syrup', category: 'Cough & Cold', manufacturer: 'Glenmark', stock: 70, unit: 'Bottle', mrp: 110.00, price: 85.00, expiry: new Date('2026-01-05'), batch: 'MH2024F' },
    { name: 'Revital H', generic: 'Multivitamin Capsule', category: 'Supplement', manufacturer: 'Sun Pharma', stock: 100, unit: 'Bottle', mrp: 150.00, price: 120.00, expiry: new Date('2026-07-18'), batch: 'MH2024G' },
    { name: 'Zincovit', generic: 'Multivitamin Tablet', category: 'Supplement', manufacturer: 'Apex Labs', stock: 85, unit: 'Strip', mrp: 95.00, price: 75.00, expiry: new Date('2026-03-25'), batch: 'MH2024H' },
    { name: 'ORS Powder', generic: 'Electrolytes', category: 'Rehydration', manufacturer: 'FDC Ltd', stock: 200, unit: 'Sachet', mrp: 20.00, price: 12.00, expiry: new Date('2027-02-10'), batch: 'MH2024I' },
    { name: 'Electral', generic: 'Oral Rehydration Salt', category: 'Rehydration', manufacturer: 'FDC Ltd', stock: 180, unit: 'Sachet', mrp: 22.00, price: 14.00, expiry: new Date('2027-01-15'), batch: 'MH2024J' },
    { name: 'Metformin', generic: '500mg Tablet', category: 'Diabetes', manufacturer: 'Glenmark', stock: 110, unit: 'Strip', mrp: 30.00, price: 22.00, expiry: new Date('2025-07-12'), batch: 'MH2024K' },
    { name: 'Glimepiride', generic: '1mg Tablet', category: 'Diabetes', manufacturer: 'USV Pharma', stock: 75, unit: 'Strip', mrp: 60.00, price: 45.00, expiry: new Date('2026-04-08'), batch: 'MH2024L' },
    { name: 'Cetirizine', generic: '10mg Tablet', category: 'Allergy', manufacturer: 'Zydus', stock: 150, unit: 'Strip', mrp: 20.00, price: 12.00, expiry: new Date('2026-09-14'), batch: 'MH2024M' },
    { name: 'Loratadine', generic: '10mg Tablet', category: 'Allergy', manufacturer: 'Cipla', stock: 95, unit: 'Strip', mrp: 30.00, price: 20.00, expiry: new Date('2026-06-30'), batch: 'MH2024N' },
    { name: 'Pantoprazole', generic: '40mg Tablet', category: 'Gastric', manufacturer: 'Torrent Pharma', stock: 90, unit: 'Strip', mrp: 55.00, price: 40.00, expiry: new Date('2026-03-11'), batch: 'MH2024O' },
    { name: 'Omeprazole', generic: '20mg Capsule', category: 'Gastric', manufacturer: 'Cipla', stock: 95, unit: 'Strip', mrp: 50.00, price: 35.00, expiry: new Date('2025-10-22'), batch: 'MH2024P' },
    { name: 'Atenolol', generic: '50mg Tablet', category: 'Cardiac', manufacturer: 'Ipca Labs', stock: 60, unit: 'Strip', mrp: 40.00, price: 28.00, expiry: new Date('2026-05-19'), batch: 'MH2024Q' },
    { name: 'Nitroglycerin', generic: '2.5mg Tablet', category: 'Cardiac', manufacturer: 'Pfizer', stock: 40, unit: 'Strip', mrp: 150.00, price: 120.00, expiry: new Date('2025-12-05'), batch: 'MH2024R' },
    { name: 'Amlodipine', generic: '5mg Tablet', category: 'Cardiovascular', manufacturer: 'Sun Pharma', stock: 85, unit: 'Strip', mrp: 35.00, price: 25.00, expiry: new Date('2026-08-09'), batch: 'MH2024S' },
    { name: 'Atorvastatin', generic: '10mg Tablet', category: 'Cardiovascular', manufacturer: 'Lupin', stock: 70, unit: 'Strip', mrp: 85.00, price: 65.00, expiry: new Date('2026-05-27'), batch: 'MH2024T' },
    { name: 'Generic Tablet X', generic: '250mg', category: 'Other', manufacturer: 'Local Pharma', stock: 50, unit: 'Strip', mrp: 20.00, price: 10.00, expiry: new Date('2025-11-11'), batch: 'MH2024U' }
];

async function run() {
    let log = '';
    try {
        await mongoose.connect(process.env.MONGO_URI);
        log += 'Connected to DB\n';

        const user = await User.findOne({ name: { $regex: new RegExp('parag', 'i') } });
        if (!user) {
            log += 'User "parag" not found! Did they register first?\n';
            fs.writeFileSync('d:/Pharmalite/backend/import_log.txt', log);
            process.exit(1);
        }

        log += `Found user: ${user.name} (${user._id})\n`;

        let insertedCount = 0;
        for (const item of data) {
            const exists = await Medicine.findOne({ batch: item.batch, createdBy: user._id });
            if (!exists) {
                await Medicine.create({ ...item, createdBy: user._id });
                insertedCount++;
            }
        }
        
        log += `Inserted ${insertedCount} new records.\n`;
        const count = await Medicine.countDocuments({ createdBy: user._id });
        log += `Total medicines for user: ${count}\n`;
    } catch (err) {
        log += `Error: ${err.message}\n`;
    } finally {
        mongoose.disconnect();
        fs.writeFileSync('d:/Pharmalite/backend/import_log.txt', log);
        process.exit(0);
    }
}

run();
