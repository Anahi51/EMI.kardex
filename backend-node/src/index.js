require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

// Import routes
const blockchainRoutes = require('./routes/blockchain')

const app = express()
const PORT = process.env.PORT || 3001

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'EMI Blockchain Node Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/blockchain', blockchainRoutes)

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    path: req.path,
    timestamp: new Date().toISOString(),
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado', path: req.path })
})

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║   🎖️  EMI BLOCKCHAIN NODE SERVICE  v1.0      ║')
  console.log('║   Escuela Militar de Ingeniería              ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\n🌐 Puerto:      http://localhost:${PORT}`)
  console.log(`⛓️  Blockchain:  http://localhost:${PORT}/api/blockchain/status`)
  console.log(`❤️  Health:      http://localhost:${PORT}/health`)
  console.log('\n')
})

module.exports = app
