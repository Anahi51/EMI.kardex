import { useState } from 'react'
import {
  FileText, CheckCircle2, Users, Download, Search,
  Filter, Folder, Eye, Edit2, ChevronRight, X,
  Check, AlertTriangle, AlertCircle, FileSpreadsheet,
  ArrowRight, Shield, Award, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { downloadActaEntregaJefeCarrera } from '../services/docDownloadService'
import './JefeCarrera.css'

const MOCK_ACTA_ESTUDIANTES = [
  {
    id: 1, codigo: 'H559-8', nombre: 'Jorge Soto', email: 'jorge@eduemi.edu.bo', carrera: 'Ing. Sistemas',
    docs: { ci: 'ok', ficha: 'ok', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'COMPLETO', observaciones: '-'
  },
  {
    id: 2, codigo: 'H551-7', nombre: 'Anahi Quispe Rodriguez', email: 'yquispe@eduemi.bo', carrera: 'Ing. Sistemas',
    docs: { ci: 'ok', ficha: 'error', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'INCOMPLETO', observaciones: 'Falta certificado de notas'
  },
  {
    id: 3, codigo: 'H666-9', nombre: 'Ernan Castelo Antezana', email: 'ecasteloa@eduemi.bo', carrera: 'Ing. Civil',
    docs: { ci: 'ok', ficha: 'ok', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'COMPLETO', observaciones: '-'
  },
  {
    id: 4, codigo: 'H602-5', nombre: 'Fuentes León Jimena', email: 'jfuentesl@eduemi.bo', carrera: 'Ing. Sistemas',
    docs: { ci: 'ok', ficha: 'ok', foto: 'warn', notas: 'ok', otros: 'ok' },
    estado: 'OBSERVADO', observaciones: 'Foto con baja resolución'
  },
  {
    id: 5, codigo: 'H201-6', nombre: 'Isaias Albert Lima', email: 'ilima@eduemi.bo', carrera: 'Ing. Civil',
    docs: { ci: 'ok', ficha: 'ok', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'COMPLETO', observaciones: '-'
  },
  {
    id: 6, codigo: 'H552-2', nombre: 'Jorge', email: 'yrojasg@eduemi.bo', carrera: 'Ing. Civil',
    docs: { ci: 'ok', ficha: 'error', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'INCOMPLETO', observaciones: 'Falta ficha de inscripción'
  },
  {
    id: 7, codigo: 'H559-8', nombre: 'Jorge Soto', email: 'jorges@emi.edu.bo', carrera: 'Ing. Mecánica',
    docs: { ci: 'ok', ficha: 'ok', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'COMPLETO', observaciones: '-'
  },
  {
    id: 8, codigo: 'H123-1', nombre: 'Luis Mario Yucra', email: 'lyucra@eduemi.bo', carrera: 'Ing. Industrial',
    docs: { ci: 'ok', ficha: 'warn', foto: 'ok', notas: 'ok', otros: 'ok' },
    estado: 'OBSERVADO', observaciones: 'Revisar documento adicional'
  },
]

export default function JefeCarrera() {
  const user = useAuthStore((s) => s.user)
  const [estudiantes, setEstudiantes] = useState(MOCK_ACTA_ESTUDIANTES)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('ALL')
  const [selectedEst, setSelectedEst] = useState(null)
  const [page, setPage] = useState(1)

  const filtered = estudiantes.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = !q || e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q) || e.carrera.toLowerCase().includes(q)
    const matchEstado = filterEstado === 'ALL' || e.estado === filterEstado
    return matchSearch && matchEstado
  })

  const handleExportPDF = () => {
    const ok = downloadActaEntregaJefeCarrera('Ingeniería de Sistemas', estudiantes, {
      gestion: '2/2026',
      codigoActa: 'ACT-2026-019',
    })
    if (ok) toast.success('Acta de Estudiantes exportada exitosamente en PDF.')
    else toast.error('Error al exportar acta.')
  }

  const renderDocIcon = (status) => {
    if (status === 'ok') {
      return (
        <span className="jefe-status-circle ok" title="Documento Correcto">
          <Check size={12} />
        </span>
      )
    }
    if (status === 'error') {
      return (
        <span className="jefe-status-circle error" title="Documento Faltante">
          <X size={12} />
        </span>
      )
    }
    return (
      <span className="jefe-status-circle warn" title="Documento con Observación">
        !
      </span>
    )
  }

  return (
    <div className="fade-in jefe-page-container">
      {/* ── Header Row & Breadcrumb ── */}
      <div className="jefe-header-row">
        <div className="jefe-title-group">
          <h1>Acta de Estudiantes</h1>
          <p>Revisión y validación de documentos enviados por el Administrador</p>
        </div>
        <div className="jefe-breadcrumb">
          <span>Inicio</span>
          <ChevronRight size={13} />
          <span>Jefe de Carrera</span>
          <ChevronRight size={13} />
          <span className="active">Acta de Estudiantes</span>
        </div>
      </div>

      {/* ── Tarjetas Superiores de KPIs (4 Cards) ── */}
      <div className="jefe-kpi-grid">
        {/* Card 1: Actas Pendientes */}
        <div className="jefe-kpi-card">
          <div className="jefe-kpi-icon yellow">
            <FileText size={22} />
          </div>
          <div className="jefe-kpi-body">
            <div className="jefe-kpi-label">Actas Pendientes</div>
            <div className="jefe-kpi-value">2</div>
            <button
              type="button"
              className="jefe-kpi-link"
              onClick={() => toast.success('Mostrando 2 actas pendientes de revisión.')}
            >
              Ver actas →
            </button>
          </div>
        </div>

        {/* Card 2: Actas Revisadas */}
        <div className="jefe-kpi-card">
          <div className="jefe-kpi-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="jefe-kpi-body">
            <div className="jefe-kpi-label">Actas Revisadas</div>
            <div className="jefe-kpi-value">8</div>
            <button
              type="button"
              className="jefe-kpi-link"
              onClick={() => toast.success('Historial de 8 actas revisadas verificado en Blockchain.')}
            >
              Ver historial →
            </button>
          </div>
        </div>

        {/* Card 3: Estudiantes en Actas */}
        <div className="jefe-kpi-card">
          <div className="jefe-kpi-icon blue">
            <Users size={22} />
          </div>
          <div className="jefe-kpi-body">
            <div className="jefe-kpi-label">Estudiantes en Actas</div>
            <div className="jefe-kpi-value">128</div>
            <button
              type="button"
              className="jefe-kpi-link"
              onClick={() => toast.success('128 estudiantes registrados en el libro mayor.')}
            >
              Ver detalle →
            </button>
          </div>
        </div>

        {/* Card 4: Botón Dorado "Actas Recibidas" */}
        <div className="jefe-kpi-card prominent-gold" onClick={handleExportPDF}>
          <div className="jefe-kpi-icon">
            <Download size={22} />
          </div>
          <div>
            <div className="jefe-prominent-title">Actas Recibidas</div>
            <div className="jefe-prominent-sub">Revisa las actas enviadas por el Administrador</div>
          </div>
        </div>
      </div>

      {/* ── Tarjeta de Detalle del Acta Recibida ── */}
      <div className="jefe-acta-detail-card">
        <div className="jefe-acta-header">
          <div className="jefe-acta-header-title">
            <FileText size={18} style={{ color: '#eab308' }} />
            <span>Detalle del Acta Recibida</span>
          </div>
          <span className="badge-revision-pending">PENDIENTE DE REVISIÓN</span>
        </div>

        <div className="jefe-acta-columns">
          {/* Col 1 */}
          <div className="jefe-meta-col">
            <div className="jefe-meta-item">
              <span className="meta-label">Código de Acta:</span>
              <span className="meta-value font-mono">ACT-2026-019</span>
            </div>
            <div className="jefe-meta-item">
              <span className="meta-label">Período:</span>
              <span className="meta-value font-mono">2/2026</span>
            </div>
            <div className="jefe-meta-item">
              <span className="meta-label">Fecha de envío:</span>
              <span className="meta-value">15/09/2026 14:32</span>
            </div>
            <div className="jefe-meta-item">
              <span className="meta-label">Enviado por:</span>
              <span className="meta-value" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Admin Sistema <span className="jefe-admin-avatar-mini">A</span>
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="jefe-desc-col">
            <span className="desc-label">Descripción:</span>
            <p className="desc-text">
              Acta de entrega de documentos para designación de Jefe de Carrera - Ingeniería de Sistemas.
            </p>
          </div>

          {/* Col 3 */}
          <div className="jefe-stats-col">
            <div className="jefe-stat-row">
              <span className="stat-l">Total de estudiantes:</span>
              <span className="stat-v">32</span>
            </div>
            <div className="jefe-stat-row">
              <span className="stat-l">Documentos requeridos:</span>
              <span className="stat-v">5</span>
            </div>
            <div className="jefe-stat-row">
              <span className="stat-l">Documentos entregados:</span>
              <span className="stat-v">148/160</span>
            </div>
            <div className="jefe-progress-container">
              <div className="jefe-progress-track">
                <div className="jefe-progress-bar" style={{ width: '92%' }} />
              </div>
              <span className="jefe-progress-percent">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla: Lista de Estudiantes del Acta ── */}
      <div className="jefe-table-card">
        <div className="jefe-table-toolbar">
          <div className="jefe-table-title">
            <FileText size={16} className="text-gold" />
            <span>Lista de Estudiantes del Acta</span>
          </div>

          <div className="jefe-toolbar-right">
            <div className="jefe-search-input-box">
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                placeholder="Buscar estudiante por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="jefe-btn-filter"
              onClick={() => {
                const next = filterEstado === 'ALL' ? 'COMPLETO' : filterEstado === 'COMPLETO' ? 'INCOMPLETO' : filterEstado === 'INCOMPLETO' ? 'OBSERVADO' : 'ALL'
                setFilterEstado(next)
                toast(`Filtro: ${next === 'ALL' ? 'Todos los estudiantes' : next}`)
              }}
            >
              <Filter size={13} />
              Filtros {filterEstado !== 'ALL' && `(${filterEstado})`}
            </button>

            <button
              type="button"
              className="jefe-btn-export"
              onClick={handleExportPDF}
            >
              <Download size={13} />
              Exportar ∨
            </button>
          </div>
        </div>

        <div className="jefe-table-responsive">
          <table className="jefe-acta-table">
            <thead>
              <tr>
                <th style={{ width: 35 }}>#</th>
                <th style={{ width: 85 }}>CÓDIGO</th>
                <th>ESTUDIANTE</th>
                <th>CARRERA</th>
                <th style={{ textAlign: 'center', width: 220 }}>
                  <div className="jefe-docs-header-group">
                    <div style={{ marginBottom: 4, fontSize: 10 }}>DOCUMENTOS ENTREGADOS</div>
                    <div className="jefe-docs-sub-icons">
                      <span className="jefe-docs-sub-col-header">CI</span>
                      <span className="jefe-docs-sub-col-header">Ficha</span>
                      <span className="jefe-docs-sub-col-header">Foto</span>
                      <span className="jefe-docs-sub-col-header">Cert. Notas</span>
                      <span className="jefe-docs-sub-col-header">Otros</span>
                    </div>
                  </div>
                </th>
                <th>ESTADO</th>
                <th>OBSERVACIONES</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((est, idx) => (
                <tr key={est.id}>
                  <td className="jefe-num-cell">{idx + 1}</td>
                  <td className="jefe-code-cell">{est.codigo}</td>
                  <td>
                    <div className="jefe-student-cell">
                      <div className="jefe-student-avatar">
                        {est.nombre.charAt(0)}
                      </div>
                      <div className="jefe-student-info">
                        <strong>{est.nombre}</strong>
                        <span>{est.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{est.carrera}</td>
                  <td>
                    <div className="jefe-doc-status-icons-row">
                      {renderDocIcon(est.docs.ci)}
                      {renderDocIcon(est.docs.ficha)}
                      {renderDocIcon(est.docs.foto)}
                      {renderDocIcon(est.docs.notas)}
                      {renderDocIcon(est.docs.otros)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-acta-status ${est.estado.toLowerCase()}`}>
                      {est.estado}
                    </span>
                  </td>
                  <td className="jefe-obs-cell">{est.observaciones}</td>
                  <td>
                    <div className="jefe-actions-group" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="jefe-btn-action"
                        title="Ver Expediente Digital"
                        onClick={() => {
                          setSelectedEst(est)
                          toast(`Expediente de ${est.nombre} cargado.`)
                        }}
                      >
                        <Folder size={13} />
                      </button>
                      <button
                        type="button"
                        className="jefe-btn-action"
                        title="Previsualizar Documentos"
                        onClick={() => setSelectedEst(est)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="jefe-btn-action"
                        title="Registrar Observación"
                        onClick={() => {
                          const obs = prompt(`Ingresar observación para ${est.nombre}:`, est.observaciones === '-' ? '' : est.observaciones)
                          if (obs !== null) {
                            setEstudiantes(prev => prev.map(item => item.id === est.id ? { ...item, observaciones: obs || '-', estado: obs ? 'OBSERVADO' : 'COMPLETO' } : item))
                            toast.success('Observación actualizada en el acta.')
                          }
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Paginación Inferior ── */}
        <div className="jefe-table-footer">
          <div>Mostrando 1 - {filtered.length} de 32 estudiantes</div>
          <div className="jefe-pagination-controls">
            <button type="button" className={`jefe-page-btn ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)}>1</button>
            <button type="button" className={`jefe-page-btn ${page === 2 ? 'active' : ''}`} onClick={() => setPage(2)}>2</button>
            <button type="button" className={`jefe-page-btn ${page === 3 ? 'active' : ''}`} onClick={() => setPage(3)}>3</button>
            <button type="button" className={`jefe-page-btn ${page === 4 ? 'active' : ''}`} onClick={() => setPage(4)}>4</button>
            <button type="button" className="jefe-page-btn" onClick={() => setPage(p => Math.min(4, p + 1))}>&gt;</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Mostrar:</span>
            <select
              style={{
                background: 'rgba(6, 13, 24, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                outline: 'none'
              }}
            >
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Expediente del Estudiante */}
      {selectedEst && (
        <div className="modal-overlay" onClick={() => setSelectedEst(null)}>
          <div className="modal fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-gold" />
                <span className="modal-title font-display" style={{ fontSize: 15 }}>
                  Expediente de {selectedEst.nombre}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-icon btn-sm"
                onClick={() => setSelectedEst(null)}
                style={{ borderRadius: '50%', width: 28, height: 28, padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div className="grid-2 mb-3 text-xs">
                <div><span className="text-muted">Código:</span> <strong className="text-gold font-mono">{selectedEst.codigo}</strong></div>
                <div><span className="text-muted">Carrera:</span> <strong className="text-white">{selectedEst.carrera}</strong></div>
                <div><span className="text-muted">Estado Actual:</span> <span className={`badge-acta-status ${selectedEst.estado.toLowerCase()}`}>{selectedEst.estado}</span></div>
                <div><span className="text-muted">Observación:</span> <strong className="text-white">{selectedEst.observaciones}</strong></div>
              </div>

              <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-bold text-white mb-2">Checklist de Documentos Entregados:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div className="flex items-center justify-between">
                    <span>1. Carnet de Identidad</span>
                    {renderDocIcon(selectedEst.docs.ci)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Ficha de Matrícula</span>
                    {renderDocIcon(selectedEst.docs.ficha)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. Fotografía 4x4 Fondo Azul</span>
                    {renderDocIcon(selectedEst.docs.foto)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>4. Certificado de Calificaciones / Notas</span>
                    {renderDocIcon(selectedEst.docs.notas)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>5. Documentos Reglamentarios Adicionales</span>
                    {renderDocIcon(selectedEst.docs.otros)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedEst(null)}
                style={{ padding: '8px 20px', borderRadius: 8 }}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  toast.success(`Expediente de ${selectedEst.nombre} validado con firma Blockchain.`)
                  setSelectedEst(null)
                }}
                style={{ padding: '8px 24px', borderRadius: 8 }}
              >
                Validar Documentos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
