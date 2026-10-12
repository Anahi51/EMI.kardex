const express = require('express')
const router = express.Router()
const blockchainController = require('../controllers/blockchainController')

// Blockchain endpoints
router.get('/status', blockchainController.getStatus)
router.get('/blocks', blockchainController.getBlocks)
router.get('/blocks/:index', blockchainController.getBlock)
router.get('/verify', blockchainController.verifyChain)
router.post('/verify-hash', blockchainController.verifyHash)
router.post('/add', blockchainController.addBlock)
router.get('/stats', blockchainController.getStats)
router.get('/student/:id', blockchainController.getStudentBlocks)

module.exports = router
