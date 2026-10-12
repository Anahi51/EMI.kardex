const { getBlockchain } = require('../blockchain/blockchain')

const blockchainController = {
  // GET /api/blockchain/status
  getStatus: (req, res) => {
    const bc = getBlockchain()
    const valid = bc.isChainValid()
    res.json({
      status: valid ? 'ACTIVO' : 'COMPROMETIDO',
      valid,
      totalBlocks: bc.chain.length,
      algorithm: 'SHA-256',
      difficulty: bc.difficulty,
      lastHash: bc.getLatestBlock().hash,
      timestamp: new Date().toISOString(),
    })
  },

  // GET /api/blockchain/blocks
  getBlocks: (req, res) => {
    const bc = getBlockchain()
    const { limit, page } = req.query
    const lim = parseInt(limit) || 50
    const pg = parseInt(page) || 1
    const start = (pg - 1) * lim
    const end = start + lim
    const blocks = bc.toJSON().slice(start, end)
    res.json({
      blocks,
      total: bc.chain.length,
      page: pg,
      limit: lim,
      valid: bc.isChainValid(),
    })
  },

  // GET /api/blockchain/blocks/:index
  getBlock: (req, res) => {
    const bc = getBlockchain()
    const index = parseInt(req.params.index)
    if (index < 0 || index >= bc.chain.length) {
      return res.status(404).json({ error: 'Bloque no encontrado' })
    }
    res.json(bc.chain[index].toJSON())
  },

  // GET /api/blockchain/verify
  verifyChain: (req, res) => {
    const bc = getBlockchain()
    const valid = bc.isChainValid()
    res.json({
      valid,
      totalBlocks: bc.chain.length,
      message: valid
        ? `Cadena íntegra: ${bc.chain.length} bloques verificados correctamente`
        : 'ALERTA: Se detectó manipulación en la cadena de bloques',
      timestamp: new Date().toISOString(),
    })
  },

  // POST /api/blockchain/verify-hash
  verifyHash: (req, res) => {
    const bc = getBlockchain()
    const { hash } = req.body
    if (!hash) return res.status(400).json({ error: 'Hash requerido' })

    const block = bc.findBlockByHash(hash)
    if (!block) {
      return res.json({ valid: false, message: 'Hash no encontrado en la cadena' })
    }
    res.json({
      valid: true,
      block: block.toJSON(),
      message: 'Hash verificado y encontrado en la cadena de bloques',
    })
  },

  // POST /api/blockchain/add
  addBlock: (req, res) => {
    const bc = getBlockchain()
    const { data } = req.body
    if (!data) return res.status(400).json({ error: 'Datos del bloque requeridos' })

    try {
      const newBlock = bc.addBlock(data)
      res.status(201).json({
        message: 'Bloque añadido exitosamente',
        block: newBlock.toJSON(),
        chainLength: bc.chain.length,
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // GET /api/blockchain/stats
  getStats: (req, res) => {
    const bc = getBlockchain()
    res.json(bc.getStats())
  },

  // GET /api/blockchain/student/:id
  getStudentBlocks: (req, res) => {
    const bc = getBlockchain()
    const { id } = req.params
    const blocks = bc.findBlocksByEstudiante(id)
    res.json({ blocks: blocks.map(b => b.toJSON()), total: blocks.length })
  },
}

module.exports = blockchainController
