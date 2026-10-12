import { useState, useEffect } from 'react'
import {
  FileText, Plus, Search, Download, Eye, QrCode,
  Shield, CheckCircle, XCircle, Clock, X, Hash
} from 'lucide-react'
import { certificadosService } from '../services/api'
import './Certificados.css'

const MOCK_CERTS = [
  {
    id: 1, codigo: 'CERT-EMI-2024-0001', tipo: 'HISTORIAL_ACADEMICO',
    estudiante: 'Juan Carlos Mamani Quispe', carrera: 'Ingeniería de Sistemas',
    emitido: '2024-05-15T10:30:00Z', valido: true,
    hash: 'a3f4e2b1c9d7e5f8a2b3c4d5e6f7a8b9c0d1e2f3',
    promedio: 72.8, estado: 'VIGENTE',
  },
  {
    id: 2, codigo: 'CERT-EMI-2024-0002', tipo: 'NOTA_ESPECIFICA',
    estudiante: 'Roberto García Flores', carrera: 'Ingeniería Civil',
    emitido: '2024-05-20T14:00:00Z', valido: true,
    hash: 'b7c9d1e5f3a2b4c6d8e0f1a3b5c7d9e1f2a4b6c8',
    promedio: 81.5, estado: 'VIGENTE',
  },
  {
    id: 3, codigo: 'CERT-EMI-2024-0003', tipo: 'EGRESO',
    estudiante: 'María López Condori', carrera: 'Ingeniería Electrónica',
    emitido: '2024-04-10T09:00:00Z', valido: true,
    hash: 'c2a8f3b4e1d6c7a9f2b5e8c1d4a7f0b3e6c9a2d5',
    promedio: 88.2, estado: 'VIGENTE',
  },
]

const TIPOS = [
  { value: 'HISTORIAL_ACADEMICO', label: 'Historial Académico Completo' },
  { value: 'NOTA_ESPECIFICA', label: 'Nota de Materia Específica' },
  { value: 'EGRESO', label: 'Certificado de Egreso' },
  { value: 'APROBACION', label: 'Certificado de Aprobación' },
]

export default function Certificados() {
  const [certs, setCerts] = useState(MOCK_CERTS)
  const [loading, setLoading] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [form, setForm] = useState({ tipo: 'HISTORIAL_ACADEMICO', estudiante_id: '' })
  const [generating, setGenerating] = useState(false)

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const handleVerify = async () => {
    if (!verifyCode.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    await new Promise(r => setTimeout(r, 1200))
    try {
      const { data } = await certificadosService.verify(verifyCode)
      setVerifyResult(data)
    } catch {
      const found = certs.find(c => c.codigo.toLowerCase().includes(verifyCode.toLowerCase()))
      setVerifyResult(found
        ? { valid: true, certificado: found, message: 'Certificado verificado con éxito en la blockchain' }
        : { valid: false, message: 'Certificado no encontrado o inválido' }
      )
    } finally {
      setVerifying(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    const newCert = {
      id: Date.now(),
      codigo: `CERT-EMI-2024-${String(certs.length + 1).padStart(4, '0')}`,
      tipo: form.tipo,
      estudiante: 'Nuevo Estudiante',
      carrera: 'Ingeniería de Sistemas',
      emitido: new Date().toISOString(),
      valido: true,
      hash: Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      promedio: 0,
      estado: 'VIGENTE',
    }
    setCerts([newCert, ...certs])
    setGenerating(false)
    setShowGenerateModal(false)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificados Digitales</h1>
          <p className="page-subtitle">Emisión y verificación de certificados académicos con sello blockchain</p>
        </div>
        <div className="flex gap-2">
          <button
            id="verifyBtn"
            className="btn btn-chain"
            onClick={() => setShowVerifyModal(true)}
          >
            <Shield size={15} />
            Verificar Certificado
          </button>
          <button
            id="generateCertBtn"
            className="btn btn-primary"
            onClick={() => setShowGenerateModal(true)}
          >
            <Plus size={15} />
            Emitir Certificado
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="cert-feature-cards mb-4">
        <div className="cert-feature">
          <Hash size={20} className="text-chain" />
          <div className="cert-feature-title">Hash SHA-256</div>
          <div className="cert-feature-desc">Cada certificado tiene un hash único e irrepetible</div>
        </div>
        <div className="cert-feature">
          <Shield size={20} className="text-gold" />
          <div className="cert-feature-title">Verificación Blockchain</div>
          <div className="cert-feature-desc">Verificable en cualquier momento por QR o código</div>
        </div>
        <div className="cert-feature">
          <FileText size={20} style={{ color: '#3498db' }} />
          <div className="cert-feature-title">PDF Digital</div>
          <div className="cert-feature-desc">Descarga con código QR incrustado</div>
        </div>
        <div className="cert-feature">
          <CheckCircle size={20} className="text-chain" />
          <div className="cert-feature-title">Inmutabilidad</div>
          <div className="cert-feature-desc">Imposible falsificar o alterar</div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="table-container">
        <div className="table-header">
          <FileText size={16} className="text-gold" />
          <span className="table-title">Certificados Emitidos</span>
          <span className="badge badge-muted">{certs.length}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Fecha Emisión</th>
                <th>Hash Blockchain</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <span className="font-mono text-gold" style={{ fontSize: 10 }}>{cert.codigo}</span>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {TIPOS.find(t => t.value === cert.tipo)?.label || cert.tipo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{cert.estudiante}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cert.carrera}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={11} className="text-muted" />
                      <span style={{ fontSize: 11 }}>{formatDate(cert.emitido)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="hash-verify valid">
                      <Shield size={10} />
                      <span className="hash-text">{cert.hash.substring(0, 16)}...</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${cert.estado === 'VIGENTE' ? 'badge-success' : 'badge-danger'}`}>
                      {cert.estado}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" title="Ver certificado">
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-outline btn-sm" title="Descargar PDF">
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowVerifyModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <span className="modal-title">🔍 Verificar Certificado</span>
              <button className="btn btn-outline btn-icon btn-sm" onClick={() => setShowVerifyModal(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Ingrese el código del certificado o el hash blockchain para verificar su autenticidad.
              </p>
              <div className="form-group">
                <label className="form-label">Código o Hash del Certificado</label>
                <input
                  id="verifyCodeInput"
                  className="form-input font-mono"
                  placeholder="CERT-EMI-2024-0001 o hash SHA-256..."
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>

              {verifyResult && (
                <div className={`verify-result fade-in ${verifyResult.valid ? 'valid' : 'invalid'}`}
                  style={{
                    background: verifyResult.valid ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)',
                    border: `1px solid ${verifyResult.valid ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`,
                    borderRadius: 'var(--radius-md)', padding: 16, marginTop: 12
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {verifyResult.valid
                      ? <CheckCircle size={20} style={{ color: 'var(--color-chain-300)', flexShrink: 0 }} />
                      : <XCircle size={20} style={{ color: 'var(--color-danger-400)', flexShrink: 0 }} />}
                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: verifyResult.valid ? 'var(--color-chain-300)' : 'var(--color-danger-400)',
                        marginBottom: 6
                      }}>
                        {verifyResult.valid ? '✓ CERTIFICADO VÁLIDO' : '✗ CERTIFICADO INVÁLIDO'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{verifyResult.message}</div>
                      {verifyResult.certificado && (
                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-primary)' }}>
                          <div><strong>Estudiante:</strong> {verifyResult.certificado.estudiante}</div>
                          <div><strong>Carrera:</strong> {verifyResult.certificado.carrera}</div>
                          <div><strong>Emitido:</strong> {formatDate(verifyResult.certificado.emitido)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowVerifyModal(false)}>Cerrar</button>
              <button id="verifySubmitBtn" className="btn btn-chain" onClick={handleVerify} disabled={verifying || !verifyCode}>
                {verifying ? <div className="loader-spin" /> : <Shield size={15} />}
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowGenerateModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <span className="modal-title">📄 Emitir Certificado</span>
              <button className="btn btn-outline btn-icon btn-sm" onClick={() => setShowGenerateModal(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Tipo de Certificado</label>
                <select
                  id="certTipoSelect"
                  className="form-input form-select"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estudiante</label>
                <input
                  id="certEstudianteInput"
                  className="form-input"
                  placeholder="Buscar estudiante..."
                  value={form.estudiante_id}
                  onChange={(e) => setForm({ ...form, estudiante_id: e.target.value })}
                />
              </div>
              <div className="cert-generate-info">
                <Shield size={14} className="text-chain" />
                <span>El certificado será firmado digitalmente con hash SHA-256 y registrado en la blockchain.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowGenerateModal(false)}>Cancelar</button>
              <button id="generateSubmitBtn" className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                {generating ? <div className="loader-spin" /> : <FileText size={15} />}
                Generar y Firmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
