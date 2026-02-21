require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`\n🚀 PharmaLite API running on http://localhost:${PORT}`)
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})
