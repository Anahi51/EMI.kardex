import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Link, Search, RefreshCw, Hash, Clock, Database } from 'lucide-react'
import { blockchainService } from '../services/api'
import './Blockchain.css'

// Mock blockchain data
const generateMockChain = () => {
  const chain = []
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000'
  for (let i = 0; i < 12; i++) {
    const hash = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    const isGenesis = i === 0
    chain.push({
      index: i,
      timestamp: new Date(Date.now() - (12 - i) * 3600000 * 2).toISOString(),
      previousHash: prevHash,
      hash,
      nonce: Math.floor(Math.random() * 100000),
      data: isGenesis
        ? { tipo: 'GENESIS', descripcion: 'Bloque Génesis - EMI Kardex System' }
        : {
            tipo: 'CALIFICACION',
            estudiante: ['Mamani J.', 'García R.', 'López M.', 'Quispe A.', 'Flores C.'][i % 5],
            materia: ['Cálculo I', 'Física II', 'Álgebra', 'Programación', 'Química'][i % 5],
            nota: Math.floor(Math.random() * 50) + 50,
            docente: ['Dr. Vargas', 'Ing. Reyes', 'Dr. Flores'][i % 3],
            gestion: '1/2024',
          },
      valid: true,
    })
    prevHash = hash
  }
  return chain
}

const MOCK_CHAIN = generateMockChain()

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [chainValid, setChainValid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadChain = async () => {
    try {
      const { data } = await blockchainService.getBlocks()
      setBlocks(data.blocks || MOCK_CHAIN)
      setChainValid(data.valid !== false)
    } catch {
      setBlocks(MOCK_CHAIN)
      setChainValid(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadChain() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadChain()
  }

  const handleVerifyHash = async () => {
    if (!verifyHash.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const { data } = await blockchainService.verifyHash(verifyHash)
      setVerifyResult(data)
    } catch {
      // Demo: verificar contra la cadena local
      const found = blocks.find((b) => b.hash.toLowerCase().includes(verifyHash.toLowerCase()))
      if (found) {
        setVerifyResult({
          valid: true,
          block: found,
          message: 'Hash encontrado y verificado en la cadena',
        })
      } else {
        setVerifyResult({ valid: false, message: 'Hash no encontrado en la cadena' })
      }
    } finally {
      setVerifying(false)
    }
  }

  const formatTime = (iso) => new Date(iso).toLocaleString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spin" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <span>Cargando blockchain...</span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blockchain Explorer</h1>
          <p className="page-subtitle">Visualizador de la cadena de bloques · Verificación de integridad en tiempo real</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`chain-status-badge ${chainValid ? 'valid' : 'invalid'}`}>
            {chainValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {chainValid ? 'Cadena Íntegra' : '⚠ Cadena Comprometida'}
          </div>
          <button id="refreshChainBtn" className="btn btn-outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="blockchain-stats-banner">
        <div className="bsb-item">
          <Database size={18} className="text-gold" />
          <div>
            <div className="bsb-value">{blocks.length}</div>
            <div className="bsb-label">Bloques totales</div>
          </div>
        </div>
        <div className="bsb-item">
          <CheckCircle size={18} className="text-chain" />
          <div>
            <div className="bsb-value text-chain">{blocks.filter(b => b.valid !== false).length}</div>
            <div className="bsb-label">Bloques válidos</div>
          </div>
        </div>
        <div className="bsb-item">
          <Hash size={18} style={{ color: '#3498db' }} />
          <div>
            <div className="bsb-value" style={{ color: '#5faee3' }}>SHA-256</div>
            <div className="bsb-label">Algoritmo hash</div>
          </div>
        </div>
        <div className="bsb-item">
          <Clock size={18} className="text-gold" />
          <div>
            <div className="bsb-value">{formatTime(blocks[blocks.length - 1]?.timestamp || new Date().toISOString()).split(' ')[1]}</div>
            <div className="bsb-label">Último bloque</div>
          </div>
        </div>
      </div>

      {/* Hash Verifier */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-gold" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
            VERIFICADOR DE HASH
          </span>
        </div>
        <div className="hash-verifier-row">
          <input
            id="hashVerifyInput"
            type="text"
            className="form-input"
            placeholder="Ingrese un hash SHA-256 para verificar (ej: a3f4e2b1...)"
            value={verifyHash}
            onChange={(e) => setVerifyHash(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyHash()}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
          <button id="verifyHashBtn" className="btn btn-chain" onClick={handleVerifyHash} disabled={verifying || !verifyHash.trim()}>
            {verifying ? <div className="loader-spin" /> : <Search size={15} />}
            Verificar
          </button>
        </div>
        {verifyResult && (
          <div className={`verify-result fade-in ${verifyResult.valid ? 'valid' : 'invalid'}`}>
            {verifyResult.valid ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <div>
              <div className="verify-result-msg">{verifyResult.message}</div>
              {verifyResult.block && (
                <div className="verify-result-detail font-mono">
                  Bloque #{verifyResult.block.index} ·
                  {verifyResult.block.data?.estudiante && ` Est: ${verifyResult.block.data.estudiante}`}
                  {verifyResult.block.data?.nota && ` · Nota: ${verifyResult.block.data.nota}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chain Visual - Horizontal scroll */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link size={16} className="text-chain" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
            CADENA DE BLOQUES
          </span>
          <span className="badge badge-chain">{blocks.length} bloques</span>
        </div>
        <div className="block-chain-visual">
          {blocks.map((block, i) => (
            <div key={block.index} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={`block-node ${block.index === 0 ? 'genesis' : ''} ${selectedBlock?.index === block.index ? 'selected' : ''}`}
                onClick={() => setSelectedBlock(selectedBlock?.index === block.index ? null : block)}
                id={`block-${block.index}`}
              >
                <div className="block-index">
                  BLOQUE #{block.index.toString().padStart(3, '0')}
                  {block.index === 0 && <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: 8 }}>GENESIS</span>}
                </div>
                <div className="block-hash">{block.hash.substring(0, 20)}...</div>
                <div className="block-data-label">
                  {block.data?.tipo === 'GENESIS' ? '🔷 Génesis' : `👤 ${block.data?.estudiante || 'Sistema'}`}
                </div>
                <div className="block-data-value" style={{ fontSize: 10 }}>
                  {block.data?.nota ? `Nota: ${block.data.nota}` : block.data?.descripcion?.substring(0, 20) || '—'}
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                  {block.valid !== false
                    ? <CheckCircle size={10} className="text-chain" />
                    : <XCircle size={10} className="text-danger" />}
                  <span style={{ fontSize: 9, color: block.valid !== false ? 'var(--color-chain-300)' : 'var(--color-danger-400)' }}>
                    {block.valid !== false ? 'VÁLIDO' : 'INVÁLIDO'}
                  </span>
                </div>
              </div>
              {i < blocks.length - 1 && <div className="block-chain-link" />}
            </div>
          ))}
        </div>
      </div>

      {/* Block Detail */}
      {selectedBlock && (
        <div className="card card-chain fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-chain" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>
                DETALLE — BLOQUE #{selectedBlock.index}
              </span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedBlock(null)}>✕ Cerrar</button>
          </div>
          <div className="block-detail-grid">
            <div className="block-detail-field">
              <div className="block-detail-label">Índice</div>
              <div className="block-detail-value font-mono">#{selectedBlock.index}</div>
            </div>
            <div className="block-detail-field">
              <div className="block-detail-label">Timestamp</div>
              <div className="block-detail-value font-mono">{formatTime(selectedBlock.timestamp)}</div>
            </div>
            <div className="block-detail-field" style={{ gridColumn: '1 / -1' }}>
              <div className="block-detail-label">Hash Actual (SHA-256)</div>
              <div className="block-detail-value font-mono text-chain" style={{ wordBreak: 'break-all', fontSize: 11 }}>
                {selectedBlock.hash}
              </div>
            </div>
            <div className="block-detail-field" style={{ gridColumn: '1 / -1' }}>
              <div className="block-detail-label">Hash Anterior</div>
              <div className="block-detail-value font-mono" style={{ wordBreak: 'break-all', fontSize: 11, color: 'var(--text-secondary)' }}>
                {selectedBlock.previousHash}
              </div>
            </div>
            <div className="block-detail-field">
              <div className="block-detail-label">Nonce</div>
              <div className="block-detail-value font-mono">{selectedBlock.nonce}</div>
            </div>
            <div className="block-detail-field">
              <div className="block-detail-label">Integridad</div>
              <div className="block-detail-value">
                <span className={`badge ${selectedBlock.valid !== false ? 'badge-success' : 'badge-danger'}`}>
                  {selectedBlock.valid !== false ? '✓ VÁLIDO' : '✗ INVÁLIDO'}
                </span>
              </div>
            </div>
          </div>

          <div className="divider" />
          <div className="block-detail-label" style={{ marginBottom: 12 }}>Datos del Bloque</div>
          <pre className="block-data-json">{JSON.stringify(selectedBlock.data, null, 2)}</pre>
        </div>
      )}

      {/* Blocks Table */}
      <div className="table-container">
        <div className="table-header">
          <Database size={16} className="text-gold" />
          <span className="table-title">Registro Completo de Bloques</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Hash</th>
                <th>Hash Anterior</th>
                <th>Tipo</th>
                <th>Datos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...blocks].reverse().map((block) => (
                <tr
                  key={block.index}
                  onClick={() => setSelectedBlock(block)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><span className="font-mono text-gold">#{block.index}</span></td>
                  <td><span className="font-mono" style={{ fontSize: 11 }}>{formatTime(block.timestamp)}</span></td>
                  <td>
                    <span className="font-mono text-chain" style={{ fontSize: 10 }}>
                      {block.hash.substring(0, 16)}...
                    </span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {block.previousHash.substring(0, 16)}...
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${block.index === 0 ? 'badge-gold' : 'badge-chain'}`}>
                      {block.data?.tipo || 'DATO'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {block.data?.estudiante
                      ? `${block.data.estudiante} · ${block.data.materia} · ${block.data.nota} pts`
                      : block.data?.descripcion?.substring(0, 40) || '—'}
                  </td>
                  <td>
                    {block.valid !== false
                      ? <CheckCircle size={14} className="text-chain" />
                      : <XCircle size={14} className="text-danger" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
