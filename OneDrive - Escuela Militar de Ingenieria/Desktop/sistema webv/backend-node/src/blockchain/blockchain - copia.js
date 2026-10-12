const crypto = require('crypto')

/**
 * Clase Block - Bloque de la cadena
 * Implementa SHA-256 para hashing y Proof of Work básico
 */
class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index
    this.timestamp = timestamp
    this.data = data
    this.previousHash = previousHash
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex')
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0')
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.log(`[BLOCKCHAIN] Bloque #${this.index} minado: ${this.hash.substring(0, 20)}...`)
  }

  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      data: this.data,
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      valid: true,
    }
  }
}

/**
 * Clase Blockchain - Cadena de bloques principal
 * Soporta: adición de bloques, verificación de integridad, búsqueda por hash
 */
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
    this.pendingTransactions = []
  }

  createGenesisBlock() {
    const genesis = new Block(
      0,
      new Date().toISOString(),
      {
        tipo: 'GENESIS',
        descripcion: 'Bloque Génesis - Sistema Kardex EMI',
        version: '1.0.0',
        institucion: 'Escuela Militar de Ingeniería',
      },
      '0000000000000000000000000000000000000000000000000000000000000000'
    )
    genesis.mineBlock(this.difficulty)
    return genesis
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      this.getLatestBlock().hash
    )
    newBlock.mineBlock(this.difficulty)
    this.chain.push(newBlock)
    return newBlock
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      // Verificar hash del bloque actual
      const recalculated = currentBlock.calculateHash()
      if (currentBlock.hash !== recalculated) {
        console.error(`[BLOCKCHAIN] Hash inválido en bloque #${i}`)
        return false
      }

      // Verificar enlace con bloque anterior
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`[BLOCKCHAIN] Cadena rota en bloque #${i}`)
        return false
      }
    }
    return true
  }

  findBlockByHash(hash) {
    return this.chain.find(
      (b) => b.hash.toLowerCase().includes(hash.toLowerCase())
    )
  }

  findBlocksByEstudiante(estudianteId) {
    return this.chain.filter(
      (b) => b.data?.estudiante_id === estudianteId || b.data?.estudiante === estudianteId
    )
  }

  getStats() {
    const calificaciones = this.chain.filter(b => b.data?.tipo === 'CALIFICACION')
    const certificados = this.chain.filter(b => b.data?.tipo === 'CERTIFICADO')
    return {
      totalBlocks: this.chain.length,
      calificaciones: calificaciones.length,
      certificados: certificados.length,
      isValid: this.isChainValid(),
      lastBlock: this.getLatestBlock().toJSON(),
      difficulty: this.difficulty,
    }
  }

  toJSON(limit = null) {
    const chain = limit ? this.chain.slice(-limit) : this.chain
    return chain.map(b => b.toJSON())
  }
}

// Singleton - Una sola instancia de blockchain por servidor
let blockchainInstance = null

const getBlockchain = () => {
  if (!blockchainInstance) {
    console.log('[BLOCKCHAIN] Inicializando nueva cadena de bloques EMI...')
    blockchainInstance = new Blockchain()

    // Añadir algunos bloques de ejemplo
    const ejemplos = [
      { tipo: 'CALIFICACION', estudiante: 'Mamani J.', estudiante_id: 'EMI-2024-001', materia: 'Cálculo I', materia_codigo: 'MAT-101', nota_final: 78, docente: 'Dr. Flores', gestion: '1/2024' },
      { tipo: 'CALIFICACION', estudiante: 'García R.', estudiante_id: 'EMI-2024-002', materia: 'Física II', materia_codigo: 'FIS-202', nota_final: 82, docente: 'Ing. Reyes', gestion: '1/2024' },
      { tipo: 'CERTIFICADO', estudiante: 'López M.', estudiante_id: 'EMI-2024-003', tipo_cert: 'HISTORIAL', emitido_por: 'Secretaría EMI', gestion: '1/2024' },
      { tipo: 'CALIFICACION', estudiante: 'Quispe A.', estudiante_id: 'EMI-2023-045', materia: 'Álgebra Lineal', materia_codigo: 'MAT-201', nota_final: 65, docente: 'Dr. Vargas', gestion: '1/2024' },
      { tipo: 'CALIFICACION', estudiante: 'Flores C.', estudiante_id: 'EMI-2023-012', materia: 'Programación I', materia_codigo: 'SIS-101', nota_final: 91, docente: 'Ing. García', gestion: '1/2024' },
    ]

    ejemplos.forEach(data => blockchainInstance.addBlock(data))
    console.log(`[BLOCKCHAIN] Cadena inicializada con ${blockchainInstance.chain.length} bloques`)
  }
  return blockchainInstance
}

module.exports = { Block, Blockchain, getBlockchain }
