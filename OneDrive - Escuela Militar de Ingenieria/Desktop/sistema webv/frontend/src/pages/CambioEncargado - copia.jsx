/**
 * ================================================================
 * ARCHIVO: CambioEncargado.jsx
 * MÓDULO:  Cambio de Encargado del Kardex — Administrador
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * FUNCIONALIDADES:
 *   - Registro de transferencia de custodia (encargado entrega → recibe)
 *   - Identificación de encargado que entrega y que recibe
 *   - Registro de fecha/hora y cantidad de documentos
 *   - Generación de acta digital con hash SHA-256
 *   - Confirmación de recepción por el encargado receptor
 *   - Historial cronológico de custodios del Kardex
 *   - CRUD de encargados registrados en el sistema
 *
 * PESTAÑAS:
 *   1. Transferencia — Formulario + lista de transferencias activas
 *   2. Historial     — Timeline cronológico de custodios
 *   3. Encargados    — Gestión del catálogo de encargados
 * ================================================================
 */

import { useState, useEffect, useCallback } from 'react'
import {
  UserCheck, ArrowLeftRight, Clock, Shield, Hash,
  CheckCircle, XCircle, Eye, Plus, User, Phone,
  Mail, FileText, AlertTriangle, ChevronRight, X,
  Users, History, RefreshCw, Edit2, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import './CambioEncargado.css'

// ─── Configuración base de la API ──────────────────────────────
const API = 'http://localhost:8000/api/calificaciones'

function authHeader() {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

// ─── Constantes de datos de ejemplo (fallback sin backend activo) ─
const DEMO_ENCARGADOS = [
  { id: 1, nombre_completo: 'Tcnl. Carlos Mamani Quispe', cargo: 'Jefe de Registro Académico', ci: '4521897', email: 'c.mamani@emi.edu.bo', telefono: '70012345', activo: true, fecha_asignacion: '2024-01-15T09:00:00Z' },
  { id: 2, nombre_completo: 'Mayor Ana Flores Gutierrez', cargo: 'Secretaria General', ci: '6238471', email: 'a.flores@emi.edu.bo', telefono: '70023456', activo: false, fecha_asignacion: '2023-03-10T09:00:00Z' },
  { id: 3, nombre_completo: 'Tte. Jorge Condori Lara', cargo: 'Asistente de Registro', ci: '8734521', email: 'j.condori@emi.edu.bo', telefono: '70034567', activo: false, fecha_asignacion: '2022-08-01T09:00:00Z' },
]

const DEMO_TRANSFERENCIAS = [
  {
    id: 1, numero_acta: 'ACTA-KARDEX-2024-0003', estado: 'CONFIRMADA',
    encargado_entrega_nombre: 'Mayor Ana Flores Gutierrez', encargado_entrega_cargo: 'Secretaria General', encargado_entrega_ci: '6238471',
    encargado_recibe_nombre: 'Tcnl. Carlos Mamani Quispe', encargado_recibe_cargo: 'Jefe de Registro Académico', encargado_recibe_ci: '4521897',
    fecha_transferencia: '2024-01-15T09:00:00Z', cantidad_documentos: 1850,
    descripcion_documentos: 'Kardex físicos de 1850 estudiantes, actas de notas gestiones 2020-2023, sellos y documentación administrativa.',
    motivo: 'Rotación de personal por transferencia institucional.',
    hash_acta: 'a3f4e2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
    fecha_registro: '2024-01-15T08:45:00Z', fecha_confirmacion: '2024-01-15T10:30:00Z',
  },
  {
    id: 2, numero_acta: 'ACTA-KARDEX-2024-0004', estado: 'PENDIENTE',
    encargado_entrega_nombre: 'Tcnl. Carlos Mamani Quispe', encargado_entrega_cargo: 'Jefe de Registro Académico', encargado_entrega_ci: '4521897',
    encargado_recibe_nombre: 'Mayor Ana Flores Gutierrez', encargado_recibe_cargo: 'Secretaria General', encargado_recibe_ci: '6238471',
    fecha_transferencia: '2024-06-01T09:00:00Z', cantidad_documentos: 1920,
    descripcion_documentos: 'Actualización de kardex con calificaciones del primer semestre 2024.',
    motivo: 'Asignación temporal durante período vacacional.',
    hash_acta: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    fecha_registro: '2024-06-01T08:30:00Z', fecha_confirmacion: null,
  },
]

// ─────────────────────────────────────────────────────────────────
// COMPONENTE: ModalActa
// ─────────────────────────────────────────────────────────────────
function ModalActa({ acta, onClose }) {
  if (!acta) return null

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' }) : '—'

  return (
    <div className="ce-acta-modal-overlay" onClick={onClose}>
      <div className="ce-acta-modal" onClick={e => e.stopPropagation()}>

        {/* Encabezado del Acta */}
        <div className="ce-acta-header">
          <div className="ce-acta-logo">EMI</div>
          <div className="ce-acta-titulo">Escuela Militar de Ingeniería</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Acta Digital de Transferencia de Custodia del Kardex
          </div>
          <div className="ce-acta-numero">{acta.numero_acta}</div>
        </div>

        {/* Cuerpo del Acta */}
        <div className="ce-acta-body">

          {/* Partes */}
          <div className="ce-acta-section">
            <div className="ce-acta-section-title">Partes de la Transferencia</div>
            <div className="ce-acta-partes">
              <div className="ce-acta-parte">
                <div className="ce-acta-parte-role entrega">🔴 Encargado que Entrega</div>
                <h4>{acta.encargado_entrega?.nombre || acta.encargado_entrega_nombre}</h4>
                <p>{acta.encargado_entrega?.cargo || acta.encargado_entrega_cargo}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>
                  CI: {acta.encargado_entrega?.ci || acta.encargado_entrega_ci}
                </p>
              </div>

              <div className="ce-acta-arrow">
                <ArrowLeftRight size={14} />
              </div>

              <div className="ce-acta-parte">
                <div className="ce-acta-parte-role recibe">🟢 Encargado que Recibe</div>
                <h4>{acta.encargado_recibe?.nombre || acta.encargado_recibe_nombre}</h4>
                <p>{acta.encargado_recibe?.cargo || acta.encargado_recibe_cargo}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>
                  CI: {acta.encargado_recibe?.ci || acta.encargado_recibe_ci}
                </p>
              </div>
            </div>
          </div>

          {/* Datos de la transferencia */}
          <div className="ce-acta-section">
            <div className="ce-acta-section-title">Datos de la Transferencia</div>
            <div className="ce-acta-grid">
              <div className="ce-acta-field">
                <label>Fecha y hora</label>
                <span>{formatDate(acta.fecha_transferencia || acta.transferencia?.fecha)}</span>
              </div>
              <div className="ce-acta-field">
                <label>Cantidad de documentos</label>
                <span>{(acta.cantidad_documentos || acta.transferencia?.cantidad_documentos || '—').toLocaleString()} documentos</span>
              </div>
            </div>
            <div className="ce-acta-field" style={{ marginTop: 10 }}>
              <label>Descripción de documentos</label>
              <span style={{ display: 'block', marginTop: 4, lineHeight: 1.5 }}>
                {acta.descripcion_documentos || acta.transferencia?.descripcion || '—'}
              </span>
            </div>
            <div className="ce-acta-field" style={{ marginTop: 10 }}>
              <label>Motivo del cambio</label>
              <span style={{ display: 'block', marginTop: 4, lineHeight: 1.5 }}>
                {acta.motivo || '—'}
              </span>
            </div>
          </div>

          {/* Confirmación */}
          {(acta.estado === 'CONFIRMADA' || acta.confirmacion) && (
            <div className="ce-acta-section">
              <div className="ce-acta-section-title">Confirmación de Recepción</div>
              <div className="ce-acta-grid">
                <div className="ce-acta-field">
                  <label>Fecha de confirmación</label>
                  <span>{formatDate(acta.fecha_confirmacion || acta.confirmacion?.fecha)}</span>
                </div>
                <div className="ce-acta-field">
                  <label>Confirmado por</label>
                  <span>{acta.confirmado_por_nombre || acta.confirmacion?.confirmado_por || '—'}</span>
                </div>
              </div>
              {(acta.observaciones_receptor || acta.confirmacion?.observaciones) && (
                <div className="ce-acta-field" style={{ marginTop: 10 }}>
                  <label>Observaciones del receptor</label>
                  <span>{acta.observaciones_receptor || acta.confirmacion?.observaciones}</span>
                </div>
              )}
            </div>
          )}

          {/* Hash de integridad */}
          <div className="ce-acta-hash-block">
            <div className="ce-acta-hash-title">
              <Hash size={12} />
              Hash de integridad SHA-256 — Inmutable
            </div>
            <div className="ce-acta-hash-value">
              {acta.hash_acta || acta.hash_integridad || '—'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="ce-acta-footer">
          <button className="ce-btn ce-btn-secondary" onClick={onClose}>
            <X size={14} /> Cerrar
          </button>
          <button className="ce-btn ce-btn-primary" onClick={() => window.print()}>
            <FileText size={14} /> Imprimir Acta
          </button>
        </div>

      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────
// COMPONENTE: ModalConfirmar
// ─────────────────────────────────────────────────────────────────
function ModalConfirmar({ transferencia, onClose, onConfirm }) {
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)

  if (!transferencia) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(transferencia.id, observaciones)
    setLoading(false)
  }

  return (
    <div className="ce-acta-modal-overlay" onClick={onClose}>
      <div className="ce-acta-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="ce-acta-header">
          <div className="ce-acta-logo" style={{ fontSize: 22 }}>✅</div>
          <div className="ce-acta-titulo">Confirmar Recepción</div>
          <div className="ce-acta-numero">{transferencia.numero_acta}</div>
        </div>

        <div className="ce-acta-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            Al confirmar, usted declara haber recibido conforme los <strong style={{ color: 'var(--text-primary)' }}>
              {transferencia.cantidad_documentos?.toLocaleString()} documentos</strong> indicados en el acta.
            El sistema actualizará automáticamente el custodio activo.
          </p>

          <div className="ce-field">
            <label>Observaciones del receptor (opcional)</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Indique cualquier observación sobre el estado de la documentación recibida..."
              rows={4}
            />
          </div>
        </div>

        <div className="ce-acta-footer">
          <button className="ce-btn ce-btn-secondary" onClick={onClose} disabled={loading}>
            <X size={14} /> Cancelar
          </button>
          <button className="ce-btn ce-btn-confirm" onClick={handleConfirm} disabled={loading}>
            <CheckCircle size={14} />
            {loading ? 'Confirmando...' : 'Confirmar Recepción'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────
// COMPONENTE: ModalNuevaTransferencia
// ─────────────────────────────────────────────────────────────────
function ModalNuevaTransferencia({ encargados, onClose, onCrear }) {
  const [form, setForm] = useState({
    encargado_entrega: '',
    encargado_recibe: '',
    fecha_transferencia: new Date().toISOString().slice(0, 16),
    cantidad_documentos: '',
    descripcion_documentos: '',
    motivo: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.encargado_entrega)       e.encargado_entrega = 'Requerido'
    if (!form.encargado_recibe)        e.encargado_recibe  = 'Requerido'
    if (form.encargado_entrega === form.encargado_recibe && form.encargado_entrega)
      e.encargado_recibe = 'El encargado que entrega y recibe no pueden ser el mismo'
    if (!form.cantidad_documentos || form.cantidad_documentos <= 0)
      e.cantidad_documentos = 'Debe ser mayor a 0'
    if (!form.descripcion_documentos.trim()) e.descripcion_documentos = 'Requerido'
    if (!form.motivo.trim())                 e.motivo = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await onCrear(form)
    setLoading(false)
  }

  return (
    <div className="ce-acta-modal-overlay" onClick={onClose}>
      <div className="ce-acta-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="ce-acta-header">
          <div className="ce-acta-logo" style={{ fontSize: 22 }}>🔄</div>
          <div className="ce-acta-titulo">Registrar Nueva Transferencia</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Se generará un acta digital con número y hash únicos
          </div>
        </div>

        <div className="ce-acta-body">

          {/* Partes */}
          <div className="ce-acta-section">
            <div className="ce-acta-section-title">Partes de la Transferencia</div>
            <div className="ce-form-grid">
              <div className="ce-field">
                <label>Encargado que entrega 🔴</label>
                <select value={form.encargado_entrega} onChange={e => set('encargado_entrega', e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {encargados.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nombre_completo} — {e.cargo} {e.activo ? '(Activo)' : ''}
                    </option>
                  ))}
                </select>
                {errors.encargado_entrega && (
                  <span style={{ color: 'var(--color-danger-400)', fontSize: 11 }}>
                    ⚠ {errors.encargado_entrega}
                  </span>
                )}
              </div>

              <div className="ce-field">
                <label>Encargado que recibe 🟢</label>
                <select value={form.encargado_recibe} onChange={e => set('encargado_recibe', e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {encargados.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nombre_completo} — {e.cargo}
                    </option>
                  ))}
                </select>
                {errors.encargado_recibe && (
                  <span style={{ color: 'var(--color-danger-400)', fontSize: 11 }}>
                    ⚠ {errors.encargado_recibe}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Datos */}
          <div className="ce-acta-section">
            <div className="ce-acta-section-title">Datos de la Transferencia</div>
            <div className="ce-form-grid">
              <div className="ce-field">
                <label>Fecha y hora de transferencia</label>
                <input
                  type="datetime-local"
                  value={form.fecha_transferencia}
                  onChange={e => set('fecha_transferencia', e.target.value)}
                />
              </div>
              <div className="ce-field">
                <label>Cantidad de documentos</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ej: 1850"
                  value={form.cantidad_documentos}
                  onChange={e => set('cantidad_documentos', e.target.value)}
                />
                {errors.cantidad_documentos && (
                  <span style={{ color: 'var(--color-danger-400)', fontSize: 11 }}>
                    ⚠ {errors.cantidad_documentos}
                  </span>
                )}
              </div>
            </div>

            <div className="ce-field" style={{ marginTop: 12 }}>
              <label>Descripción de documentos transferidos</label>
              <textarea
                placeholder="Ej: Kardex físicos de 1850 estudiantes, actas de notas gestiones 2020-2024, sellos y documentación administrativa..."
                value={form.descripcion_documentos}
                onChange={e => set('descripcion_documentos', e.target.value)}
                rows={3}
              />
              {errors.descripcion_documentos && (
                <span style={{ color: 'var(--color-danger-400)', fontSize: 11 }}>
                  ⚠ {errors.descripcion_documentos}
                </span>
              )}
            </div>

            <div className="ce-field" style={{ marginTop: 12 }}>
              <label>Motivo del cambio de encargado</label>
              <textarea
                placeholder="Ej: Rotación de personal por transferencia institucional..."
                value={form.motivo}
                onChange={e => set('motivo', e.target.value)}
                rows={2}
              />
              {errors.motivo && (
                <span style={{ color: 'var(--color-danger-400)', fontSize: 11 }}>
                  ⚠ {errors.motivo}
                </span>
              )}
            </div>
          </div>

          {/* Aviso */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.25)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12,
            color: 'var(--color-warning-400)',
          }}>
            <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>
              El acta se generará con <strong>número único y hash SHA-256</strong> inmutable.
              El estado quedará en <strong>PENDIENTE</strong> hasta que el encargado receptor confirme la recepción.
            </span>
          </div>
        </div>

        <div className="ce-acta-footer">
          <button className="ce-btn ce-btn-secondary" onClick={onClose} disabled={loading}>
            <X size={14} /> Cancelar
          </button>
          <button className="ce-btn ce-btn-primary" onClick={handleSubmit} disabled={loading}>
            <FileText size={14} />
            {loading ? 'Registrando...' : 'Generar Acta de Transferencia'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────
// COMPONENTE: ModalNuevoEncargado
// ─────────────────────────────────────────────────────────────────
function ModalNuevoEncargado({ encargado, onClose, onGuardar }) {
  const [form, setForm] = useState(encargado || {
    nombre_completo: '', cargo: '', ci: '', email: '', telefono: '', observaciones: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nombre_completo || !form.cargo || !form.ci) {
      toast.error('Complete los campos obligatorios: nombre, cargo y CI.')
      return
    }
    setLoading(true)
    await onGuardar(form)
    setLoading(false)
  }

  return (
    <div className="ce-acta-modal-overlay" onClick={onClose}>
      <div className="ce-acta-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="ce-acta-header">
          <div className="ce-acta-logo" style={{ fontSize: 22 }}>{encargado ? '✏️' : '👤'}</div>
          <div className="ce-acta-titulo">
            {encargado ? 'Editar Encargado' : 'Nuevo Encargado del Kardex'}
          </div>
        </div>

        <div className="ce-acta-body">
          <div className="ce-form-grid">
            <div className="ce-field" style={{ gridColumn: '1 / -1' }}>
              <label>Nombre completo *</label>
              <input
                placeholder="Ej: Tcnl. Carlos Mamani Quispe"
                value={form.nombre_completo}
                onChange={e => set('nombre_completo', e.target.value)}
              />
            </div>
            <div className="ce-field">
              <label>Cargo *</label>
              <input
                placeholder="Ej: Jefe de Registro Académico"
                value={form.cargo}
                onChange={e => set('cargo', e.target.value)}
              />
            </div>
            <div className="ce-field">
              <label>CI *</label>
              <input
                placeholder="Cédula de identidad"
                value={form.ci}
                onChange={e => set('ci', e.target.value)}
              />
            </div>
            <div className="ce-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="correo@emi.edu.bo"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
            <div className="ce-field">
              <label>Teléfono</label>
              <input
                placeholder="Ej: 70012345"
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
              />
            </div>
            <div className="ce-field" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones</label>
              <textarea
                placeholder="Notas adicionales..."
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="ce-acta-footer">
          <button className="ce-btn ce-btn-secondary" onClick={onClose} disabled={loading}>
            <X size={14} /> Cancelar
          </button>
          <button className="ce-btn ce-btn-primary" onClick={handleSubmit} disabled={loading}>
            <CheckCircle size={14} />
            {loading ? 'Guardando...' : (encargado ? 'Actualizar' : 'Registrar Encargado')}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: CambioEncargado
// ─────────────────────────────────────────────────────────────────
export default function CambioEncargado() {
  const [activeTab, setActiveTab]           = useState('transferencia')
  const [encargados, setEncargados]         = useState([])
  const [transferencias, setTransferencias] = useState([])
  const [historial, setHistorial]           = useState([])
  const [loading, setLoading]               = useState(true)

  // Modales
  const [modalActa, setModalActa]               = useState(null)
  const [modalConfirmar, setModalConfirmar]     = useState(null)
  const [modalNuevaT, setModalNuevaT]           = useState(false)
  const [modalNuevoEnc, setModalNuevoEnc]       = useState(null) // null | false | encargado

  // ── Carga de datos ─────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [enc, tra, hist] = await Promise.all([
        apiFetch('/encargados/'),
        apiFetch('/transferencias/'),
        apiFetch('/transferencias/historial-custodios/'),
      ])
      setEncargados(enc.results || enc)
      setTransferencias(tra.results || tra)
      setHistorial(hist.historial || hist)
    } catch {
      // Fallback con datos de demostración
      setEncargados(DEMO_ENCARGADOS)
      setTransferencias(DEMO_TRANSFERENCIAS)
      buildDemoHistorial()
    } finally {
      setLoading(false)
    }
  }, [])

  const buildDemoHistorial = () => {
    setHistorial([
      { encargado: 'Tcnl. Carlos Mamani Quispe', cargo: 'Jefe de Registro Académico', ci: '4521897', desde: '2024-01-15T10:30:00Z', hasta: null, numero_acta: 'ACTA-KARDEX-2024-0003', hash_acta: 'a3f4e2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2', esCurrent: true },
      { encargado: 'Mayor Ana Flores Gutierrez', cargo: 'Secretaria General', ci: '6238471', desde: '2023-03-10T09:00:00Z', hasta: '2024-01-15T10:30:00Z', numero_acta: 'ACTA-KARDEX-2023-0002', hash_acta: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', esCurrent: false },
      { encargado: 'Tte. Jorge Condori Lara', cargo: 'Asistente de Registro', ci: '8734521', desde: '2022-08-01T09:00:00Z', hasta: '2023-03-10T09:00:00Z', numero_acta: 'ACTA-KARDEX-2023-0001', hash_acta: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', esCurrent: false },
    ])
  }

  useEffect(() => { loadAll() }, [loadAll])

  // ── Acciones API ───────────────────────────────────────────────
  const crearTransferencia = async (form) => {
    try {
      const nueva = await apiFetch('/transferencias/', {
        method: 'POST', body: JSON.stringify(form),
      })
      setTransferencias(prev => [nueva, ...prev])
      setModalNuevaT(false)
      toast.success(`✅ Acta ${nueva.numero_acta} generada correctamente.`)
    } catch (err) {
      // Demo mode: simular creación
      const demo = {
        id: Date.now(), numero_acta: `ACTA-KARDEX-2024-${String(transferencias.length + 1).padStart(4, '0')}`,
        estado: 'PENDIENTE', ...form,
        encargado_entrega_nombre: encargados.find(e => e.id == form.encargado_entrega)?.nombre_completo || '—',
        encargado_entrega_cargo:  encargados.find(e => e.id == form.encargado_entrega)?.cargo || '—',
        encargado_entrega_ci:     encargados.find(e => e.id == form.encargado_entrega)?.ci || '—',
        encargado_recibe_nombre:  encargados.find(e => e.id == form.encargado_recibe)?.nombre_completo || '—',
        encargado_recibe_cargo:   encargados.find(e => e.id == form.encargado_recibe)?.cargo || '—',
        encargado_recibe_ci:      encargados.find(e => e.id == form.encargado_recibe)?.ci || '—',
        hash_acta: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        fecha_registro: new Date().toISOString(), fecha_confirmacion: null,
      }
      setTransferencias(prev => [demo, ...prev])
      setModalNuevaT(false)
      toast.success(`✅ Acta ${demo.numero_acta} generada (modo demo).`)
    }
  }

  const confirmarRecepcion = async (id, observaciones) => {
    try {
      const updated = await apiFetch(`/transferencias/${id}/confirmar-recepcion/`, {
        method: 'PATCH', body: JSON.stringify({ observaciones_receptor: observaciones }),
      })
      setTransferencias(prev => prev.map(t => t.id === id ? updated : t))
      setModalConfirmar(null)
      toast.success('✅ Recepción confirmada. El encargado activo ha sido actualizado.')
      loadAll()
    } catch {
      // Demo mode
      setTransferencias(prev => prev.map(t =>
        t.id === id ? { ...t, estado: 'CONFIRMADA', observaciones_receptor: observaciones, fecha_confirmacion: new Date().toISOString() } : t
      ))
      setModalConfirmar(null)
      toast.success('✅ Recepción confirmada (modo demo).')
    }
  }

  const verActa = async (transferencia) => {
    try {
      const acta = await apiFetch(`/transferencias/${transferencia.id}/generar-acta/`)
      setModalActa({ ...acta, numero_acta: acta.numero_acta || transferencia.numero_acta })
    } catch {
      setModalActa(transferencia)
    }
  }

  const anularTransferencia = async (id) => {
    if (!confirm('¿Está seguro de anular esta transferencia?')) return
    try {
      await apiFetch(`/transferencias/${id}/anular/`, { method: 'PATCH' })
      setTransferencias(prev => prev.map(t => t.id === id ? { ...t, estado: 'ANULADA' } : t))
      toast.success('Transferencia anulada.')
    } catch {
      setTransferencias(prev => prev.map(t => t.id === id ? { ...t, estado: 'ANULADA' } : t))
      toast.success('Transferencia anulada (modo demo).')
    }
  }

  const guardarEncargado = async (form) => {
    const isEdit = !!form.id
    try {
      const result = isEdit
        ? await apiFetch(`/encargados/${form.id}/`, { method: 'PUT', body: JSON.stringify(form) })
        : await apiFetch('/encargados/', { method: 'POST', body: JSON.stringify(form) })
      isEdit
        ? setEncargados(prev => prev.map(e => e.id === result.id ? result : e))
        : setEncargados(prev => [...prev, result])
      setModalNuevoEnc(null)
      toast.success(isEdit ? 'Encargado actualizado.' : 'Encargado registrado exitosamente.')
    } catch {
      const demo = { id: Date.now(), ...form, activo: false }
      isEdit
        ? setEncargados(prev => prev.map(e => e.id === form.id ? { ...e, ...form } : e))
        : setEncargados(prev => [...prev, demo])
      setModalNuevoEnc(null)
      toast.success((isEdit ? 'Encargado actualizado' : 'Encargado registrado') + ' (modo demo).')
    }
  }

  const activarEncargado = async (id) => {
    try {
      await apiFetch(`/encargados/${id}/activar/`, { method: 'POST' })
      setEncargados(prev => prev.map(e => ({ ...e, activo: e.id === id })))
      toast.success('Encargado activo actualizado.')
    } catch {
      setEncargados(prev => prev.map(e => ({ ...e, activo: e.id === id })))
      toast.success('Encargado activo actualizado (modo demo).')
    }
  }

  // ── Datos calculados ───────────────────────────────────────────
  const encargadoActivo   = encargados.find(e => e.activo)
  const totalTransferidas = transferencias.reduce((s, t) => s + (t.cantidad_documentos || 0), 0)
  const pendientes        = transferencias.filter(t => t.estado === 'PENDIENTE').length
  const confirmadas       = transferencias.filter(t => t.estado === 'CONFIRMADA').length

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const formatDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">

      {/* ── Cabecera de página ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cambio de Encargado del Kardex</h1>
          <p className="page-subtitle">
            Gestión de transferencias de custodia con actas digitales e historial verificable
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="btnRefresh"
            className="ce-btn ce-btn-secondary"
            onClick={loadAll}
            disabled={loading}
            title="Recargar datos"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {!loading && 'Actualizar'}
          </button>
          <button
            id="btnNuevaTransferencia"
            className="ce-btn ce-btn-primary"
            onClick={() => setModalNuevaT(true)}
          >
            <Plus size={14} /> Nueva Transferencia
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="ce-stats">
        {[
          { icon: '👤', label: 'Custodio actual', value: encargadoActivo ? '1' : '—', color: 'text-gold' },
          { icon: '📋', label: 'Total transferencias', value: transferencias.length, color: 'text-chain' },
          { icon: '⏳', label: 'Pendientes', value: pendientes, color: pendientes > 0 ? 'text-warning' : 'text-chain' },
          { icon: '📦', label: 'Docs. transferidos', value: totalTransferidas.toLocaleString(), color: 'text-gold' },
        ].map((s, i) => (
          <div key={i} className="ce-stat-card">
            <div className="ce-stat-icon">{s.icon}</div>
            <div className={`ce-stat-value ${s.color}`}>{s.value}</div>
            <div className="ce-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tarjeta del custodio activo ── */}
      {encargadoActivo ? (
        <div className="ce-custodio-card">
          <div className="ce-badge-activo">Custodio Activo</div>
          <div className="ce-custodio-label">
            <Shield size={12} /> Encargado Actual del Kardex
          </div>
          <div className="ce-custodio-body">
            <div className="ce-custodio-avatar">
              {encargadoActivo.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="ce-custodio-info">
              <h3>{encargadoActivo.nombre_completo}</h3>
              <p>{encargadoActivo.cargo}</p>
              <div className="ce-custodio-meta">
                <div className="ce-meta-item">
                  <User size={11} /> CI: {encargadoActivo.ci}
                </div>
                {encargadoActivo.email && (
                  <div className="ce-meta-item">
                    <Mail size={11} /> {encargadoActivo.email}
                  </div>
                )}
                {encargadoActivo.fecha_asignacion && (
                  <div className="ce-meta-item">
                    <Clock size={11} /> Desde: {formatDate(encargadoActivo.fecha_asignacion)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(231,76,60,0.07)', border: '1px solid rgba(231,76,60,0.25)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--color-danger-400)', fontSize: 13,
        }}>
          <AlertTriangle size={16} />
          No hay un encargado activo asignado. Registre un encargado y márquelo como activo.
        </div>
      )}

      {/* ── Navegación por pestañas ── */}
      <div className="ce-tabs">
        {[
          { id: 'transferencia', label: 'Transferencias', icon: <ArrowLeftRight size={14} /> },
          { id: 'historial',     label: 'Historial de Custodios', icon: <History size={14} /> },
          { id: 'encargados',   label: 'Encargados', icon: <Users size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`ce-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>


      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 1: Transferencias
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'transferencia' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div className="loader-spin" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 12px' }} />
              Cargando transferencias...
            </div>
          ) : transferencias.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60,
              color: 'var(--text-muted)', fontSize: 14,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
              No hay transferencias registradas.<br />
              <button className="ce-btn ce-btn-primary" style={{ marginTop: 16 }} onClick={() => setModalNuevaT(true)}>
                <Plus size={14} /> Registrar primera transferencia
              </button>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-header">
                <ArrowLeftRight size={16} className="text-gold" />
                <span className="table-title">Actas de Transferencia</span>
                <span className="badge badge-muted">{transferencias.length}</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>N° Acta</th>
                      <th>Encargado que Entrega</th>
                      <th>Encargado que Recibe</th>
                      <th>Fecha Transferencia</th>
                      <th>Documentos</th>
                      <th>Estado</th>
                      <th>Hash</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferencias.map(t => (
                      <tr key={t.id}>
                        <td>
                          <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-gold-400)' }}>
                            {t.numero_acta}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{t.encargado_entrega_nombre}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.encargado_entrega_cargo}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{t.encargado_recibe_nombre}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.encargado_recibe_cargo}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 11 }}>{formatDateTime(t.fecha_transferencia)}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--color-gold-400)', fontSize: 13 }}>
                            {(t.cantidad_documentos || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={`ce-estado ${t.estado?.toLowerCase()}`}>
                            {t.estado === 'PENDIENTE'  && '⏳'}
                            {t.estado === 'CONFIRMADA' && '✅'}
                            {t.estado === 'ANULADA'    && '❌'}
                            {' '}{t.estado}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Hash size={10} style={{ color: 'var(--text-muted)' }} />
                            <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                              {t.hash_acta ? t.hash_acta.slice(0, 16) + '...' : '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                            <button
                              id={`btnVerActa-${t.id}`}
                              className="ce-btn ce-btn-secondary ce-btn-sm"
                              onClick={() => verActa(t)}
                              title="Ver acta digital"
                            >
                              <Eye size={11} /> Acta
                            </button>
                            {t.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  id={`btnConfirmar-${t.id}`}
                                  className="ce-btn ce-btn-confirm ce-btn-sm"
                                  onClick={() => setModalConfirmar(t)}
                                  title="Confirmar recepción"
                                >
                                  <CheckCircle size={11} /> Confirmar
                                </button>
                                <button
                                  id={`btnAnular-${t.id}`}
                                  className="ce-btn ce-btn-danger ce-btn-sm"
                                  onClick={() => anularTransferencia(t.id)}
                                  title="Anular transferencia"
                                >
                                  <XCircle size={11} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 2: Historial de Custodios
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'historial' && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
          }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Historial de Responsables
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Registro inmutable de todos los encargados que tuvieron custodia del Kardex
              </p>
            </div>
            <span className="badge badge-muted">{historial.length} custodios</span>
          </div>

          {historial.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📜</div>
              No hay historial de custodios aún.
            </div>
          ) : (
            <div className="ce-timeline">
              {historial.map((h, i) => (
                <div key={i} className={`ce-timeline-item ${h.esCurrent || (!h.hasta) ? 'current' : ''}`}>
                  <div className={`ce-timeline-dot ${h.esCurrent || (!h.hasta) ? 'current' : ''}`} />

                  <div className="ce-timeline-header">
                    <div>
                      <div className="ce-timeline-name">{h.encargado}</div>
                      <div className="ce-timeline-cargo">{h.cargo} · CI: {h.ci}</div>
                    </div>
                    <div className="ce-timeline-dates">
                      {(!h.hasta) && (
                        <span className="ce-estado confirmada" style={{ fontSize: 10, marginBottom: 6, display: 'block', textAlign: 'right' }}>
                          ✅ Actual
                        </span>
                      )}
                      <div>📅 Desde: {formatDate(h.desde)}</div>
                      {h.hasta && <div style={{ marginTop: 2 }}>📅 Hasta: {formatDate(h.hasta)}</div>}
                    </div>
                  </div>

                  <div className="ce-timeline-hash">
                    <Hash size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span>
                      Acta: <strong style={{ color: 'var(--color-gold-400)' }}>{h.numero_acta}</strong>
                      {' · '}
                      {h.hash_acta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          PESTAÑA 3: Encargados
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'encargados' && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
          }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Catálogo de Encargados
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Personas autorizadas para ser custodios del Kardex
              </p>
            </div>
            <button
              id="btnNuevoEncargado"
              className="ce-btn ce-btn-primary"
              onClick={() => setModalNuevoEnc(false)}
            >
              <Plus size={14} /> Nuevo Encargado
            </button>
          </div>

          {encargados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              No hay encargados registrados.
            </div>
          ) : (
            <div className="ce-encargados-grid">
              {encargados.map(enc => (
                <div key={enc.id} className={`ce-encargado-card ${enc.activo ? 'activo-card' : ''}`}>

                  {enc.activo && (
                    <div className="ce-badge-activo" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>
                      Activo
                    </div>
                  )}

                  <div className="ce-enc-header">
                    <div className={`ce-enc-avatar ${enc.activo ? 'activo-av' : ''}`}>
                      {enc.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="ce-enc-name">{enc.nombre_completo}</div>
                      <div className="ce-enc-cargo">{enc.cargo}</div>
                    </div>
                  </div>

                  <div className="ce-enc-meta">
                    <div className="ce-enc-meta-row">
                      <User size={11} /> CI: {enc.ci}
                    </div>
                    {enc.email && (
                      <div className="ce-enc-meta-row">
                        <Mail size={11} /> {enc.email}
                      </div>
                    )}
                    {enc.telefono && (
                      <div className="ce-enc-meta-row">
                        <Phone size={11} /> {enc.telefono}
                      </div>
                    )}
                    {enc.fecha_asignacion && (
                      <div className="ce-enc-meta-row">
                        <Clock size={11} /> Asignado: {formatDate(enc.fecha_asignacion)}
                      </div>
                    )}
                  </div>

                  <div className="ce-enc-actions">
                    {!enc.activo && (
                      <button
                        id={`btnActivar-${enc.id}`}
                        className="ce-btn ce-btn-confirm ce-btn-sm"
                        onClick={() => activarEncargado(enc.id)}
                        title="Marcar como encargado activo"
                      >
                        <CheckCircle size={11} /> Activar
                      </button>
                    )}
                    <button
                      id={`btnEditarEnc-${enc.id}`}
                      className="ce-btn ce-btn-secondary ce-btn-sm"
                      onClick={() => setModalNuevoEnc(enc)}
                      title="Editar encargado"
                    >
                      <Edit2 size={11} /> Editar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ── Modales ── */}
      {modalActa      && <ModalActa acta={modalActa} onClose={() => setModalActa(null)} />}
      {modalConfirmar && (
        <ModalConfirmar
          transferencia={modalConfirmar}
          onClose={() => setModalConfirmar(null)}
          onConfirm={confirmarRecepcion}
        />
      )}
      {modalNuevaT && (
        <ModalNuevaTransferencia
          encargados={encargados}
          onClose={() => setModalNuevaT(false)}
          onCrear={crearTransferencia}
        />
      )}
      {modalNuevoEnc !== null && (
        <ModalNuevoEncargado
          encargado={modalNuevoEnc || null}
          onClose={() => setModalNuevoEnc(null)}
          onGuardar={guardarEncargado}
        />
      )}

    </div>
  )
}
