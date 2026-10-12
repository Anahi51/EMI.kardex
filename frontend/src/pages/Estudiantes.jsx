import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  GraduationCap, Phone, X, CheckCircle, ArrowLeft,
  User, BookOpen, FileText, Shield, Award, Fingerprint,
  FileCheck, Contact, Briefcase, Clock, Download,
  RefreshCw, Baby, Map, Heart, CheckCircle2, FileDown,
  Building2, Code, TrendingUp, Layers, FileSpreadsheet,
  FolderCheck, Sparkles, Check, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { estudiantesService, carrerasService } from '../services/api'
import { downloadSingleDocument, downloadCompleteDossier, downloadActaEntregaJefeCarrera } from '../services/docDownloadService'
import { getAllUploadedDocs, downloadUploadedDoc, getDocsForPerson, getPersonDocForSlot } from '../services/docUploadService'
import { updateDocsUserInfo } from '../services/profileSyncService'
import './Docentes.css'
import './Estudiantes.css'

const MOCK_ESTUDIANTES = [
  { id: 1, codigo: 'H559-8', nombre: 'jorge soto', carrera: 'Ingeniería de Sistemas', semestre_actual: '10mo', grado: 'CADETE', email: 'jorges@emi.edu.bo', promedio: 78.45, estado: 'ACTIVO', ci: '12345678' },
  { id: 2, codigo: 'H551-7', nombre: 'Anahi quispe rodriguez', carrera: 'Ingeniería de Sistemas', semestre_actual: '10mo', grado: 'CADETE', email: 'Yrojasg@eduemi.bo', promedio: 88.5, estado: 'ACTIVO', ci: '23456789' },
  { id: 3, codigo: 'H606-9', nombre: 'Erran Castelo Antezana', carrera: 'Ingeniería Civil', semestre_actual: '6to', grado: 'TENIENTE', email: 'EcasteloA@eduemi.bo', promedio: 81.2, estado: 'ACTIVO', ci: '34567890' },
  { id: 4, codigo: 'H602-5', nombre: 'Fuentes león jimena', carrera: 'Ingeniería Civil', semestre_actual: '10mo', grado: 'CADETE', email: 'Jfuentesl@eduemi.bo', promedio: 75.4, estado: 'ACTIVO', ci: '45678901' },
  { id: 5, codigo: 'H201-6', nombre: 'isaias albert lima', carrera: 'Ingeniería Civil', semestre_actual: '10mo', grado: 'CAPITAN', email: 'ilimaA@eduemi.bo', promedio: 90.0, estado: 'ACTIVO', ci: '56789012' },
  { id: 6, codigo: 'H552-2', nombre: 'jorge', carrera: 'Ingeniería Mecánica', semestre_actual: '9no', grado: 'CADETE', email: 'Yrojasg@eduemi.bo', promedio: 65.3, estado: 'ACTIVO', ci: '67890123' },
  { id: 7, codigo: 'H559-8', nombre: 'jorge soto', carrera: 'Ingeniería Mecánica', semestre_actual: '4to', grado: 'CAPITAN', email: 'jorges@emi.edu.bo', promedio: 72.0, estado: 'ACTIVO', ci: '78901234' },
  { id: 8, codigo: 'H123-1', nombre: 'Luis mario vicuña', carrera: 'Ingeniería Industrial', semestre_actual: '7mo', grado: 'CADETE', email: 'lmario@emi.edu.bo', promedio: 84.6, estado: 'ACTIVO', ci: '89012345' },
  { id: 9, codigo: 'H551-8', nombre: 'Yhadel aamin rojas quarcchi', carrera: 'Ingeniería de Sistemas', semestre_actual: '10mo', grado: 'CADETE', email: 'yrojas@emi.edu.bo', promedio: 91.0, estado: 'ACTIVO', ci: '90123456' },
]

const STUDENT_DOCUMENTS = [
  { id: 1, num: 1, title: 'Certificado de Nacimiento',       icon: Baby,        archivo: 'cert_nacimiento_anahi.pdf',  fecha: '15/02/2024 10:15' },
  { id: 2, num: 2, title: 'Foto 4x4 Fondo Azul',            icon: User,        archivo: 'foto_4x4_anahi.jpg',         fecha: '15/02/2024 10:16' },
  { id: 3, num: 3, title: 'Título de Bachiller Legalizado', icon: GraduationCap,archivo: 'titulo_bachiller_anahi.pdf', fecha: '15/02/2024 10:18' },
  { id: 4, num: 4, title: 'Fotocopia de Carnet del Tutor',  icon: Contact,     archivo: 'carnet_tutor_anahi.pdf',     fecha: '15/02/2024 10:20' },
  { id: 5, num: 5, title: 'Croquis del Domicilio',          icon: Map,         archivo: 'croquis_anahi.pdf',          fecha: '15/02/2024 10:21' },
  { id: 6, num: 6, title: 'Certificado Médico',             icon: Heart,       archivo: 'cert_medico_anahi.pdf',      fecha: '15/02/2024 10:22' },
  { id: 7, num: 7, title: 'REJAP',                          icon: FileCheck,   archivo: 'rejap_anahi.pdf',            fecha: '15/02/2024 10:23' },
]

const INITIAL_FORM = {
  codigo: '', ci: '', nombre: '', carrera: 'Ingeniería Civil', semestre_actual: '1ro',
  grado: 'ESTUDIANTE', turno: 'Mañana', email: '', telefono: '', direccion: '', fechaNacimiento: '',
  genero: 'Masculino', password: '', estado: 'ACTIVO',
  tutorAcademico: '', modalidadIngreso: 'Examen de Admisión',
  contactoEmergenciaNombre: '', contactoEmergenciaTelefono: '',
  contactoEmergenciaParentesco: '', contactoEmergenciaDireccion: '',
}

// Carreras Principales para división
const CARRERAS_DIVISIO_LIST = [
  { id: 'all', key: 'todas', label: 'Todas las Carreras', icon: GraduationCap, color: 'todas' },
  { id: 'civil', key: 'civil', name: 'Ingeniería Civil', label: 'Ingeniería Civil', icon: Building2, color: 'civil' },
  { id: 'comercial', key: 'comercial', name: 'Ingeniería Comercial', label: 'Ingeniería Comercial', icon: TrendingUp, color: 'comercial' },
  { id: 'sistemas', key: 'sistemas', name: 'Ingeniería de Sistemas', label: 'Ingeniería de Sistemas', icon: Code, color: 'sistemas' },
]

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState(() => {
    const saved = localStorage.getItem('emi_estudiantes')
    if (saved) {
      try { return JSON.parse(saved) } catch { return MOCK_ESTUDIANTES }
    }
    localStorage.setItem('emi_estudiantes', JSON.stringify(MOCK_ESTUDIANTES))
    return MOCK_ESTUDIANTES
  })

  const [selectedEstudiante, setSelectedEstudiante] = useState(null)
  const [detailTab, setDetailTab] = useState('general')
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCarreraKey, setActiveCarreraKey] = useState('all') // 'all' | 'civil' | 'comercial' | 'sistemas'
  const [filterCarrera, setFilterCarrera] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showJefeCarreraModal, setShowJefeCarreraModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewUploadedDoc, setPreviewUploadedDoc] = useState(null)
  const [, setDocVersion] = useState(0)

  useEffect(() => {
    const handleSync = () => {
      setDocVersion(v => v + 1)
      try {
        const saved = localStorage.getItem('emi_estudiantes')
        if (saved) {
          const parsed = JSON.parse(saved)
          setEstudiantes(parsed)
          if (selectedEstudiante) {
            const up = parsed.find(s => s.id === selectedEstudiante.id || s.codigo === selectedEstudiante.codigo || s.ci === selectedEstudiante.ci || (s.email && selectedEstudiante.email && s.email.toLowerCase() === selectedEstudiante.email.toLowerCase()))
            if (up) setSelectedEstudiante(up)
          }
        }
      } catch {}
    }
    window.addEventListener('emi_students_updated', handleSync)
    window.addEventListener('emi_docs_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('emi_students_updated', handleSync)
      window.removeEventListener('emi_docs_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [selectedEstudiante])

  useEffect(() => {
    const load = async () => {
      try {
        const [estResp, carrResp] = await Promise.all([
          estudiantesService.getAll(), carrerasService.getAll()
        ])
        const estData = estResp.data.results || estResp.data
        const carrData = carrResp.data.results || carrResp.data
        if (estData && estData.length > 0) {
          const saved = JSON.parse(localStorage.getItem('emi_estudiantes') || '[]')
          if (saved.length > 0) {
            const merged = estData.map((beItem) => {
              const localMatch = saved.find(
                (s) => (s.codigo && beItem.codigo && s.codigo.toLowerCase() === beItem.codigo.toLowerCase()) ||
                       (s.id && beItem.id && s.id === beItem.id) ||
                       (s.email && beItem.email && s.email.toLowerCase() === beItem.email.toLowerCase())
              )
              return localMatch ? { ...beItem, ...localMatch } : beItem
            })
            saved.forEach((s) => {
              if (!merged.some((m) => m.codigo === s.codigo || m.id === s.id)) {
                merged.push(s)
              }
            })
            setEstudiantes(merged)
            localStorage.setItem('emi_estudiantes', JSON.stringify(merged))
          } else {
            setEstudiantes(estData)
            localStorage.setItem('emi_estudiantes', JSON.stringify(estData))
          }
        }
        if (carrData && carrData.length > 0) {
          setCarreras(carrData)
        }
      } catch {
        // Offline fallback – use localStorage
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Sincronización en caliente cuando un estudiante edita sus datos
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('emi_estudiantes')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setEstudiantes(parsed)
          if (selectedEstudiante) {
            const up = parsed.find((e) => e.id === selectedEstudiante.id || e.codigo === selectedEstudiante.codigo)
            if (up) setSelectedEstudiante(up)
          }
        } catch {}
      }
    }
    window.addEventListener('emi_students_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('emi_students_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [selectedEstudiante])

  useEffect(() => {
    localStorage.setItem('emi_estudiantes', JSON.stringify(estudiantes))
  }, [estudiantes])

  // Normalizador de carrera
  const getCarreraKey = (carreraStr = '') => {
    const s = String(carreraStr).toLowerCase()
    if (s.includes('civil')) return 'civil'
    if (s.includes('comercial')) return 'comercial'
    if (s.includes('sistema')) return 'sistemas'
    return 'otras'
  }

  // Contadores por carrera
  const countCivil = estudiantes.filter(e => getCarreraKey(e.carrera_nombre || e.carrera) === 'civil').length
  const countComercial = estudiantes.filter(e => getCarreraKey(e.carrera_nombre || e.carrera) === 'comercial').length
  const countSistemas = estudiantes.filter(e => getCarreraKey(e.carrera_nombre || e.carrera) === 'sistemas').length
  const countTotal = estudiantes.length

  const getCarreraCount = (key) => {
    if (key === 'todas' || key === 'all') return countTotal
    if (key === 'civil') return countCivil
    if (key === 'comercial') return countComercial
    if (key === 'sistemas') return countSistemas
    return 0
  }

  // Filtrado
  const filtered = estudiantes.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.nombre?.toLowerCase().includes(q) ||
      e.codigo?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.ci?.toLowerCase().includes(q)

    const cKey = getCarreraKey(e.carrera_nombre || e.carrera)
    const matchCarreraTab = activeCarreraKey === 'all' || cKey === activeCarreraKey
    const matchSelect = !filterCarrera || String(e.carrera) === String(filterCarrera) || String(e.carrera_nombre) === String(filterCarrera)

    return matchSearch && matchCarreraTab && matchSelect
  })

  const openCreate = () => {
    const defaultCarrera = activeCarreraKey === 'civil'
      ? 'Ingeniería Civil'
      : activeCarreraKey === 'comercial'
      ? 'Ingeniería Comercial'
      : activeCarreraKey === 'sistemas'
      ? 'Ingeniería de Sistemas'
      : 'Ingeniería Civil'

    setEditing(null)
    setForm({ ...INITIAL_FORM, carrera: defaultCarrera })
    setShowPassword(false)
    setShowModal(true)
  }

  const openEdit = (est) => {
    setEditing(est)
    setForm({
      codigo: est.codigo || '',
      ci: est.ci || '',
      nombre: est.nombre || '',
      carrera: est.carrera_nombre || est.carrera || 'Ingeniería Civil',
      semestre_actual: est.semestre_actual || est.semestre || '1ro',
      grado: est.grado || 'ESTUDIANTE',
      turno: est.turno || 'Mañana',
      email: est.email || '',
      telefono: est.telefono || '',
      direccion: est.direccion || '',
      fechaNacimiento: est.fechaNacimiento || '',
      genero: est.genero || 'Masculino',
      tutorAcademico: est.tutorAcademico || '',
      modalidadIngreso: est.modalidadIngreso || 'Examen de Admisión',
      contactoEmergenciaNombre: est.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: est.contactoEmergenciaTelefono || '',
      contactoEmergenciaParentesco: est.contactoEmergenciaParentesco || '',
      contactoEmergenciaDireccion: est.contactoEmergenciaDireccion || '',
      password: est.password || '',
      estado: est.estado || 'ACTIVO'
    })
    setShowPassword(false)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nombre || !form.codigo || !form.carrera) {
      toast.error('Por favor complete los campos obligatorios.')
      return
    }

    if (/\d/.test(form.nombre)) {
      toast.error('El nombre completo solo debe contener letras, no se permiten números.')
      return
    }

    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
    if (!soloLetrasRegex.test(form.nombre.trim())) {
      toast.error('El nombre completo solo debe contener letras.')
      return
    }
    setSaving(true)

    const newEstudiante = {
      ...form,
      id: editing ? editing.id : Date.now(),
      ci: form.ci || editing?.ci || form.codigo,
      email: form.email || `${form.codigo.toLowerCase()}@emi.edu.bo`,
      password: form.password || (editing?.password || '123456'),
      promedio: editing ? editing.promedio : 0,
      turno: form.turno || 'Mañana',
      tutorAcademico: form.tutorAcademico || '',
      modalidadIngreso: form.modalidadIngreso || 'Examen de Admisión',
      contactoEmergenciaNombre: form.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: form.contactoEmergenciaTelefono || '',
      contactoEmergenciaParentesco: form.contactoEmergenciaParentesco || '',
      contactoEmergenciaDireccion: form.contactoEmergenciaDireccion || '',
    }

    try {
      if (editing) await estudiantesService.update(editing.id, form)
      else await estudiantesService.create(form)
    } catch {}

    let updatedList
    if (editing) {
      updatedList = estudiantes.map((e) => e.id === editing.id ? newEstudiante : e)
      if (selectedEstudiante?.id === editing.id) setSelectedEstudiante(newEstudiante)
    } else {
      updatedList = [newEstudiante, ...estudiantes]
    }

    setEstudiantes(updatedList)
    localStorage.setItem('emi_estudiantes', JSON.stringify(updatedList))
    if (!editing) {
      toast.success(`Estudiante registrado. Correo: "${newEstudiante.email}" · Contraseña: "${newEstudiante.password}"`)
    } else {
      toast.success('Estudiante actualizado correctamente.')
    }

    try {
      const existing = JSON.parse(localStorage.getItem('created_users') || '[]')
      const filtered2 = existing.filter(u => u.email !== newEstudiante.email && u.codigo !== newEstudiante.codigo && u.ci !== newEstudiante.ci)
      localStorage.setItem('created_users', JSON.stringify([...filtered2, {
        username: newEstudiante.email,
        email:    newEstudiante.email,
        codigo:   newEstudiante.codigo,
        ci:       newEstudiante.ci,
        name:     newEstudiante.nombre,
        password: newEstudiante.password,
        role:     'Estudiante',
        carrera:  newEstudiante.carrera,
        grado:    newEstudiante.grado,
        turno:    newEstudiante.turno,
        tutorAcademico: newEstudiante.tutorAcademico,
        modalidadIngreso: newEstudiante.modalidadIngreso,
        contactoEmergenciaNombre: newEstudiante.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: newEstudiante.contactoEmergenciaTelefono,
        contactoEmergenciaParentesco: newEstudiante.contactoEmergenciaParentesco,
        contactoEmergenciaDireccion: newEstudiante.contactoEmergenciaDireccion,
      }]))
    } catch {}

    // Sincronizar documentos previamente subidos con el nuevo nombre y CI
    updateDocsUserInfo([editing?.email, editing?.codigo, editing?.ci, newEstudiante.email, newEstudiante.codigo, newEstudiante.ci], newEstudiante)

    // Notificar en caliente a toda la ventana para actualizar el dashboard del estudiante
    window.dispatchEvent(new CustomEvent('emi_students_updated', { detail: newEstudiante }))
    window.dispatchEvent(new Event('storage'))

    // Si el usuario logueado en la sesión activa es este estudiante, actualizar su authStore
    try {
      const curUser = JSON.parse(localStorage.getItem('emi_user') || '{}')
      if (curUser && (curUser.codigo === newEstudiante.codigo || curUser.email === newEstudiante.email || curUser.ci === newEstudiante.ci)) {
        const updatedAuth = { ...curUser, ...newEstudiante, name: newEstudiante.nombre }
        localStorage.setItem('emi_user', JSON.stringify(updatedAuth))
      }
    } catch {}

    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Desea eliminar este estudiante?')) return
    const updated = estudiantes.filter((e) => e.id !== id)
    setEstudiantes(updated)
    localStorage.setItem('emi_estudiantes', JSON.stringify(updated))
    toast.success('Estudiante eliminado.')
    if (selectedEstudiante?.id === id) setSelectedEstudiante(null)
  }

  /* ================================================================ */
  /* STUDENT PROFILE DETAIL VIEW (ADMIN ROLE)                          */
  /* ================================================================ */
  if (selectedEstudiante) {
    const est = selectedEstudiante
    return (
      <div className="fade-in">
        {/* Back link */}
        <button className="btn-back-link mb-4" onClick={() => setSelectedEstudiante(null)}>
          <ArrowLeft size={16} /> Volver a Estudiantes
        </button>

        {/* Header Card */}
        <div className="doc-detail-header-card mb-4">
          {/* Avatar */}
          <div className="doc-detail-avatar" style={{ background: 'linear-gradient(135deg, #1a3a6b, #0f2044)' }}>
            <User size={44} />
          </div>

          {/* Main Info */}
          <div className="doc-detail-main-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="doc-detail-name">{est.nombre}</h2>
              <span className={`badge ${est.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                {est.estado}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue">Código: {est.codigo}</span>
            </div>
            <div className="doc-detail-title-sub">
              Estudiante de {est.carrera_nombre || est.carrera}
            </div>
            <div className="doc-detail-univ">Escuela Militar de Ingeniería</div>
          </div>

          {/* Right: Actions + Meta box */}
          <div className="doc-detail-header-right">
            <div className="flex gap-2 mb-3">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(est)}>
                <Edit2 size={14} /> Editar Estudiante
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(est.id)}>
                <Trash2 size={14} /> Eliminar
              </button>
            </div>

            <div className="doc-detail-meta-box">
              <div className="doc-meta-item">
                <span className="doc-meta-label">📅 Fecha de Registro</span>
                <span className="doc-meta-val font-mono">15/02/2024</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🕒 Último Acceso</span>
                <span className="doc-meta-val font-mono">20/05/2024 14:30</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🛡️ Estado</span>
                <span className="doc-meta-val text-chain font-bold">Activo</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🔗 Blockchain ID</span>
                <span className="doc-meta-val font-mono" style={{ fontSize: 10 }}>0x3a7b...9f2c1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="kardex-tabs-bar mb-4">
          {['general', 'academica', 'documentacion', 'historial', 'certificados'].map((tab) => (
            <button
              key={tab}
              className={`kardex-tab-btn ${detailTab === tab ? 'active' : ''}`}
              onClick={() => setDetailTab(tab)}
            >
              {tab === 'general' && 'Información General'}
              {tab === 'academica' && 'Información Académica'}
              {tab === 'documentacion' && 'Documentación'}
              {tab === 'historial' && 'Historial'}
              {tab === 'certificados' && 'Certificados'}
            </button>
          ))}
        </div>

        {/* TAB: Información General */}
        {detailTab === 'general' && (
          <div className="fade-in flex flex-col gap-4">
            <div className="grid-2">
              {/* Card: Información Personal */}
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <User size={16} className="text-gold" />
                  <h3>Información Personal</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => openEdit(est)}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carnet de Identidad</span>
                    <span className="doc-info-value">{est.ci ? `${est.ci} LP` : (est.codigo ? `${est.codigo} LP` : '—')}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Nacimiento</span>
                    <span className="doc-info-value">{est.fechaNacimiento || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Lugar de Nacimiento</span>
                    <span className="doc-info-value">La Paz, Bolivia</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Nacionalidad</span>
                    <span className="doc-info-value">Boliviana</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Género</span>
                    <span className="doc-info-value">{est.genero || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Teléfono</span>
                    <span className="doc-info-value">{est.telefono || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Correo Electrónico</span>
                    <span className="doc-info-value">{est.email || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Dirección</span>
                    <span className="doc-info-value">{est.direccion || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Grupo Sanguíneo</span>
                    <span className="doc-info-value">O+</span>
                  </div>
                </div>
              </div>

              {/* Card: Información Académica */}
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <GraduationCap size={16} className="text-gold" />
                  <h3>Información Académica</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => openEdit(est)}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carrera</span>
                    <span className="doc-info-value">{est.carrera_nombre || est.carrera}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Semestre Actual</span>
                    <span className="doc-info-value">{est.semestre_actual || est.semestre}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Ingreso</span>
                    <span className="doc-info-value">2021</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado Académico</span>
                    <span className="doc-info-value text-chain font-bold">Regular</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Promedio General</span>
                    <span className={`doc-info-value font-bold ${est.promedio >= 70 ? 'text-chain' : est.promedio >= 51 ? 'text-gold' : 'text-danger'}`}>
                      {Number(est.promedio || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Créditos Aprobados</span>
                    <span className="doc-info-value">120</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Turno</span>
                    <span className="doc-info-value">{est.turno || 'Mañana'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Tutor Académico</span>
                    <span className="doc-info-value">{est.tutorAcademico || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Modalidad de Ingreso</span>
                    <span className="doc-info-value">{est.modalidadIngreso || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Contacto de Emergencia */}
            <div className="doc-info-card">
              <div className="doc-info-card-header">
                <Phone size={16} className="text-gold" />
                <h3>Información de Contacto de Emergencia</h3>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => openEdit(est)}
                >
                  <Edit2 size={12} /> Editar
                </button>
              </div>
              <div className="doc-info-grid grid-2-col">
                <div className="doc-info-pair">
                  <span className="doc-info-label">Nombre del Contacto</span>
                  <span className="doc-info-value">{est.contactoEmergenciaNombre || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Teléfono de Emergencia</span>
                  <span className="doc-info-value">{est.contactoEmergenciaTelefono || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Parentesco</span>
                  <span className="doc-info-value">{est.contactoEmergenciaParentesco || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Dirección del Contacto</span>
                  <span className="doc-info-value">{est.contactoEmergenciaDireccion || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Documentación */}
        {detailTab === 'documentacion' && (
          <div className="fade-in">
            {/* Section header */}
            <div className="est-docs-section-header">
              <div>
                <h3 className="est-docs-section-title">Documentos del Estudiante</h3>
                <p className="est-docs-section-sub">
                  Expediente digital verificado en Blockchain. Puedes previsualizar o descargar los documentos individuales o el legajo completo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const ok = downloadCompleteDossier(est, STUDENT_DOCUMENTS, 'Estudiante')
                    if (ok) toast.success(`Expediente completo de ${est.nombre} descargado correctamente.`)
                    else toast.error('Error al generar el expediente.')
                  }}
                >
                  <FileDown size={14} />
                  Descargar Expediente Completo (PDF)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => toast.success('Documentos actualizados y sincronizados con Blockchain.')}
                >
                  <RefreshCw size={13} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Documents Table */}
            <div className="est-docs-table-wrapper">
              <table className="est-docs-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Documento</th>
                    <th>Archivo</th>
                    <th>Fecha de Subida</th>
                    <th>Estado</th>
                    <th style={{ width: 120 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDENT_DOCUMENTS.map((doc) => {
                    const IconComp = doc.icon
                    const realDoc = getPersonDocForSlot(est, doc)
                    const isUploaded = Boolean(realDoc)
                    const isImage = realDoc?.fileType?.startsWith('image/')
                    return (
                      <tr key={doc.id} style={isUploaded ? { background: 'rgba(34, 197, 94, 0.05)' } : undefined}>
                        <td className="est-docs-num-cell">{doc.num}</td>
                        <td>
                          <div className="est-docs-doc-cell">
                            <div className="est-docs-doc-icon" style={isUploaded ? { background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e' } : undefined}>
                              <IconComp size={15} />
                            </div>
                            <div>
                              <span className="est-docs-doc-name">{doc.title}</span>
                              {isUploaded && (
                                <span style={{
                                  display: 'inline-block',
                                  marginLeft: 8,
                                  fontSize: 10,
                                  padding: '1px 7px',
                                  borderRadius: 10,
                                  background: isImage ? 'rgba(251, 191, 36, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                  color: isImage ? '#fbbf24' : '#818cf8',
                                  fontWeight: 700
                                }}>
                                  {isImage ? '🖼 Imagen subida' : '📄 Archivo subido'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {isUploaded ? (
                            <span className="est-docs-filename font-mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                              {realDoc.fileName}
                            </span>
                          ) : (
                            <span className="est-docs-filename font-mono" style={{ opacity: 0.6 }}>
                              {doc.archivo}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="est-docs-date">
                            {isUploaded ? realDoc.uploadedAt : doc.fecha}
                          </span>
                        </td>
                        <td>
                          {isUploaded ? (
                            <span className="est-docs-verified-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                              <CheckCircle2 size={11} />
                              Subido por estudiante
                            </span>
                          ) : (
                            <span className="est-docs-verified-badge">
                              <CheckCircle2 size={11} />
                              Verificado
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="est-docs-actions">
                            <button
                              type="button"
                              className="est-docs-action-btn"
                              title={isUploaded ? (isImage ? 'Ver imagen subida por estudiante' : 'Ver documento subido') : 'Ver documento'}
                              onClick={() => {
                                if (isUploaded) {
                                  setPreviewUploadedDoc(realDoc)
                                } else {
                                  setPreviewDoc(doc)
                                }
                              }}
                            >
                              <Eye size={14} style={isUploaded ? { color: '#38bdf8' } : undefined} />
                            </button>
                            <button
                              type="button"
                              className="est-docs-action-btn download-btn"
                              title={isUploaded ? 'Descargar archivo original' : 'Descargar documento (PDF)'}
                              onClick={() => {
                                if (isUploaded) {
                                  downloadUploadedDoc(realDoc)
                                  toast.success(`Descargando: ${realDoc.fileName}`)
                                } else {
                                  const ok = downloadSingleDocument(doc, est, 'Estudiante')
                                  if (ok) toast.success(`Descargando: ${doc.title}`)
                                  else toast.error('Error al generar el documento.')
                                }
                              }}
                            >
                              <Download size={14} style={isUploaded ? { color: '#22c55e' } : undefined} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar */}
            <div className="est-docs-footer-bar">
              <div className="est-docs-footer-msg">
                <CheckCircle2 size={15} className="text-chain" />
                <span>Todos los 7 documentos reglamentarios han sido verificados y registrados en Blockchain.</span>
              </div>
              <div className="est-docs-footer-count">
                <span>{STUDENT_DOCUMENTS.length} de {STUDENT_DOCUMENTS.length} Documentos</span>
                <div className="est-docs-count-check"><CheckCircle2 size={14} /></div>
              </div>
            </div>

            {previewDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gold" />
                      <h4>Vista Previa del Documento</h4>
                    </div>
                    <button
                      type="button"
                      className="doc-modal-close"
                      onClick={() => setPreviewDoc(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="doc-modal-body">
                    <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-sm font-bold text-white mb-1">{previewDoc.title}</div>
                      <div className="text-xs text-muted font-mono mb-2">{previewDoc.archivo}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted block">Titular:</span>
                          <strong className="text-white">{est.nombre}</strong>
                        </div>
                        <div>
                          <span className="text-muted block">Código:</span>
                          <strong className="text-gold">{est.codigo}</strong>
                        </div>
                        <div>
                          <span className="text-muted block">Fecha de Carga:</span>
                          <span className="text-secondary">{previewDoc.fecha}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Estado:</span>
                          <span className="text-chain font-bold">✓ Verificado en Blockchain</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted">
                      Este documento cuenta con firma digital y hash SHA-256 inmutable registrado en el libro mayor de la Escuela Militar de Ingeniería.
                    </p>
                  </div>
                  <div className="doc-modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setPreviewDoc(null)}
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        downloadSingleDocument(previewDoc, est, 'Estudiante')
                        toast.success(`Descargando ${previewDoc.title}...`)
                      }}
                    >
                      <Download size={14} />
                      Descargar Documento Oficial
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Archivos Reales Subidos por el Estudiante ── */}
            {(() => {
              const uploadedDocs = getDocsForPerson(est)
              if (uploadedDocs.length === 0) {
                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '24px 20px', textAlign: 'center' }}>
                      <FileText size={32} style={{ margin: '0 auto 10px', opacity: 0.3, color: 'var(--text-muted)' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                        Este estudiante aún no ha subido archivos desde el módulo Kardex.
                      </p>
                    </div>
                  </div>
                )
              }
              return (
                <div style={{ marginTop: 28 }}>
                  <div className="est-docs-section-header" style={{ marginBottom: 14 }}>
                    <div>
                      <h3 className="est-docs-section-title" style={{ fontSize: 15 }}>
                        📤 Archivos subidos por el estudiante
                        <span style={{
                          marginLeft: 10, fontSize: 11, background: '#22c55e22', color: '#22c55e',
                          padding: '2px 10px', borderRadius: 20, fontWeight: 700
                        }}>{uploadedDocs.length} archivo(s)</span>
                      </h3>
                      <p className="est-docs-section-sub">Documentos e imágenes reales cargados por el estudiante. Puedes previsualizarlos y descargarlos.</p>
                    </div>
                  </div>
                  <div className="est-docs-table-wrapper">
                    <table className="est-docs-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>Tipo</th>
                          <th>Documento</th>
                          <th>Archivo</th>
                          <th>Fecha de Subida</th>
                          <th style={{ width: 120 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedDocs.map((rec, idx) => (
                          <tr key={rec.id}>
                            <td className="est-docs-num-cell">{idx + 1}</td>
                            <td>
                              <span style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 12,
                                background: rec.fileType?.startsWith('image/') ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)',
                                color: rec.fileType?.startsWith('image/') ? '#fbbf24' : '#818cf8'
                              }}>
                                {rec.fileType?.startsWith('image/') ? '🖼 Imagen' : '📄 Documento'}
                              </span>
                            </td>
                            <td>
                              <div className="est-docs-doc-cell">
                                <div className="est-docs-doc-icon"><FileText size={15} /></div>
                                <span className="est-docs-doc-name">{rec.docTitle}</span>
                              </div>
                            </td>
                            <td><span className="est-docs-filename font-mono">{rec.fileName}</span></td>
                            <td><span className="est-docs-date">{rec.uploadedAt}</span></td>
                            <td>
                              <div className="est-docs-actions">
                                <button
                                  type="button"
                                  className="est-docs-action-btn"
                                  title="Vista previa"
                                  onClick={() => setPreviewUploadedDoc(rec)}
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="est-docs-action-btn download-btn"
                                  title="Descargar archivo original"
                                  onClick={() => {
                                    const ok = downloadUploadedDoc(rec)
                                    if (ok) toast.success(`Descargando: ${rec.fileName}`)
                                    else toast.error('Error al descargar el archivo.')
                                  }}
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })()}

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
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Estudiante:</span>
                          <strong style={{ fontSize: 14 }}>{previewUploadedDoc.userName}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Código:</span>
                          <strong className="font-mono" style={{ fontSize: 13 }}>{previewUploadedDoc.userCodigo}</strong>
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
                            style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
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
          </div>
        )}

        {/* TAB: Historial */}
        {detailTab === 'historial' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Historial Académico en Blockchain</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Gestión</th>
                    <th>Materia</th>
                    <th>Nota</th>
                    <th>Estado</th>
                    <th>Hash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1/2024</td>
                    <td>Sistemas Operativos</td>
                    <td><span className="text-chain font-bold">85</span></td>
                    <td><span className="badge badge-success">APROBADO</span></td>
                    <td><span className="font-mono" style={{ fontSize: 10 }}>0xa3f4e2...</span></td>
                  </tr>
                  <tr>
                    <td>2/2023</td>
                    <td>Estructuras de Datos</td>
                    <td><span className="text-gold font-bold">72</span></td>
                    <td><span className="badge badge-success">APROBADO</span></td>
                    <td><span className="font-mono" style={{ fontSize: 10 }}>0xb7c9d1...</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Certificados */}
        {detailTab === 'certificados' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Certificados Emitidos</h4>
            <div className="flex gap-3">
              <span className="badge badge-gold">Certificado de Notas - 1/2024</span>
              <span className="badge badge-blue">Historial Académico - 2023</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ================================================================ */
  /* STUDENTS LIST TABLE VIEW (DEFAULT)                                 */
  /* ================================================================ */
  const activeCarreraObj = CARRERAS_DIVISIO_LIST.find(c => c.key === activeCarreraKey) || CARRERAS_DIVISIO_LIST[0]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Estudiantes</h1>
          <p className="page-subtitle">{filtered.length} estudiantes registrados (almacenamiento inmutable)</p>
        </div>
        <button id="newEstudianteBtn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo Estudiante
        </button>
      </div>

      {/* ── MÓDULOS DE DIVISIÓN POR CARRERA (Civil, Comercial, Sistemas, Todas) ── */}
      <div className="carreras-nav-grid">
        {CARRERAS_DIVISIO_LIST.map((c) => {
          const IconComponent = c.icon
          const isActive = activeCarreraKey === c.key
          const count = getCarreraCount(c.key)

          return (
            <button
              key={c.key}
              type="button"
              id={`tab-carrera-${c.key}`}
              className={`carrera-card-btn ${c.color} ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveCarreraKey(c.key)
                setFilterCarrera('')
              }}
            >
              <div className={`carrera-icon-box ${c.color}`}>
                <IconComponent size={22} />
              </div>
              <div className="carrera-info">
                <div className="carrera-title">{c.label}</div>
                <div className="carrera-count-label">
                  <span className="carrera-badge-count">{count}</span>
                  <span>estudiantes</span>
                </div>
              </div>
              {isActive && (
                <div style={{ color: 'var(--color-gold-400)', display: 'flex', alignItems: 'center' }}>
                  <Check size={16} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={14} />
          <input
            id="searchEstudiante"
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="filterCarreraSelect"
          className="form-input form-select"
          style={{ width: 'auto', minWidth: 200 }}
          value={filterCarrera}
          onChange={(e) => setFilterCarrera(e.target.value)}
        >
          <option value="">Todas las carreras</option>
          {carreras.length > 0 ? (
            carreras.map((c) => (<option key={c.id} value={c.nombre || c.id}>{c.nombre}</option>))
          ) : (
            <>
              <option value="Ingeniería Civil">Ingeniería Civil</option>
              <option value="Ingeniería Comercial">Ingeniería Comercial</option>
              <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
            </>
          )}
        </select>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-gold" />
            <span className="table-title">
              Listado de Estudiantes {activeCarreraKey !== 'all' ? `— ${activeCarreraObj.label}` : ''}
            </span>
            <span className="badge badge-muted">{filtered.length}</span>
          </div>

          {/* Botón Entrega de Jefe de Carrera */}
          <button
            id="btnEntregaJefeCarrera"
            type="button"
            className="btn-jefe-carrera"
            onClick={() => setShowJefeCarreraModal(true)}
          >
            <Award size={15} />
            Entrega de Jefe de Carrera
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>NOMBRE COMPLETO</th>
                <th>CARRERA</th>
                <th>SEMESTRE</th>
                <th>GRADO</th>
                <th>PROMEDIO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="loader-spin" style={{ margin: 'auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🎓</div>
                    <div className="empty-state-title">Sin resultados</div>
                    <div className="empty-state-desc">
                      {activeCarreraKey !== 'all'
                        ? `No hay estudiantes registrados en ${activeCarreraObj.label}`
                        : 'No se encontraron estudiantes registrados'}
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((est) => (
                <tr key={est.id}>
                  <td><span className="font-mono text-gold font-bold" style={{ fontSize: 12 }}>{est.codigo}</span></td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => { setSelectedEstudiante(est); setDetailTab('general') }}
                      title="Ver perfil del estudiante"
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c9a227, #eab308)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#060d18', flexShrink: 0
                      }}>
                        {est.nombre ? est.nombre.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{est.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{est.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#cbd5e1' }}>{est.carrera_nombre || est.carrera}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-muted font-mono" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {est.semestre_actual || est.semestre || '1ro'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#0284c7', color: '#ffffff', fontWeight: 600 }}>
                      {est.grado || 'ESTUDIANTE'}
                    </span>
                  </td>
                  <td>
                    <span className={`font-bold ${est.promedio >= 70 ? 'text-chain' : est.promedio >= 51 ? 'text-gold' : 'text-danger'}`}>
                      {Number(est.promedio || 0).toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${est.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                      {est.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => { setSelectedEstudiante(est); setDetailTab('general') }}
                        title="Ver Perfil"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => {
                          const ok = downloadCompleteDossier(est, STUDENT_DOCUMENTS, 'Estudiante')
                          if (ok) toast.success(`Descargando expediente completo de ${est.nombre}`)
                          else toast.error('Error al descargar expediente')
                        }}
                        title="Descargar Expediente Completo (PDF)"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => openEdit(est)}
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleDelete(est.id)}
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

      {/* Modal - Entrega de Jefe de Carrera */}
      {showJefeCarreraModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowJefeCarreraModal(false)}>
          <div className="modal fade-in" style={{ maxWidth: 580 }}>
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div className="flex items-center gap-2">
                <Award size={20} className="text-gold" />
                <span className="modal-title font-display" style={{ fontSize: 16 }}>
                  Entrega de Jefe de Carrera
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-icon btn-sm"
                onClick={() => setShowJefeCarreraModal(false)}
                style={{ borderRadius: '50%', width: 28, height: 28, padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div className="p-3 mb-4" style={{ background: 'rgba(201,162,39,0.08)', borderRadius: 10, border: '1px solid rgba(201,162,39,0.2)' }}>
                <div className="flex items-center gap-2 text-gold font-bold text-sm mb-1">
                  <Shield size={16} /> Acta de Traspaso y Entrega Académica
                </div>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  Generación del acta oficial de traspaso y consolidación del padrón estudiantil validado con firma criptográfica en la Blockchain de la EMI.
                </p>
              </div>

              <div className="grid-2 mb-4">
                <div>
                  <label className="form-label" style={{ fontSize: 11, color: '#94a3b8' }}>CARRERA SELECCIONADA</label>
                  <div className="font-bold text-white text-sm mt-1">
                    {activeCarreraKey === 'all' ? 'Todas las Carreras' : activeCarreraObj.label}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11, color: '#94a3b8' }}>ESTUDIANTES EN PADRÓN</label>
                  <div className="font-bold text-chain text-sm mt-1">
                    {filtered.length} Registros Inmutables
                  </div>
                </div>
              </div>

              <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-muted mb-1">Hash del Bloque de Entrega:</div>
                <div className="font-mono text-xs text-gold" style={{ wordBreak: 'break-all' }}>
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>

              <p className="text-xs text-muted">
                Al confirmar la entrega, se emitirá el expediente digital firmado para la Dirección Académica y Decanato.
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowJefeCarreraModal(false)}
                style={{ padding: '8px 20px', borderRadius: 8 }}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const targetCarrera = activeCarreraKey === 'all' ? 'Consolidado General de Carreras' : activeCarreraObj.label
                  const ok = downloadActaEntregaJefeCarrera(targetCarrera, filtered, {
                    gestion: '1/2024',
                    codigoActa: `ACTA-EJC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                  })
                  if (ok) {
                    toast.success(`Acta de Entrega (${targetCarrera}) descargada en PDF y registrada en Blockchain.`)
                    setShowJefeCarreraModal(false)
                  } else {
                    toast.error('Error al generar el documento PDF del acta.')
                  }
                }}
                style={{ padding: '8px 24px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Download size={15} /> Descargar Acta en PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Nuevo / Editar Estudiante */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal fade-in" style={{ maxWidth: 640 }}>
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div className="flex items-center gap-2">
                <Plus size={18} style={{ color: '#a855f7' }} />
                <span className="modal-title font-display" style={{ fontSize: 15 }}>
                  {editing ? 'Editar Información del Estudiante' : 'Nuevo Estudiante'}
                </span>
              </div>
              <button className="btn btn-outline btn-icon btn-sm" onClick={() => setShowModal(false)} style={{ borderRadius: '50%', width: 28, height: 28, padding: 0 }}>
                <X size={14} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px', maxHeight: '76vh', overflowY: 'auto' }}>
              {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <User size={15} className="text-gold" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Información Personal
                </span>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>NOMBRE COMPLETO *</label>
                  <input
                    id="formNombre"
                    className="form-input"
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onKeyDown={(e) => {
                      if (/^[0-9]$/.test(e.key)) {
                        e.preventDefault()
                        toast.error('Solo se permiten letras en el nombre.', { id: 'solo-letras-nombre' })
                      }
                    }}
                    onChange={(e) => {
                      const rawVal = e.target.value
                      const sanitized = rawVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
                      if (rawVal !== sanitized && /[0-9]/.test(rawVal)) {
                        toast.error('No se permiten números en el nombre.', { id: 'solo-letras-nombre' })
                      }
                      setForm({ ...form, nombre: sanitized })
                    }}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>CARNET DE IDENTIDAD (C.I.)</label>
                  <input id="formCI" className="form-input font-mono" placeholder="12345678" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                </div>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>GÉNERO</label>
                  <select id="formGenero" className="form-input form-select" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>FECHA DE NACIMIENTO</label>
                  <input id="formFechaNacimiento" className="form-input" placeholder="DD/MM/AAAA" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                </div>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>TELÉFONO / CELULAR</label>
                  <input id="formTelefono" className="form-input" placeholder="+591 7XXXXXXX" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>EMAIL INSTITUCIONAL</label>
                  <input id="formEmail" className="form-input" placeholder="nombre@emi.edu.bo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>DIRECCIÓN DE DOMICILIO</label>
                <input id="formDireccion" className="form-input" placeholder="Av. Arce Nº..." value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                  {editing ? 'NUEVA CONTRASEÑA (DEJAR EN BLANCO PARA MANTENER ACTUAL)' : 'CREAR CONTRASEÑA'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="formEstudiantePassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2: INFORMACIÓN ACADÉMICA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <GraduationCap size={15} className="text-gold" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Información Académica
                </span>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>CÓDIGO EMI *</label>
                  <input id="formCodigo" className="form-input font-mono" placeholder="H559-8" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>GRADO MILITAR / NIVEL</label>
                  <select id="formGrado" className="form-input form-select" value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="SUBTENIENTE">Subteniente</option>
                    <option value="TENIENTE">Teniente</option>
                    <option value="CAPITAN">Capitán</option>
                    <option value="MAYOR">Mayor</option>
                  </select>
                </div>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>CARRERA *</label>
                  <select id="formCarrera" className="form-input form-select" value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })}>
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                    <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>SEMESTRE</label>
                  <select id="formSemestre" className="form-input form-select" value={form.semestre_actual} onChange={(e) => setForm({ ...form, semestre_actual: e.target.value })}>
                    <option value="">—</option>
                    {['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'].map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>TURNO</label>
                  <select id="formTurno" className="form-input form-select" value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>ESTADO</label>
                  <select id="formEstado" className="form-input form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="BAJA">BAJA</option>
                    <option value="EGRESADO">EGRESADO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                  </select>
                </div>
              </div>

              <div className="grid-2 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>TUTOR ACADÉMICO</label>
                  <input id="formTutor" className="form-input" placeholder="Ej. Ing. Roberto Vargas" value={form.tutorAcademico} onChange={(e) => setForm({ ...form, tutorAcademico: e.target.value })} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>MODALIDAD DE INGRESO</label>
                  <input id="formModalidad" className="form-input" placeholder="Ej. Examen de Admisión" value={form.modalidadIngreso} onChange={(e) => setForm({ ...form, modalidadIngreso: e.target.value })} />
                </div>
              </div>

              {/* SECCIÓN 3: INFORMACIÓN DE CONTACTO DE EMERGENCIA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Phone size={15} className="text-gold" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Contacto de Emergencia
                </span>
              </div>

              <div className="grid-2 mb-3">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>NOMBRE DEL CONTACTO</label>
                  <input
                    id="formContactoEmergenciaNombre"
                    className="form-input"
                    placeholder="Ej. María Mamani Quispe"
                    value={form.contactoEmergenciaNombre}
                    onChange={(e) => setForm({ ...form, contactoEmergenciaNombre: e.target.value })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>TELÉFONO DE EMERGENCIA</label>
                  <input
                    id="formContactoEmergenciaTelefono"
                    className="form-input"
                    placeholder="Ej. +591 76543210"
                    value={form.contactoEmergenciaTelefono}
                    onChange={(e) => setForm({ ...form, contactoEmergenciaTelefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2 mb-2">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>PARENTESCO / RELACIÓN</label>
                  <input
                    id="formContactoEmergenciaParentesco"
                    className="form-input"
                    placeholder="Ej. Madre, Padre, Tutor"
                    value={form.contactoEmergenciaParentesco}
                    onChange={(e) => setForm({ ...form, contactoEmergenciaParentesco: e.target.value })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>DIRECCIÓN DEL CONTACTO</label>
                  <input
                    id="formContactoEmergenciaDireccion"
                    className="form-input"
                    placeholder="Ej. Av. Costanera Nº 123"
                    value={form.contactoEmergenciaDireccion}
                    onChange={(e) => setForm({ ...form, contactoEmergenciaDireccion: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', borderRadius: 8 }}>Cancelar</button>
              <button
                id="saveEstudianteBtn"
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.nombre || !form.codigo || !form.carrera}
                style={{ padding: '8px 24px', borderRadius: 8 }}
              >
                {saving ? <div className="loader-spin" /> : null}
                {editing ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
