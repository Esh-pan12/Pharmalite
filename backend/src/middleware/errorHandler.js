module.exports = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message)

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ message: messages.join(', ') })
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0]
        return res.status(409).json({ message: `${field} already exists.` })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token.' })
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    })
}
