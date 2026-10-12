import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, Search, Filter, ChevronDown, ChevronUp,
  Shield, CheckCircle, XCircle, Download, Eye, Hash,
  FileText, Calendar, Lock, UploadCloud, GraduationCap,
  Award, Clock, Briefcase, Contact, Fingerprint, FileCheck,
  Check, AlertCircle, Send, Info, Upload, Trash2, Sparkles, Plus,
  Smile, User, Map, Heart, Share2, HelpCircle, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { calificacionesService, estudiantesService } from '../services/api'
import useAuthStore from '../store/authStore'
import {
  uploadDoc,
  getUserUploadedDocs,
  deleteUploadedDoc,
  downloadUploadedDoc,
} from '../services/docUploadService'
import './Kardex.css'

// Document checklist for ADMINISTRATIVO (8 documents matching exact screenshot UI)
const ADMINISTRATIVO_DOCUMENTS = [
  { id: 1, num: 1, title: 'Documento de Identidad', subtitle: '(Carnet de Identidad)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Contact, colorClass: 'doc-icon-blue' },
  { id: 2, num: 2, title: 'REJAP', subtitle: '(Registro Judicial de Antecedentes Penales)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileCheck, colorClass: 'doc-icon-green' },
  { id: 3, num: 3, title: 'Certificado de No Violencia', subtitle: '', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Shield, colorClass: 'doc-icon-purple' },
  { id: 4, num: 4, title: 'NIT', subtitle: '(Número de Identificación Tributaria)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileText, colorClass: 'doc-icon-cyan', isNIT: true },
  { id: 5, num: 5, title: 'SIGEP', subtitle: '(Sistema de Gestión Pública)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Fingerprint, colorClass: 'doc-icon-orange' },
  { id: 6, num: 6, title: 'Registro Ciudadanía Digital', subtitle: '', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Contact, colorClass: 'doc-icon-blue' },
  { id: 7, num: 7, title: 'Croquis', subtitle: '(Ubicación Domicilio)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Map, colorClass: 'doc-icon-lime' },
  { id: 8, num: 8, title: 'Certificación POA', subtitle: '(Plan Operativo Anual)', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileText, colorClass: 'doc-icon-magenta' },
]

// Document checklist for DOCENTE (10 documents)
const DOCENTE_DOCUMENTS = [
  { id: 1, num: 1, title: 'Título de Provisión Nacional', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: GraduationCap, colorClass: 'doc-icon-blue' },
  { id: 2, num: 2, title: 'Título Académico', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: GraduationCap, colorClass: 'doc-icon-green' },
  { id: 3, num: 3, title: 'Diplomado', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Award, colorClass: 'doc-icon-purple' },
  { id: 4, num: 4, title: 'Cursos mayores a 400 horas', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Clock, colorClass: 'doc-icon-yellow' },
  { id: 5, num: 5, title: 'Experiencia Laboral', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Briefcase, colorClass: 'doc-icon-teal' },
  { id: 6, num: 6, title: 'Certificado de Disciplina', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Shield, colorClass: 'doc-icon-red' },
  { id: 7, num: 7, title: 'Fotocopia de Carnet', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Contact, colorClass: 'doc-icon-blue' },
  { id: 8, num: 8, title: 'NIT', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileText, colorClass: 'doc-icon-green' },
  { id: 9, num: 9, title: 'SEGIP', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Fingerprint, colorClass: 'doc-icon-purple' },
  { id: 10, num: 10, title: 'REJAP', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileCheck, colorClass: 'doc-icon-orange' },
]

// Document checklist for ESTUDIANTE (7 documents matching exact reference UI)
const STUDENT_DOCUMENTS = [
  { id: 1, num: 1, title: 'Certificado de Nacimiento', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Smile, colorClass: 'doc-icon-blue' },
  { id: 2, num: 2, title: 'Foto 4x4 Fondo Azul', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: User, colorClass: 'doc-icon-blue' },
  { id: 3, num: 3, title: 'Título de Bachiller Legalizado', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: GraduationCap, colorClass: 'doc-icon-green' },
  { id: 4, num: 4, title: 'Fotocopia de Carnet del Tutor', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Contact, colorClass: 'doc-icon-purple' },
  { id: 5, num: 5, title: 'Croquis', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: BookOpen, colorClass: 'doc-icon-orange' },
  { id: 6, num: 6, title: 'Certificado Médico', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: Heart, colorClass: 'doc-icon-red' },
  { id: 7, num: 7, title: 'REJAP', format: 'PDF, JPG o PNG', maxSize: 'Máx. 10MB', icon: FileCheck, colorClass: 'doc-icon-teal' },
]

// Mock kardex data
const MOCK_ESTUDIANTE = {
  id: 'EMI-2024-001',
  nombre: 'Anahí Quispe Rodríguez',
  codigo: 'EMI-2024-001',
  carrera: 'Ingeniería de Sistemas',
  semestre: '5to Semestre',
  gestion: '1/2024',
  promedio_general: 72.8,
  materias_aprobadas: 18,
  materias_reprobadas: 2,
  creditos_totales: 132,
  creditos_obtenidos: 118,
  estado: 'ACTIVO',
}

const MOCK_KARDEX = [
  {
    gestion: '1/2024',
    materias: [
      { id: 1, codigo: 'SIS-501', nombre: 'Sistemas Operativos', creditos: 4, parcial1: 72, parcial2: 75, examen: 78, final: 75, estado: 'APROBADO', docente: 'Dr. Vargas R.', hash: 'a3f4e2b1c9d7' },
      { id: 2, codigo: 'SIS-502', nombre: 'Redes de Computadoras', creditos: 4, parcial1: 68, parcial2: 65, examen: 70, final: 68, estado: 'APROBADO', docente: 'Ing. Reyes L.', hash: 'b7c9d1e5f3a2' },
      { id: 3, codigo: 'MAT-501', nombre: 'Estadística y Probabilidad', creditos: 3, parcial1: 55, parcial2: 60, examen: 58, final: 58, estado: 'APROBADO', docente: 'Dr. Flores M.', hash: 'c2a8f3b4e1d6' },
      { id: 4, codigo: 'SIS-503', nombre: 'Ingeniería de Software', creditos: 5, parcial1: 80, parcial2: 82, examen: 85, final: 82, estado: 'APROBADO', docente: 'Ing. García P.', hash: 'd1e5b2c8a9f4' },
      { id: 5, codigo: 'HUM-501', nombre: 'Ética Profesional', creditos: 2, parcial1: 45, parcial2: 48, examen: 50, final: 47, estado: 'REPROBADO', docente: 'Lic. López A.', hash: 'e9f3a1b5c2d8' },
    ],
    promedio: 72.0,
  },
  {
    gestion: '2/2023',
    materias: [
      { id: 6, codigo: 'SIS-401', nombre: 'Base de Datos Avanzados', creditos: 4, parcial1: 78, parcial2: 80, examen: 82, final: 80, estado: 'APROBADO', docente: 'Dr. Vargas R.', hash: 'f5b2c9a3d7e1' },
      { id: 7, codigo: 'SIS-402', nombre: 'Programación Web', creditos: 4, parcial1: 85, parcial2: 88, examen: 90, final: 88, estado: 'APROBADO', docente: 'Ing. Reyes L.', hash: 'a1c4e8f2b6d3' },
      { id: 8, codigo: 'MAT-401', nombre: 'Cálculo Numérico', creditos: 3, parcial1: 60, parcial2: 65, examen: 62, final: 62, estado: 'APROBADO', docente: 'Dr. Flores M.', hash: 'b3d7f1c5a9e2' },
      { id: 9, codigo: 'SIS-403', nombre: 'Inteligencia Artificial', creditos: 5, parcial1: 75, parcial2: 78, examen: 80, final: 78, estado: 'APROBADO', docente: 'Dr. Quispe H.', hash: 'c6a2e9f4b1d8' },
    ],
    promedio: 77.0,
  },
]

const NotaBadge = ({ nota }) => {
  if (nota === null || nota === undefined) return <span className="text-muted">—</span>
  const cls = nota >= 51 ? 'nota-aprobado' : 'nota-reprobado'
  return <span className={`nota-badge ${cls}`}>{nota}</span>
}

export default function Kardex() {
  const user = useAuthStore((s) => s.user)
  const userRoleStr = String(user?.role || '').trim().toLowerCase()
  const isUserAdminis = userRoleStr.includes('adminis')

  // Clave única del usuario para persistencia
  const userKey = (user?.email || user?.username || user?.codigo || 'guest').toLowerCase()
  const userName = user?.name || user?.username || 'Usuario'
  const userRole = user?.role || 'Estudiante'
  const userCodigo = user?.codigo || '—'

  // Current view role toggle (defaulting to Administrativo if user is Administrativo)
  const [viewRole, setViewRole] = useState(() => {
    if (isUserAdminis) return 'Administrativo'
    if (user?.role === 'Docente') return 'Docente'
    return 'Estudiante'
  })
  
  // Tabs: 'subir' (Subir Documentos), 'consulta' (Consulta de Kardex), 'generar' (Generar Kardex)
  const [activeTab, setActiveTab] = useState('subir')
  const [estudiante, setEstudiante] = useState(null)
  const [kardex, setKardex] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedGestion, setExpandedGestion] = useState('1/2024')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Document uploads map: { [docId]: { fileName, uploadedAt, record } }
  const [uploadedFiles, setUploadedFiles] = useState({})
  // Missing docs marked: { [docId]: { reason: string, markedAt: string } }
  const [missingDocs, setMissingDocs] = useState({})
  // Optional files list: [{ id: number, name: string, size: string }]
  const [optionalFiles, setOptionalFiles] = useState([])
  // Missing doc modal state
  const [activeMissingDoc, setActiveMissingDoc] = useState(null)
  const [missingReason, setMissingReason] = useState('En trámite')
  // Uploading state per docId
  const [uploadingIds, setUploadingIds] = useState({})
  // Modal de vista previa de documento subido
  const [previewUploadedDoc, setPreviewUploadedDoc] = useState(null)

  const isAdministrativo = viewRole === 'Administrativo' || isUserAdminis
  const isStudent = viewRole === 'Estudiante'
  const currentDocList = isAdministrativo
    ? ADMINISTRATIVO_DOCUMENTS
    : (isStudent ? STUDENT_DOCUMENTS : DOCENTE_DOCUMENTS)

  // ── Cargar documentos persistidos al montar ──────────────────────
  useEffect(() => {
    const persisted = getUserUploadedDocs(userKey)
    if (persisted.length > 0) {
      const map = {}
      persisted.forEach((rec) => {
        map[rec.docId] = {
          fileName: rec.fileName,
          uploadedAt: rec.uploadedAt,
          record: rec,
        }
      })
      setUploadedFiles(map)
    }
  }, [userKey])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await calificacionesService.getMiKardex()
        setEstudiante(data.estudiante)
        setKardex(data.kardex)
      } catch {
        setEstudiante(MOCK_ESTUDIANTE)
        setKardex(MOCK_KARDEX)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filterMaterias = (materias) => {
    if (!searchQuery) return materias
    return materias.filter((m) =>
      m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.codigo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleFileUpload = async (docId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido por archivo es de 10MB.')
      return
    }

    const docObj = currentDocList.find((d) => d.id === docId)
    setUploadingIds((prev) => ({ ...prev, [docId]: true }))
    try {
      const record = await uploadDoc(file, docId, docObj?.title || 'Documento', {
        key: userKey,
        name: userName,
        role: userRole,
        codigo: userCodigo,
        email: user?.email || '',
        ci: user?.ci || '',
      })

      setUploadedFiles((prev) => ({
        ...prev,
        [docId]: {
          fileName: file.name,
          uploadedAt: record.uploadedAt,
          record,
        },
      }))

      // If it was marked as missing, remove the missing flag
      if (missingDocs[docId]) {
        setMissingDocs((prev) => {
          const copy = { ...prev }
          delete copy[docId]
          return copy
        })
      }

      toast.success(`Documento "${docObj?.title}" guardado y enviado al administrador.`)
    } catch (err) {
      toast.error('Error al guardar el documento. Intenta de nuevo.')
    } finally {
      setUploadingIds((prev) => { const c = { ...prev }; delete c[docId]; return c })
    }
  }

  const handleRemoveFile = (docId) => {
    deleteUploadedDoc(userKey, docId)
    setUploadedFiles((prev) => {
      const copy = { ...prev }
      delete copy[docId]
      return copy
    })
    toast.success('Documento removido.')
  }

  const handleDownloadUploadedFile = (docId) => {
    const fileInfo = uploadedFiles[docId]
    if (fileInfo?.record) {
      const ok = downloadUploadedDoc(fileInfo.record)
      if (ok) toast.success(`Descargando: ${fileInfo.fileName}`)
      else toast.error('No se pudo descargar el archivo.')
    }
  }

  const handlePreviewUploadedFile = (docId) => {
    const fileInfo = uploadedFiles[docId]
    if (fileInfo?.record) {
      setPreviewUploadedDoc(fileInfo.record)
    }
  }

  const handleOpenMissingModal = (doc) => {
    setActiveMissingDoc(doc)
    setMissingReason('En trámite')
  }

  const handleConfirmMissing = () => {
    if (!activeMissingDoc) return
    setMissingDocs((prev) => ({
      ...prev,
      [activeMissingDoc.id]: {
        reason: missingReason,
        markedAt: new Date().toLocaleDateString(),
      },
    }))
    toast(`Has marcado "${activeMissingDoc.title}" como no disponible (${missingReason}).`, {
      icon: 'ℹ️',
      duration: 3500,
    })
    setActiveMissingDoc(null)
  }

  const handleRemoveMissing = (docId) => {
    setMissingDocs((prev) => {
      const copy = { ...prev }
      delete copy[docId]
      return copy
    })
    toast.success('Estado restablecido. Puedes subir el archivo.')
  }

  const handleOptionalFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newDocs = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      file: f,
    }))

    setOptionalFiles((prev) => [...prev, ...newDocs])
    toast.success(`${files.length} documento(s) opcional(es) agregado(s).`)
  }

  const handleRemoveOptionalFile = (fileId) => {
    setOptionalFiles((prev) => prev.filter((f) => f.id !== fileId))
    toast.success('Documento opcional eliminado.')
  }

  const handleEnviarVerificacion = () => {
    const uploadedCount = Object.keys(uploadedFiles).length
    if (uploadedCount === 0) {
      toast.error('Por favor carga al menos un documento antes de enviar.')
      return
    }
    if (uploadedCount < currentDocList.length) {
      toast((t) => (
        <span>
          Has subido <b>{uploadedCount} de {currentDocList.length}</b> documentos. Se han enviado los disponibles para revisión.
        </span>
      ), { icon: '⚠️' })
    } else {
      toast.success(`¡Todos los ${currentDocList.length} documentos fueron enviados exitosamente para verificación en Blockchain!`, {
        duration: 4000
      })
    }
  }

  const uploadedCount = Object.keys(uploadedFiles).length
  const progressPercent = Math.round((uploadedCount / currentDocList.length) * 100)

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spin" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <span>Cargando Kardex...</span>
      </div>
    )
  }

  return (
    <div className="kardex-module-container fade-in">
      {/* ------------------------------------ */}
      {/* PAGE HEADER (Docente / Estudiante)   */}
      {/* ------------------------------------ */}
      {!isAdministrativo && (
        <div className="kardex-page-header flex justify-between items-center">
          <div>
            <h1 className="kardex-title font-display">
              {isStudent ? 'Kardex Digital' : 'Kardex'}
            </h1>
            {!isStudent && (
              <p className="kardex-subtitle">Gestiona y consulta el historial académico de los estudiantes.</p>
            )}
          </div>

          {/* Role Preview Switcher Badge */}
          <div className="role-switch-badge">
            <span className="role-switch-label">Modo Vista:</span>
            <button
              type="button"
              className={`btn-role-toggle ${isStudent ? 'active' : ''}`}
              onClick={() => setViewRole('Estudiante')}
            >
              Estudiante
            </button>
            <button
              type="button"
              className={`btn-role-toggle ${viewRole === 'Docente' ? 'active' : ''}`}
              onClick={() => setViewRole('Docente')}
            >
              Docente
            </button>
            <button
              type="button"
              className={`btn-role-toggle ${isAdministrativo ? 'active' : ''}`}
              onClick={() => setViewRole('Administrativo')}
            >
              Administrativo
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------ */}
      {/* TOP KPI STATS CARDS (Docente only)   */}
      {/* ------------------------------------ */}
      {!isStudent && !isAdministrativo && (
        <div className="kardex-kpi-grid">
          {/* KPI 1: Estudiantes */}
          <div className="kardex-kpi-card">
            <div className="kardex-kpi-icon-circle blue">
              <BookOpen size={20} />
            </div>
            <div className="kardex-kpi-content">
              <div className="kardex-kpi-value">125</div>
              <div className="kardex-kpi-label">Estudiantes</div>
              <div className="kardex-kpi-sub">Activos en el sistema</div>
            </div>
          </div>

          {/* KPI 2: Registros */}
          <div className="kardex-kpi-card">
            <div className="kardex-kpi-icon-circle green">
              <FileText size={20} />
            </div>
            <div className="kardex-kpi-content">
              <div className="kardex-kpi-value">3,250</div>
              <div className="kardex-kpi-label">Registros</div>
              <div className="kardex-kpi-sub">Historiales académicos</div>
            </div>
          </div>

          {/* KPI 3: Verificados */}
          <div className="kardex-kpi-card">
            <div className="kardex-kpi-icon-circle purple">
              <Shield size={20} />
            </div>
            <div className="kardex-kpi-content">
              <div className="kardex-kpi-value">100%</div>
              <div className="kardex-kpi-label">Verificados</div>
              <div className="kardex-kpi-sub">En blockchain</div>
            </div>
          </div>

          {/* KPI 4: Período Actual */}
          <div className="kardex-kpi-card">
            <div className="kardex-kpi-icon-circle orange">
              <Calendar size={20} />
            </div>
            <div className="kardex-kpi-content">
              <div className="kardex-kpi-value">2024-2</div>
              <div className="kardex-kpi-label">Período Actual</div>
              <div className="kardex-kpi-sub">Segundo Semestre</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------ */}
      {/* TABS NAVIGATION BAR                  */}
      {/* ------------------------------------ */}
      {!isAdministrativo && (
        <div className="kardex-tabs-bar">
          <button
            id="tabConsultaKardex"
            className={`kardex-tab-btn ${activeTab === 'consulta' ? 'active' : ''}`}
            onClick={() => setActiveTab('consulta')}
          >
            <Lock size={15} />
            <span>Consulta de Kardex</span>
          </button>

          <button
            id="tabGenerarKardex"
            className={`kardex-tab-btn ${activeTab === 'generar' ? 'active' : ''}`}
            onClick={() => setActiveTab('generar')}
          >
            <Share2 size={15} />
            <span>Generar Kardex</span>
          </button>

          <button
            id="tabSubirDocumentos"
            className={`kardex-tab-btn ${activeTab === 'subir' ? 'active' : ''}`}
            onClick={() => setActiveTab('subir')}
          >
            <UploadCloud size={16} />
            <span>Subir Documentos</span>
          </button>
        </div>
      )}

      {/* ------------------------------------ */}
      {/* TAB CONTENT 1: SUBIR DOCUMENTOS       */}
      {/* ------------------------------------ */}
      {(activeTab === 'subir' || isAdministrativo) && (
        <div className="kardex-tab-content fade-in">
          {/* Section Subheader - Exacto a la imagen de referencia */}
          <div className="doc-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div className="doc-header-icon-box">
                <FileText size={24} className="text-cyan" />
              </div>
              <h2 className="doc-section-title font-display" style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>
                Subir Documentos para el Kardex
              </h2>
            </div>
            <p className="doc-section-subtitle" style={{ fontSize: 13, color: '#94a3b8', margin: 0, paddingLeft: 34 }}>
              Carga los documentos requeridos para la verificación y actualización del kardex académico.
            </p>
          </div>

          {/* Main Grid + Sidebar Container */}
          <div className="doc-upload-main-layout">
            {/* Grid of Cards (8 for Administrativo, 7 for Estudiante, 10 for Docente) */}
            <div className={`doc-cards-grid ${isAdministrativo ? 'adminis-grid' : (isStudent ? 'student-grid' : 'docente-grid')}`}>
              {currentDocList.map((doc) => {
                const IconComponent = doc.icon
                const isUploaded = !!uploadedFiles[doc.id]
                const fileInfo = uploadedFiles[doc.id]
                const isMissing = !!missingDocs[doc.id]
                const missingInfo = missingDocs[doc.id]

                return (
                  <div key={doc.id} className={`doc-card ${isUploaded ? 'uploaded' : ''} ${isMissing ? 'missing' : ''}`}>
                    {/* Top left number badge */}
                    <div className="doc-badge-num">{doc.num}</div>

                    {/* Colored circle icon */}
                    <div className={`doc-icon-wrapper ${doc.colorClass}`}>
                      {doc.isNIT ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={22} />
                          <span style={{ fontSize: 9, fontWeight: 900, marginTop: -4, letterSpacing: -0.5 }}>NIT</span>
                        </div>
                      ) : (
                        <IconComponent size={24} />
                      )}
                    </div>

                    {/* Document title */}
                    <div className="doc-card-title">{doc.title}</div>
                    {doc.subtitle ? (
                      <div className="doc-card-subtitle">{doc.subtitle}</div>
                    ) : (
                      <div className="doc-card-subtitle-empty" />
                    )}

                    {/* Formats & max size */}
                    <div className="doc-card-format">{doc.format}</div>
                    <div className="doc-card-size">{doc.maxSize}</div>

                    {/* Upload action button / File state */}
                    {isUploaded ? (
                      <div className="doc-uploaded-status">
                        <div className="doc-file-name" title={fileInfo.fileName}>
                          <Check size={12} className="text-chain" />
                          <span>{fileInfo.fileName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            className="doc-remove-btn"
                            onClick={() => handlePreviewUploadedFile(doc.id)}
                            title="Vista previa del archivo"
                            style={{ color: '#fbbf24' }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="doc-remove-btn"
                            onClick={() => handleDownloadUploadedFile(doc.id)}
                            title="Descargar archivo subido"
                            style={{ color: 'var(--color-chain)' }}
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            className="doc-remove-btn"
                            onClick={() => handleRemoveFile(doc.id)}
                            title="Eliminar archivo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : isMissing ? (
                      <div className="doc-missing-status">
                        <div className="doc-missing-label" title={`Motivo: ${missingInfo.reason}`}>
                          <Info size={12} />
                          <span>{missingInfo.reason}</span>
                        </div>
                        <button
                          type="button"
                          className="doc-remove-btn"
                          onClick={() => handleRemoveMissing(doc.id)}
                          title="Restablecer documento"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : uploadingIds[doc.id] ? (
                      <div className="doc-uploaded-status">
                        <div className="doc-file-name">
                          <div className="loader-spin" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          <span style={{ fontSize: 11 }}>Guardando...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="doc-actions-stack">
                        <label className="doc-upload-btn doc-upload-btn-solid">
                          <Upload size={14} />
                          <span>Subir Documento</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(doc.id, e)}
                            className="hidden-file-input"
                          />
                        </label>
                        <button
                          type="button"
                          className="doc-missing-link"
                          onClick={() => handleOpenMissingModal(doc)}
                        >
                          <Info size={13} />
                          <span>No tengo este archivo</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Right Side Info Panels (3 Panels) */}
            <div className="doc-sidebar-panels">
              {/* Panel 1: Indicaciones */}
              <div className="doc-sidebar-card">
                <div className="doc-sidebar-header">
                  <Info size={18} className="text-blue" />
                  <h3>Indicaciones</h3>
                </div>
                <ul className="doc-checklist">
                  <li>
                    <Check size={14} className="text-chain flex-shrink-0" />
                    <span>Todos los documentos son obligatorios.</span>
                  </li>
                  <li>
                    <Check size={14} className="text-chain flex-shrink-0" />
                    <span>Los archivos deben estar en formato PDF, JPG o PNG.</span>
                  </li>
                  <li>
                    <Check size={14} className="text-chain flex-shrink-0" />
                    <span>El tamaño máximo por archivo es de 10MB.</span>
                  </li>
                  <li>
                    <Check size={14} className="text-chain flex-shrink-0" />
                    <span>
                      {isStudent
                        ? 'Asegúrate que los documentos sean legibles y estén completos.'
                        : 'Asegúrate que los documentos sean legibles y estén actualizados.'}
                    </span>
                  </li>
                  <li>
                    <Check size={14} className="text-chain flex-shrink-0" />
                    <span>
                      {isStudent
                        ? 'Los documentos serán verificados por nuestro equipo y registrados en el kardex académico.'
                        : 'Los documentos serán verificados por nuestro equipo y registrados en blockchain.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Panel 2: Estado de Subida */}
              <div className="doc-sidebar-card">
                <div className="doc-sidebar-header">
                  <FileText size={18} className="text-blue" />
                  <h3>Estado de Subida</h3>
                </div>

                <div className="doc-status-body">
                  <div className="doc-status-label-row">
                    <span className="doc-status-label">Documentos subidos</span>
                    <span className="doc-status-count">{uploadedCount} de {currentDocList.length} documentos</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="doc-progress-row">
                    <div className="doc-progress-track">
                      <div className="doc-progress-bar" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="doc-progress-text">{progressPercent}%</span>
                  </div>

                  {/* Banner Message */}
                  <div className={`doc-status-alert ${uploadedCount === currentDocList.length ? 'complete' : 'pending'}`}>
                    {uploadedCount === currentDocList.length ? (
                      <>
                        <CheckCircle size={15} className="text-chain" />
                        <span>¡Todos los documentos han sido subidos!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={15} className="text-danger" />
                        <span>Faltan documentos por subir</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel 3: Otros Documentos (Opcional) */}
              <div className="doc-sidebar-card">
                <div className="doc-sidebar-header">
                  <FileText size={18} className="text-blue" />
                  <h3>Otros Documentos (Opcional)</h3>
                </div>
                <p className="doc-optional-desc">
                  Puedes adjuntar documentos adicionales si es necesario.
                </p>
                <label className="doc-upload-optional-btn doc-upload-optional-btn-dark">
                  <Upload size={14} />
                  <span>Subir Documento Opcional</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleOptionalFileUpload}
                    className="hidden-file-input"
                  />
                </label>

                {optionalFiles.length > 0 && (
                  <div className="doc-optional-list">
                    {optionalFiles.map((file) => (
                      <div key={file.id} className="doc-optional-item">
                        <div className="doc-file-name" title={file.name}>
                          <Check size={12} className="text-chain" />
                          <span>{file.name}</span>
                        </div>
                        <button
                          type="button"
                          className="doc-remove-btn"
                          onClick={() => handleRemoveOptionalFile(file.id)}
                          title="Eliminar archivo opcional"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar: para Docente/Estudiante o Institutional Footer para Administrativo */}
          {!isAdministrativo ? (
            <div className="doc-bottom-bar">
              <div className="doc-bottom-info">
                <Info size={16} className="text-blue flex-shrink-0" />
                <span>
                  Una vez subidos, los documentos serán verificados por nuestro equipo y, de estar correctos, se actualizarán en tu kardex académico. El plazo es de hasta 48 horas.
                </span>
              </div>
              {!isStudent && (
                <button
                  id="submitVerificationBtn"
                  type="button"
                  className="btn-send-verification"
                  onClick={handleEnviarVerificacion}
                >
                  <Send size={15} />
                  <span>Enviar para Verificación</span>
                </button>
              )}
            </div>
          ) : (
            <div className="kardex-institutional-footer">
              <div className="kardex-motto-row">
                <div className="kardex-motto-line left" />
                <div className="kardex-motto-text">
                  Disciplina &nbsp;·&nbsp; Ciencia &nbsp;·&nbsp; Tecnología &nbsp;·&nbsp; Servicio a la Patria
                </div>
                <div className="kardex-motto-line right" />
              </div>

              {/* Silueta vectorial del frontis histórico de la EMI */}
              <div className="kardex-emi-facade">
                <svg viewBox="0 0 340 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M130 36 L170 14 L210 36 Z" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                  <line x1="130" y1="36" x2="210" y2="36" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                  <rect x="125" y="36" width="90" height="5" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />
                  <line x1="138" y1="41" x2="138" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="150" y1="41" x2="150" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="162" y1="41" x2="162" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="178" y1="41" x2="178" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="190" y1="41" x2="190" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="202" y1="41" x2="202" y2="80" stroke="#38bdf8" strokeWidth="1.1" opacity="0.35" />
                  <line x1="120" y1="80" x2="220" y2="80" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                  <line x1="115" y1="83" x2="225" y2="83" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                  <rect x="40" y="40" width="85" height="40" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
                  <rect x="52" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <rect x="74" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <rect x="96" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <rect x="215" y="40" width="85" height="40" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
                  <rect x="227" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <rect x="249" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <rect x="271" y="48" width="12" height="15" stroke="#38bdf8" strokeWidth="0.8" opacity="0.25" />
                  <line x1="25" y1="86" x2="315" y2="86" stroke="#38bdf8" strokeWidth="1.2" opacity="0.3" />
                </svg>
              </div>
            </div>
          )}

          {/* Modal / Dialog for 'No tengo este archivo' */}
          {activeMissingDoc && (
            <div className="doc-modal-overlay" onClick={() => setActiveMissingDoc(null)}>
              <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="doc-modal-header">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-gold" />
                    <h4>Reportar Documento No Disponible</h4>
                  </div>
                  <button
                    type="button"
                    className="doc-modal-close"
                    onClick={() => setActiveMissingDoc(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="doc-modal-body">
                  <p className="text-sm mb-3">
                    Estás notificando que no cuentas temporalmente con el documento: <strong>{activeMissingDoc.title}</strong>
                  </p>
                  <label className="block text-xs text-muted mb-1">Indica el motivo o estado actual:</label>
                  <select
                    className="form-input mb-3"
                    value={missingReason}
                    onChange={(e) => setMissingReason(e.target.value)}
                  >
                    <option value="En trámite">En trámite</option>
                    <option value="Extraviado / En reposición">Extraviado / En reposición</option>
                    <option value="Pendiente de legalización">Pendiente de legalización</option>
                    <option value="No aplica por excepción">No aplica por excepción</option>
                    <option value="Otro motivo">Otro motivo justificado</option>
                  </select>
                </div>
                <div className="doc-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveMissingDoc(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleConfirmMissing}
                  >
                    Confirmar Notificación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------ */}
      {/* TAB CONTENT 2: CONSULTA DE KARDEX     */}
      {/* ------------------------------------ */}
      {activeTab === 'consulta' && (
        <div className="kardex-tab-content fade-in">
          {/* Student Info Card */}
          {estudiante && (
            <div className="kardex-student-card mb-4">
              <div className="kardex-student-avatar">
                {(estudiante.nombre || 'E').charAt(0)}
              </div>
              <div className="kardex-student-info">
                <div className="kardex-student-name">{estudiante.nombre}</div>
                <div className="kardex-student-meta">
                  <span className="badge badge-gold">{estudiante.codigo}</span>
                  <span className="text-secondary">·</span>
                  <span>{estudiante.carrera}</span>
                  <span className="text-secondary">·</span>
                  <span>{estudiante.semestre}</span>
                </div>
              </div>
              <div className="kardex-stats-row">
                <div className="kardex-stat">
                  <span className="kardex-stat-value text-gold">{estudiante.promedio_general?.toFixed(1)}</span>
                  <span className="kardex-stat-label">Promedio Gral.</span>
                </div>
                <div className="kardex-stat">
                  <span className="kardex-stat-value text-chain">{estudiante.materias_aprobadas}</span>
                  <span className="kardex-stat-label">Aprobadas</span>
                </div>
                <div className="kardex-stat">
                  <span className="kardex-stat-value text-danger">{estudiante.materias_reprobadas}</span>
                  <span className="kardex-stat-label">Reprobadas</span>
                </div>
                <div className="kardex-stat">
                  <span className="kardex-stat-value">{estudiante.creditos_obtenidos}/{estudiante.creditos_totales}</span>
                  <span className="kardex-stat-label">Créditos</span>
                </div>
                <div className="kardex-stat">
                  <span className={`badge ${estudiante.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                    {estudiante.estado}
                  </span>
                  <span className="kardex-stat-label">Estado</span>
                </div>
              </div>
              <div className="kardex-blockchain-verify">
                <Shield size={12} className="text-chain" />
                <span>Registros verificados en Blockchain</span>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={14} />
              <input
                id="kardexSearchInput"
                type="text"
                className="search-input"
                placeholder="Buscar materia o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Gestiones Accordion */}
          {kardex.map((gestion) => (
            <div key={gestion.gestion} className="kardex-gestion-block mb-4">
              <div
                className="kardex-gestion-header"
                onClick={() => setExpandedGestion(expandedGestion === gestion.gestion ? null : gestion.gestion)}
                id={`gestion-${gestion.gestion.replace('/', '-')}`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={16} className="text-gold" />
                  <span className="kardex-gestion-title">Gestión {gestion.gestion}</span>
                  <span className="badge badge-muted">{gestion.materias.length} materias</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="kardex-gestion-promedio">
                    Promedio: <strong className="text-gold">{gestion.promedio.toFixed(1)}</strong>
                  </div>
                  {expandedGestion === gestion.gestion
                    ? <ChevronUp size={16} className="text-muted" />
                    : <ChevronDown size={16} className="text-muted" />}
                </div>
              </div>

              {expandedGestion === gestion.gestion && (
                <div className="kardex-table-wrapper fade-in">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Materia</th>
                          <th>Créditos</th>
                          <th>P1</th>
                          <th>P2</th>
                          <th>Examen</th>
                          <th>Final</th>
                          <th>Estado</th>
                          <th>Docente</th>
                          <th>Hash Blockchain</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterMaterias(gestion.materias).map((m) => (
                          <tr key={m.id}>
                            <td>
                              <span className="font-mono text-gold" style={{ fontSize: 11 }}>{m.codigo}</span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{m.nombre}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{m.creditos}</td>
                            <td style={{ textAlign: 'center' }}><NotaBadge nota={m.parcial1} /></td>
                            <td style={{ textAlign: 'center' }}><NotaBadge nota={m.parcial2} /></td>
                            <td style={{ textAlign: 'center' }}><NotaBadge nota={m.examen} /></td>
                            <td style={{ textAlign: 'center' }}><NotaBadge nota={m.final} /></td>
                            <td>
                              <span className={`badge ${m.estado === 'APROBADO' ? 'badge-success' : 'badge-danger'}`}>
                                {m.estado === 'APROBADO' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                {m.estado}
                              </span>
                            </td>
                            <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.docente}</td>
                            <td>
                              <div className="hash-verify valid" title={`Hash completo: ${m.hash}`}>
                                <Hash size={10} />
                                <span className="hash-text">{m.hash}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="kardex-gestion-summary">
                    <div className="kardex-summary-item">
                      <span className="text-muted">Materias aprobadas:</span>
                      <span className="text-chain font-bold">
                        {gestion.materias.filter(m => m.estado === 'APROBADO').length}
                      </span>
                    </div>
                    <div className="kardex-summary-item">
                      <span className="text-muted">Materias reprobadas:</span>
                      <span className="text-danger font-bold">
                        {gestion.materias.filter(m => m.estado === 'REPROBADO').length}
                      </span>
                    </div>
                    <div className="kardex-summary-item">
                      <span className="text-muted">Promedio gestión:</span>
                      <span className="text-primary font-bold">{gestion.promedio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------ */}
      {/* TAB CONTENT 3: GENERAR KARDEX        */}
      {/* ------------------------------------ */}
      {activeTab === 'generar' && (
        <div className="kardex-tab-content fade-in">
          <div className="card p-6 text-center" style={{ maxWidth: 600, margin: '40px auto' }}>
            <Sparkles size={36} className="text-gold mb-3 mx-auto" />
            <h3 className="font-display text-lg font-bold mb-2">Generar Documento Oficial Kardex</h3>
            <p className="text-secondary mb-4 text-sm">
              Genera un reporte en PDF del historial académico del estudiante con firma digital y hash registrado en Blockchain.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => toast.success('Generando PDF del Kardex con firma digital...')}
              >
                <Download size={15} /> Exportar Kardex PDF
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => toast.success('Verificación de registro en Blockchain ejecutada')}
              >
                <Shield size={15} /> Verificar en Blockchain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vista previa archivo subido */}
      {previewUploadedDoc && (
        <div className="doc-modal-overlay" onClick={() => setPreviewUploadedDoc(null)}>
          <div className="doc-modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                <h4>Vista Previa — {previewUploadedDoc.docTitle}</h4>
              </div>
              <button type="button" className="doc-modal-close" onClick={() => setPreviewUploadedDoc(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="doc-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Archivo:</span>
                  <span className="font-mono">{previewUploadedDoc.fileName}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Fecha de subida:</span>
                  <strong className="text-gold">{previewUploadedDoc.uploadedAt}</strong>
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
                <div style={{ marginTop: 8 }}>
                  <iframe
                    src={previewUploadedDoc.fileData}
                    style={{ width: '100%', height: '420px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                    title={previewUploadedDoc.docTitle}
                  />
                </div>
              )}
            </div>
            <div className="doc-modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewUploadedDoc(null)}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  downloadUploadedDoc(previewUploadedDoc)
                  toast.success(`Descargando: ${previewUploadedDoc.fileName}`)
                }}
              >
                <Download size={14} /> Descargar Archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
