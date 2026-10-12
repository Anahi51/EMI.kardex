import { useState, useEffect } from 'react'
import {
  Briefcase, Plus, Search, Edit2, Trash2, X, Eye, EyeOff,
  User, Phone, Mail, MapPin, Building2, Shield,
  CheckCircle, Calendar, Hash, Users, FileText, Download,
  CheckCircle2, Award, Clock, FileCheck, Contact, Map,
  Fingerprint, Sparkles, RefreshCw, FileDown, Heart, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadSingleDocument } from '../services/docDownloadService'
import { getAllUploadedDocs, downloadUploadedDoc, getDocsForPerson, getPersonDocForSlot } from '../services/docUploadService'
import { updateDocsUserInfo } from '../services/profileSyncService'
import './Administrativo.css'

// ── Lista de Documentos Reglamentarios para Administrativos ───────────────
const ADMINISTRATIVO_DOCUMENTS = [
  { id: 1, num: 1, title: 'Documento de Identidad', subtitle: '(Carnet de Identidad)', icon: Contact, archivo: 'carnet_identidad.pdf', fecha: '15/03/2024 09:15' },
  { id: 2, num: 2, title: 'REJAP', subtitle: '(Registro Judicial de Antecedentes)', icon: FileCheck, archivo: 'rejap_admin.pdf', fecha: '15/03/2024 09:20' },
  { id: 3, num: 3, title: 'Certificado de No Violencia', subtitle: '', icon: Shield, archivo: 'cert_no_violencia.pdf', fecha: '15/03/2024 09:25' },
  { id: 4, num: 4, title: 'NIT', subtitle: '(Identificación Tributaria)', icon: FileText, archivo: 'nit_admin.pdf', fecha: '15/03/2024 09:30' },
  { id: 5, num: 5, title: 'SIGEP', subtitle: '(Gestión Pública)', icon: Fingerprint, archivo: 'sigep_registro.pdf', fecha: '15/03/2024 09:35' },
  { id: 6, num: 6, title: 'Registro Ciudadanía Digital', subtitle: '', icon: Contact, archivo: 'ciudadania_digital.pdf', fecha: '15/03/2024 09:40' },
  { id: 7, num: 7, title: 'Croquis', subtitle: '(Ubicación Domicilio)', icon: Map, archivo: 'croquis_domicilio.pdf', fecha: '15/03/2024 09:45' },
  { id: 8, num: 8, title: 'Certificación POA', subtitle: '(Plan Operativo Anual)', icon: FileText, archivo: 'certificacion_poa.pdf', fecha: '15/03/2024 09:50' },
]

// ── Datos de muestra ─────────────────────────────────────────────────────────
const MOCK_ADMIN = [
  {
    id: 1, ci: '10234567', codigo: 'ADM-2024-001',
    nombre: 'Lic. Carmen Rodríguez Vidal', cargo: 'Jefe de Secretaría',
    area: 'Secretaría General', email: 'c.rodriguez@emi.edu.bo',
    telefono: '+591 72345678', direccion: 'Av. Ejército 123, La Paz',
    turno: 'Mañana', estado: 'ACTIVO', fechaIngreso: '15/03/2019',
    gradoAcademico: 'Licenciatura', color: 'gold',
  },
  {
    id: 2, ci: '20345678', codigo: 'ADM-2024-002',
    nombre: 'Lic. Jorge Mamani Condori', cargo: 'Responsable Financiero',
    area: 'Finanzas y Contabilidad', email: 'j.mamani@emi.edu.bo',
    telefono: '+591 71234567', direccion: 'Calle Boquerón 45, La Paz',
    turno: 'Mañana', estado: 'ACTIVO', fechaIngreso: '02/07/2020',
    gradoAcademico: 'Licenciatura', color: 'green',
  },
  {
    id: 3, ci: '30456789', codigo: 'ADM-2024-003',
    nombre: 'Tec. Ana Flores Quispe', cargo: 'Técnico en Sistemas',
    area: 'Departamento de Sistemas', email: 'a.flores@emi.edu.bo',
    telefono: '+591 73456789', direccion: 'Calle Murillo 78, La Paz',
    turno: 'Tarde', estado: 'ACTIVO', fechaIngreso: '10/01/2022',
    gradoAcademico: 'Técnico Superior', color: 'purple',
  },
  {
    id: 4, ci: '40567890', codigo: 'ADM-2024-004',
    nombre: 'Lic. Miguel Torrez Salinas', cargo: 'Auxiliar Administrativo',
    area: 'Secretaría General', email: 'm.torrez@emi.edu.bo',
    telefono: '+591 70123456', direccion: 'Av. Montes 200, La Paz',
    turno: 'Mañana', estado: 'INACTIVO', fechaIngreso: '05/09/2021',
    gradoAcademico: 'Licenciatura', color: 'blue',
  },
]

const CARGO_OPTIONS = [
  'Jefe de Secretaría', 'Responsable Financiero', 'Técnico en Sistemas',
  'Auxiliar Administrativo', 'Responsable de Biblioteca', 'Jefe de RR.HH.',
  'Analista de Sistemas', 'Contador', 'Archivista', 'Recepcionista',
]

const AREA_OPTIONS = [
  'Secretaría General', 'Finanzas y Contabilidad', 'Departamento de Sistemas',
  'Recursos Humanos', 'Biblioteca', 'Registros Académicos', 'Decanato',
]

const GRADO_OPTIONS = [
  'Técnico Superior', 'Licenciatura', 'Maestría', 'Doctorado',
]

const TURNO_OPTIONS = ['Mañana', 'Tarde', 'Tiempo Completo']

const COLORS = ['gold', 'blue', 'green', 'purple', 'teal']

const INITIAL_FORM = {
  ci: '', nombre: '', cargo: CARGO_OPTIONS[0], area: AREA_OPTIONS[0],
  email: '', telefono: '', direccion: '', turno: 'Mañana',
  gradoAcademico: 'Licenciatura', estado: 'ACTIVO', password: '',
  fechaNacimiento: '', genero: '',
  contactoEmergenciaNombre: '', contactoEmergenciaTelefono: '',
  contactoEmergenciaParentesco: '', contactoEmergenciaDireccion: '',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

const getCargoBadgeClass = (cargo = '') => {
  if (cargo.toLowerCase().includes('secretar')) return 'secretaria'
  if (cargo.toLowerCase().includes('financ') || cargo.toLowerCase().includes('cont')) return 'financiero'
  if (cargo.toLowerCase().includes('sistem') || cargo.toLowerCase().includes('técn')) return 'sistemas'
  return ''
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Administrativo() {
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('emi_administrativos')
    if (saved) { try { return JSON.parse(saved) } catch { return MOCK_ADMIN } }
    localStorage.setItem('emi_administrativos', JSON.stringify(MOCK_ADMIN))
    return MOCK_ADMIN
  })

  const [selected, setSelected]       = useState(null)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [filterArea, setFilterArea]   = useState('Todos')
  const [panelTab, setPanelTab]       = useState('info') // 'info' | 'documentacion'
  const [previewDoc, setPreviewDoc]   = useState(null)
  const [previewUploadedDoc, setPreviewUploadedDoc] = useState(null)
  const [, setDocVersion]             = useState(0)

  useEffect(() => {
    const handleDocUpdate = () => setDocVersion(v => v + 1)
    window.addEventListener('emi_docs_updated', handleDocUpdate)
    return () => window.removeEventListener('emi_docs_updated', handleDocUpdate)
  }, [])

  // Sincronización en caliente cuando un administrativo actualiza sus datos
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('emi_administrativos')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setAdmins(parsed)
          if (selected) {
            const up = parsed.find(a => a.id === selected.id || a.codigo === selected.codigo || a.ci === selected.ci)
            if (up) setSelected(up)
          }
        } catch {}
      }
    }
    window.addEventListener('emi_administrativos_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('emi_administrativos_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [selected])

  useEffect(() => {
    localStorage.setItem('emi_administrativos', JSON.stringify(admins))
  }, [admins])

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtered = admins.filter(a => {
    const matchSearch = !search ||
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.ci.includes(search) ||
      a.cargo.toLowerCase().includes(search.toLowerCase())
    const matchArea = filterArea === 'Todos' || a.area === filterArea
    return matchSearch && matchArea
  })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalActivos   = admins.filter(a => a.estado === 'ACTIVO').length
  const totalAreas     = [...new Set(admins.map(a => a.area))].length
  const totalInactivos = admins.filter(a => a.estado === 'INACTIVO').length

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowPassword(false)
    setShowModal(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      ci: a.ci || '',
      nombre: a.nombre || '',
      cargo: a.cargo || CARGO_OPTIONS[0],
      area: a.area || AREA_OPTIONS[0],
      email: a.email || '',
      telefono: a.telefono || '',
      direccion: a.direccion || '',
      turno: a.turno || 'Mañana',
      gradoAcademico: a.gradoAcademico || 'Licenciatura',
      estado: a.estado || 'ACTIVO',
      password: '',
      fechaNacimiento: a.fechaNacimiento || '',
      genero: a.genero || '',
      contactoEmergenciaNombre: a.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: a.contactoEmergenciaTelefono || '',
      contactoEmergenciaParentesco: a.contactoEmergenciaParentesco || '',
      contactoEmergenciaDireccion: a.contactoEmergenciaDireccion || '',
    })
    setShowPassword(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(INITIAL_FORM)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = () => {
    if (!form.ci.trim() || !form.nombre.trim() || !form.email.trim()) {
      toast.error('CI, nombre y email son obligatorios')
      return
    }

    if (!/^\d+$/.test(form.ci.trim())) {
      toast.error('El carnet (C.I.) solo debe contener números.')
      return
    }

    if (form.ci.trim().length > 10) {
      toast.error('El carnet (C.I.) no puede tener más de 10 dígitos.')
      return
    }

    if (/\d/.test(form.nombre)) {
      toast.error('El nombre completo no debe contener números. Solo se permiten letras.')
      return
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]+$/.test(form.nombre.trim())) {
      toast.error('El nombre completo solo debe contener letras.')
      return
    }

    if (form.telefono.trim() && !/^\d+$/.test(form.telefono.trim())) {
      toast.error('El teléfono solo debe contener números.')
      return
    }

    if (editing) {
      const updatedAdmin = {
        ...editing,
        ...form,
        password: form.password ? form.password : (editing.password || '123456')
      }
      const updatedList = admins.map(a => a.id === editing.id ? updatedAdmin : a)
      setAdmins(updatedList)
      localStorage.setItem('emi_administrativos', JSON.stringify(updatedList))
      if (selected?.id === editing.id) setSelected(updatedAdmin)
      toast.success('Administrativo actualizado correctamente')

      // Sincronizar usuario de autenticación en created_users
      try {
        const oldKeys = [
          editing.email,
          editing.ci,
          editing.codigo,
          editing.username
        ].filter(Boolean).map(k => String(k).toLowerCase())

        const storedAdmins = JSON.parse(localStorage.getItem('created_users') || '[]')
        const filteredStored = storedAdmins.filter(u => {
          const uEmail = String(u.email || '').toLowerCase()
          const uUsername = String(u.username || '').toLowerCase()
          const uCi = String(u.ci || '').toLowerCase()
          const uCodigo = String(u.codigo || '').toLowerCase()
          return !oldKeys.includes(uEmail) && !oldKeys.includes(uUsername) && !oldKeys.includes(uCi) && !oldKeys.includes(uCodigo)
        })

        const updatedAdminUser = {
          name: updatedAdmin.nombre,
          role: 'Administrativo',
          username: updatedAdmin.email || updatedAdmin.ci,
          email: updatedAdmin.email || updatedAdmin.ci,
          password: updatedAdmin.password,
          cargo: updatedAdmin.cargo,
          area: updatedAdmin.area,
          codigo: updatedAdmin.codigo,
          ci: updatedAdmin.ci,
          telefono: updatedAdmin.telefono,
          direccion: updatedAdmin.direccion,
          turno: updatedAdmin.turno,
          gradoAcademico: updatedAdmin.gradoAcademico,
          estado: updatedAdmin.estado,
          fechaNacimiento: updatedAdmin.fechaNacimiento,
          genero: updatedAdmin.genero,
          contactoEmergenciaNombre: updatedAdmin.contactoEmergenciaNombre,
          contactoEmergenciaTelefono: updatedAdmin.contactoEmergenciaTelefono,
          contactoEmergenciaParentesco: updatedAdmin.contactoEmergenciaParentesco,
          contactoEmergenciaDireccion: updatedAdmin.contactoEmergenciaDireccion,
        }
        localStorage.setItem('created_users', JSON.stringify([...filteredStored, updatedAdminUser]))
      } catch (e) {
        console.error('Error actualizando created_users:', e)
      }

      // Sincronizar documentos previamente subidos con el nuevo nombre y CI
      updateDocsUserInfo(
        [editing?.email, editing?.ci, editing?.codigo, updatedAdmin.email, updatedAdmin.ci, updatedAdmin.codigo],
        updatedAdmin
      )

      // Notificar en caliente para actualizar el dashboard del administrativo
      window.dispatchEvent(new CustomEvent('emi_administrativos_updated', { detail: updatedAdmin }))
      window.dispatchEvent(new Event('storage'))

      // Si el usuario en sesión es este administrativo, actualizar emi_user
      try {
        const curUser = JSON.parse(localStorage.getItem('emi_user') || '{}')
        if (curUser && (curUser.ci === updatedAdmin.ci || curUser.email === updatedAdmin.email || curUser.codigo === updatedAdmin.codigo)) {
          const updatedAuth = { ...curUser, ...updatedAdmin, name: updatedAdmin.nombre }
          localStorage.setItem('emi_user', JSON.stringify(updatedAuth))
          window.dispatchEvent(new Event('emi_user_updated'))
        }
      } catch (e) {
        console.error('Error actualizando emi_user:', e)
      }
    } else {
      const nextId = Math.max(0, ...admins.map(a => a.id)) + 1
      const color  = COLORS[nextId % COLORS.length]
      const next   = {
        ...form,
        id: nextId,
        color,
        fechaIngreso: new Date().toLocaleDateString('es-BO'),
        codigo: `ADM-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`,
        password: form.password || '123456',
      }
      const updatedList = [...admins, next]
      setAdmins(updatedList)
      localStorage.setItem('emi_administrativos', JSON.stringify(updatedList))

      // Registrar en created_users para que el login funcione con correo y contraseña asignados
      try {
        const existing = JSON.parse(localStorage.getItem('created_users') || '[]')
        const filteredStored = existing.filter(u => u.email !== next.email && u.username !== next.email && u.ci !== next.ci)
        const newAdminUser = {
          name:     next.nombre,
          role:     'Administrativo',
          username: next.email,
          email:    next.email,
          password: next.password,
          cargo:    next.cargo,
          area:     next.area,
          codigo:   next.codigo,
          ci:       next.ci,
          telefono: next.telefono,
          direccion: next.direccion,
          turno:    next.turno,
          gradoAcademico: next.gradoAcademico,
          estado:   next.estado,
          fechaNacimiento: next.fechaNacimiento,
          genero: next.genero,
          contactoEmergenciaNombre: next.contactoEmergenciaNombre,
          contactoEmergenciaTelefono: next.contactoEmergenciaTelefono,
          contactoEmergenciaParentesco: next.contactoEmergenciaParentesco,
          contactoEmergenciaDireccion: next.contactoEmergenciaDireccion,
        }
        localStorage.setItem('created_users', JSON.stringify([...filteredStored, newAdminUser]))
      } catch (e) {
        console.error('Error guardando admin en registro:', e)
      }

      window.dispatchEvent(new CustomEvent('emi_administrativos_updated', { detail: next }))
      window.dispatchEvent(new Event('storage'))

      toast.success(`Administrativo registrado. Correo: "${next.email}" · Contraseña: "${next.password || '123456'}"`)
    }
    closeModal()
  }

  const handleDelete = (a, e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar a ${a.nombre}?`)) return
    setAdmins(prev => prev.filter(x => x.id !== a.id))
    if (selected?.id === a.id) setSelected(null)
    toast.success('Administrativo eliminado')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Personal Administrativo</h1>
          <p className="page-subtitle">Gestión del personal administrativo · {admins.length} registros</p>
        </div>
        <button id="btnNuevoAdmin" className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Nuevo Administrativo
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon gold"><Users size={20} /></div>
          <div>
            <div className="admin-stat-value">{admins.length}</div>
            <div className="admin-stat-label">Total Personal</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><CheckCircle size={20} /></div>
          <div>
            <div className="admin-stat-value">{totalActivos}</div>
            <div className="admin-stat-label">Activos</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><Building2 size={20} /></div>
          <div>
            <div className="admin-stat-value">{totalAreas}</div>
            <div className="admin-stat-label">Áreas</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><Shield size={20} /></div>
          <div>
            <div className="admin-stat-value">{totalInactivos}</div>
            <div className="admin-stat-label">Inactivos</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-list-container">
        {/* Left panel */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-search-box">
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                id="adminSearchInput"
                placeholder="Buscar por nombre, CI o cargo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              id="adminAreaFilter"
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)', padding: '8px 12px',
                color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="Todos">Todas las áreas</option>
              {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Personal</th>
                  <th>Cargo</th>
                  <th>Área</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No se encontraron registros
                    </td>
                  </tr>
                )}
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    className={selected?.id === a.id ? 'selected' : ''}
                    onClick={() => setSelected(a)}
                  >
                    <td>
                      <div className="admin-name-cell">
                        <div className={`admin-avatar ${a.color || 'gold'}`}>
                          {getInitials(a.nombre)}
                        </div>
                        <div className="admin-name-info">
                          <strong>{a.nombre}</strong>
                          <span>{a.ci}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-cargo ${getCargoBadgeClass(a.cargo)}`}>{a.cargo}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.area}</td>
                    <td style={{ fontSize: 12 }}>{a.turno}</td>
                    <td>
                      <span className={`badge-estado ${a.estado === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          id={`editAdmin_${a.id}`}
                          className="btn-icon-sm"
                          onClick={e => { e.stopPropagation(); openEdit(a) }}
                          title="Editar"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          id={`delAdmin_${a.id}`}
                          className="btn-icon-sm danger"
                          onClick={e => handleDelete(a, e)}
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right detail panel */}
        <div className="admin-detail-panel">
          {!selected ? (
            <div className="admin-detail-placeholder">
              <Briefcase size={48} />
              <p>Selecciona un administrativo de la lista para ver su información detallada.</p>
            </div>
          ) : (
            <>
              <div className="admin-detail-header">
                <button className="admin-detail-close" onClick={() => setSelected(null)}>
                  <X size={14} />
                </button>
                <div className={`admin-detail-avatar`} style={
                  selected.color === 'purple' ? { background: 'linear-gradient(135deg,#9b59b6,#6c3483)', color:'#fff' }
                  : selected.color === 'blue'   ? { background: 'linear-gradient(135deg,#3498db,#1a5276)', color:'#fff' }
                  : selected.color === 'green'  ? { background: 'linear-gradient(135deg,#1abc9c,#0e6655)', color:'#fff' }
                  : {}
                }>
                  {getInitials(selected.nombre)}
                </div>
                <div className="admin-detail-name">{selected.nombre}</div>
                <div className="admin-detail-cargo">{selected.cargo}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
                  <span className={`badge-estado ${selected.estado === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                    {selected.estado}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ fontSize: 11, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => openEdit(selected)}
                    title="Editar datos del personal administrativo"
                  >
                    <Edit2 size={12} /> Editar Personal
                  </button>
                </div>
              </div>

                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '0 12px',
                  gap: 8
                }}>
                  <button
                    type="button"
                    onClick={() => setPanelTab('info')}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: panelTab === 'info' ? '2px solid #eab308' : '2px solid transparent',
                      color: panelTab === 'info' ? '#eab308' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <User size={13} /> Información
                  </button>
                  <button
                    type="button"
                    id="adminDocTabBtn"
                    onClick={() => setPanelTab('documentacion')}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: panelTab === 'documentacion' ? '2px solid #eab308' : '2px solid transparent',
                      color: panelTab === 'documentacion' ? '#eab308' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FileText size={13} /> Documentación
                    {(() => {
                      const upCount = getDocsForPerson(selected).length
                      if (upCount > 0) {
                        return (
                          <span style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 10,
                            fontWeight: 700
                          }}>{upCount}</span>
                        )
                      }
                      return null
                    })()}
                  </button>
                </div>

                <div className="admin-detail-body">
                  {panelTab === 'info' ? (
                    <>
                      {/* Información general */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div className="admin-detail-section-title" style={{ margin: 0 }}>Información General</div>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={() => openEdit(selected)}
                          >
                            <Edit2 size={11} style={{ marginRight: 3 }} /> Editar
                          </button>
                        </div>
                        <div className="admin-detail-grid">
                          <div className="admin-detail-field">
                            <label><Hash size={10} style={{ display:'inline', marginRight:3 }} />Código</label>
                            <span>{selected.codigo}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><User size={10} style={{ display:'inline', marginRight:3 }} />C.I.</label>
                            <span>{selected.ci}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Building2 size={10} style={{ display:'inline', marginRight:3 }} />Área</label>
                            <span>{selected.area}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Calendar size={10} style={{ display:'inline', marginRight:3 }} />Turno</label>
                            <span>{selected.turno}</span>
                          </div>
                          <div className="admin-detail-field full">
                            <label><Shield size={10} style={{ display:'inline', marginRight:3 }} />Grado Académico</label>
                            <span>{selected.gradoAcademico}</span>
                          </div>
                          <div className="admin-detail-field full">
                            <label><Calendar size={10} style={{ display:'inline', marginRight:3 }} />Fecha de Ingreso</label>
                            <span>{selected.fechaIngreso}</span>
                          </div>
                        </div>
                      </div>

                      {/* Información Personal */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div className="admin-detail-section-title" style={{ margin: 0 }}>Información Personal</div>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={() => openEdit(selected)}
                          >
                            <Edit2 size={11} style={{ marginRight: 3 }} /> Editar
                          </button>
                        </div>
                        <div className="admin-detail-grid">
                          <div className="admin-detail-field full">
                            <label><Mail size={10} style={{ display:'inline', marginRight:3 }} />Email</label>
                            <span>{selected.email}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Phone size={10} style={{ display:'inline', marginRight:3 }} />Teléfono</label>
                            <span>{selected.telefono || '—'}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Calendar size={10} style={{ display:'inline', marginRight:3 }} />Fecha de Nacimiento</label>
                            <span>{selected.fechaNacimiento || '—'}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><User size={10} style={{ display:'inline', marginRight:3 }} />Género</label>
                            <span>{selected.genero || '—'}</span>
                          </div>
                          <div className="admin-detail-field full">
                            <label><MapPin size={10} style={{ display:'inline', marginRight:3 }} />Dirección</label>
                            <span>{selected.direccion || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contacto de Emergencia */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div className="admin-detail-section-title" style={{ margin: 0 }}>
                            <AlertCircle size={12} style={{ display:'inline', marginRight: 4, color: '#f59e0b' }} />
                            Contacto de Emergencia
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={() => openEdit(selected)}
                          >
                            <Edit2 size={11} style={{ marginRight: 3 }} /> Editar
                          </button>
                        </div>
                        <div className="admin-detail-grid">
                          <div className="admin-detail-field">
                            <label><User size={10} style={{ display:'inline', marginRight:3 }} />Nombre</label>
                            <span>{selected.contactoEmergenciaNombre || '—'}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Phone size={10} style={{ display:'inline', marginRight:3 }} />Teléfono</label>
                            <span>{selected.contactoEmergenciaTelefono || '—'}</span>
                          </div>
                          <div className="admin-detail-field">
                            <label><Heart size={10} style={{ display:'inline', marginRight:3 }} />Parentesco</label>
                            <span>{selected.contactoEmergenciaParentesco || '—'}</span>
                          </div>
                          <div className="admin-detail-field full">
                            <label><MapPin size={10} style={{ display:'inline', marginRight:3 }} />Dirección de Emergencia</label>
                            <span>{selected.contactoEmergenciaDireccion || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones rápidas */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          id={`detailEditAdmin_${selected.id}`}
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: 12 }}
                          onClick={() => openEdit(selected)}
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          id={`detailDelAdmin_${selected.id}`}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: 12, color: '#e74c3c', borderColor: 'rgba(231,76,60,0.4)' }}
                          onClick={e => { handleDelete(selected, e); }}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Pestaña: Documentación */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="admin-detail-section-title" style={{ margin: 0 }}>Expediente Digital</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>8 carpetas reglamentarias</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={() => toast.success('Documentación sincronizada con Blockchain.')}
                        >
                          <RefreshCw size={11} /> Sincronizar
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ADMINISTRATIVO_DOCUMENTS.map((doc) => {
                          const IconComp = doc.icon || FileText
                          const realDoc = getPersonDocForSlot(selected, doc)
                          const isUploaded = Boolean(realDoc)
                          const isImage = realDoc?.fileType?.startsWith('image/')

                          return (
                            <div
                              key={doc.id}
                              style={{
                                background: isUploaded ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isUploaded ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 8,
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                                <div style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  background: isUploaded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(201,162,39,0.1)',
                                  color: isUploaded ? '#22c55e' : 'var(--color-gold-400)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <IconComp size={16} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                      {doc.num}. {doc.title}
                                    </span>
                                    {isUploaded && (
                                      <span style={{
                                        fontSize: 9,
                                        padding: '1px 6px',
                                        borderRadius: 8,
                                        background: isImage ? 'rgba(251, 191, 36, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        color: isImage ? '#fbbf24' : '#818cf8',
                                        fontWeight: 700
                                      }}>
                                        {isImage ? '🖼 Imagen' : '📄 Archivo'}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11, color: isUploaded ? '#38bdf8' : 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {isUploaded ? realDoc.fileName : doc.archivo}
                                  </div>
                                  <div style={{ fontSize: 10, color: isUploaded ? '#22c55e' : 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {isUploaded ? (
                                      <>
                                        <CheckCircle2 size={10} />
                                        <span>Subido: {realDoc.uploadedAt}</span>
                                      </>
                                    ) : (
                                      <span>Pendiente de subida</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  className="btn-icon-sm"
                                  title={isUploaded ? 'Ver archivo original subido' : 'Ver documento oficial'}
                                  onClick={() => {
                                    if (isUploaded) setPreviewUploadedDoc(realDoc)
                                    else setPreviewDoc(doc)
                                  }}
                                  style={{ width: 28, height: 28 }}
                                >
                                  <Eye size={13} style={isUploaded ? { color: '#38bdf8' } : undefined} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon-sm"
                                  title={isUploaded ? 'Descargar archivo original' : 'Descargar documento'}
                                  onClick={() => {
                                    if (isUploaded) {
                                      downloadUploadedDoc(realDoc)
                                      toast.success(`Descargando: ${realDoc.fileName}`)
                                    } else {
                                      const ok = downloadSingleDocument(doc, selected, 'Administrativo')
                                      if (ok) toast.success(`Descargando: ${doc.title}`)
                                      else toast.error('Error al generar documento')
                                    }
                                  }}
                                  style={{ width: 28, height: 28 }}
                                >
                                  <Download size={13} style={isUploaded ? { color: '#22c55e' } : undefined} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Resumen de archivos subidos por el administrativo */}
                      {(() => {
                        const userDocs = getDocsForPerson(selected)
                        if (userDocs.length === 0) return null
                        return (
                          <div style={{ marginTop: 8, padding: 12, background: 'rgba(34, 197, 94, 0.08)', borderRadius: 8, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <CheckCircle2 size={15} color="#22c55e" />
                              <strong style={{ fontSize: 12, color: '#22c55e' }}>Archivos Registrados ({userDocs.length})</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {userDocs.map(ud => (
                                <div key={ud.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 6 }}>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>
                                    {ud.docTitle}: <strong>{ud.fileName}</strong>
                                  </span>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button type="button" className="btn-icon-sm" style={{ width: 24, height: 24 }} onClick={() => setPreviewUploadedDoc(ud)} title="Ver">
                                      <Eye size={11} />
                                    </button>
                                    <button type="button" className="btn-icon-sm" style={{ width: 24, height: 24 }} onClick={() => downloadUploadedDoc(ud)} title="Descargar">
                                      <Download size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de vista previa de archivo real subido */}
      {previewUploadedDoc && (
        <div className="doc-modal-overlay" onClick={() => setPreviewUploadedDoc(null)}>
          <div className="doc-modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                <h4>Vista Previa — {previewUploadedDoc.docTitle}</h4>
              </div>
              <button type="button" className="doc-modal-close" onClick={() => setPreviewUploadedDoc(null)}><X size={16} /></button>
            </div>
            <div className="doc-modal-body">
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Administrativo:</span>
                    <strong style={{ fontSize: 14 }}>{previewUploadedDoc.userName || selected?.nombre}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Código:</span>
                    <strong className="font-mono" style={{ fontSize: 13 }}>{previewUploadedDoc.userCodigo || selected?.codigo}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Fecha subida:</span>
                    <strong style={{ fontSize: 13, color: '#fbbf24' }}>{previewUploadedDoc.uploadedAt}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Documento:</span>
                    <strong style={{ fontSize: 13 }}>{previewUploadedDoc.docTitle}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Archivo:</span>
                    <span className="font-mono" style={{ fontSize: 12 }}>{previewUploadedDoc.fileName}</span>
                  </div>
                </div>
                {previewUploadedDoc.fileData && previewUploadedDoc.fileType?.startsWith('image/') && (
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <img
                      src={previewUploadedDoc.fileData}
                      alt={previewUploadedDoc.docTitle}
                      style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                )}
                {previewUploadedDoc.fileType === 'application/pdf' && (
                  <div style={{ marginTop: 12 }}>
                    <iframe
                      src={previewUploadedDoc.fileData}
                      style={{ width: '100%', height: '460px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                      title={previewUploadedDoc.docTitle}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="doc-modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewUploadedDoc(null)}>Cerrar</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  downloadUploadedDoc(previewUploadedDoc)
                  toast.success(`Descargando ${previewUploadedDoc.fileName}...`)
                }}
              >
                <Download size={14} /> Descargar Archivo Original
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de documento oficial general */}
      {previewDoc && selected && (
        <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="doc-modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                <h4>Vista Previa del Documento</h4>
              </div>
              <button type="button" className="doc-modal-close" onClick={() => setPreviewDoc(null)}><X size={16} /></button>
            </div>
            <div className="doc-modal-body">
              <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-sm font-bold text-white mb-1">{previewDoc.title}</div>
                <div className="text-xs text-muted font-mono mb-2">{previewDoc.archivo}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted block">Personal:</span>
                    <strong className="text-white">{selected.nombre}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Código Institucional:</span>
                    <strong className="text-gold">{selected.codigo}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Fecha de Carga:</span>
                    <span className="text-secondary">{previewDoc.fecha || 'Pendiente'}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Estado:</span>
                    <span className="text-chain font-bold">✓ Expediente Oficial EMI</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted">
                Registro institucional digitalizado para el área de recursos humanos y secretaría de la Escuela Militar de Ingeniería.
              </p>
            </div>
            <div className="doc-modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewDoc(null)}>Cerrar</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  downloadSingleDocument(previewDoc, selected, 'Administrativo')
                  toast.success(`Descargando ${previewDoc.title}...`)
                }}
              >
                <Download size={14} /> Descargar Documento Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Editar Administrativo' : 'Nuevo Administrativo'}</h3>
              <button className="btn-icon-sm" onClick={closeModal}><X size={15} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>C.I. *</label>
                  <input
                    id="adminFormCI"
                    name="ci"
                    value={form.ci}
                    maxLength={10}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                        toast.error('El carnet (C.I.) solo debe contener números.', { id: 'admin-ci-err' })
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value
                      const clean = raw.replace(/\D/g, '').slice(0, 10)
                      if (raw !== clean && /[a-zA-Z]/.test(raw)) {
                        toast.error('No se permiten letras en el carnet.', { id: 'admin-ci-err' })
                      }
                      setForm(f => ({ ...f, ci: clean }))
                    }}
                    placeholder="12345678"
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Solo números (máximo 10 dígitos).
                  </span>
                </div>
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    id="adminFormNombre"
                    name="nombre"
                    value={form.nombre}
                    onKeyDown={(e) => {
                      if (/^[0-9]$/.test(e.key)) {
                        e.preventDefault()
                        toast.error('Solo se permiten letras en el nombre completo.', { id: 'admin-nombre-err' })
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value
                      const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]/g, '')
                      if (raw !== clean && /[0-9]/.test(raw)) {
                        toast.error('No se permiten números en el nombre completo.', { id: 'admin-nombre-err' })
                      }
                      setForm(f => ({ ...f, nombre: clean }))
                    }}
                    placeholder="Lic. Juan Pérez"
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Solo letras y espacios (sin números).
                  </span>
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <select id="adminFormCargo" name="cargo" value={form.cargo} onChange={handleChange}>
                    {CARGO_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Área</label>
                  <select id="adminFormArea" name="area" value={form.area} onChange={handleChange}>
                    {AREA_OPTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Email *</label>
                  <input id="adminFormEmail" name="email" value={form.email} onChange={handleChange} placeholder="usuario@emi.edu.bo" type="email" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    id="adminFormTelefono"
                    name="telefono"
                    value={form.telefono}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                        toast.error('El teléfono solo debe contener números.', { id: 'admin-tel-err' })
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value
                      const clean = raw.replace(/\D/g, '')
                      if (raw !== clean && /[a-zA-Z]/.test(raw)) {
                        toast.error('No se permiten letras en el teléfono.', { id: 'admin-tel-err' })
                      }
                      setForm(f => ({ ...f, telefono: clean }))
                    }}
                    placeholder="71234567"
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Solo números (sin letras).
                  </span>
                </div>
                <div className="form-group">
                  <label>Turno</label>
                  <select id="adminFormTurno" name="turno" value={form.turno} onChange={handleChange}>
                    {TURNO_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Grado Académico</label>
                  <select id="adminFormGrado" name="gradoAcademico" value={form.gradoAcademico} onChange={handleChange}>
                    {GRADO_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select id="adminFormEstado" name="estado" value={form.estado} onChange={handleChange}>
                    <option>ACTIVO</option>
                    <option>INACTIVO</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Dirección</label>
                  <input id="adminFormDireccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. ..." />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input id="adminFormFechaNac" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Género</label>
                  <select id="adminFormGenero" name="genero" value={form.genero} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>

                {/* Sección: Contacto de Emergencia */}
                <div className="form-group full" style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> Contacto de Emergencia
                  </div>
                </div>
                <div className="form-group">
                  <label>Nombre del Contacto</label>
                  <input id="adminFormEmergNombre" name="contactoEmergenciaNombre" value={form.contactoEmergenciaNombre} onChange={handleChange} placeholder="Nombre completo" />
                </div>
                <div className="form-group">
                  <label>Teléfono del Contacto</label>
                  <input
                    id="adminFormEmergTelefono"
                    name="contactoEmergenciaTelefono"
                    value={form.contactoEmergenciaTelefono}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '')
                      setForm(f => ({ ...f, contactoEmergenciaTelefono: clean }))
                    }}
                    placeholder="71234567"
                  />
                </div>
                <div className="form-group">
                  <label>Parentesco</label>
                  <select id="adminFormEmergParentesco" name="contactoEmergenciaParentesco" value={form.contactoEmergenciaParentesco} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Esposo/a">Esposo/a</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Tío/a">Tío/a</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Dirección del Contacto</label>
                  <input id="adminFormEmergDireccion" name="contactoEmergenciaDireccion" value={form.contactoEmergenciaDireccion} onChange={handleChange} placeholder="Dirección del contacto de emergencia" />
                </div>

                <div className="form-group full">
                  <label>{editing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                  <div className="input-password-wrapper">
                    <input
                      id="adminFormPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder={editing ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button id="adminCancelBtn" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button id="adminSaveBtn" className="btn btn-primary" onClick={handleSave}>
                {editing ? 'Guardar Cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
