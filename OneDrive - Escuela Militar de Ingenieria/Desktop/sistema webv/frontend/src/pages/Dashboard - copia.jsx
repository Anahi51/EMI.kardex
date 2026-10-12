import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, BookOpen, Link2,
  TrendingUp, CheckCircle, AlertCircle, Activity,
  Award, BarChart3, Clock, Calendar, User, Phone, Edit2,
  Trash2, Shield, Download, RefreshCw, FileText,
  Baby, Map, Heart, FileCheck, Contact, CheckCircle2,
  FileDown, X, Eye, Briefcase, Fingerprint, BookMarked, LayoutGrid,
  UploadCloud, InboxIcon, Filter
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { reportesService } from '../services/api'
import { downloadSingleDocument, downloadCompleteDossier } from '../services/docDownloadService'
import {
  getUserUploadedDocs,
  getAllUploadedDocs,
  downloadUploadedDoc,
} from '../services/docUploadService'
import {
  getStudentProfile,
  syncUpdateStudentProfile,
  getDocenteProfile,
  syncUpdateDocenteProfile,
  getAdministrativoProfile,
  syncUpdateAdministrativoProfile,
} from '../services/profileSyncService'
import JefeCarrera from './JefeCarrera'
import './Dashboard.css'
import './Docentes.css'
import './Kardex.css'

// Mock data matching the official theme & reference screenshot
const MOCK_RENDIMIENTO = [
  { mes: 'Feb', general: 72, carrera: 62 },
  { mes: 'Mar', general: 79, carrera: 70 },
  { mes: 'Abr', general: 88, carrera: 76 },
  { mes: 'May', general: 75, carrera: 65 },
  { mes: 'Jun', general: 89, carrera: 78 },
  { mes: 'Jul', general: 92, carrera: 83 },
]

const MOCK_CARRERAS = [
  { name: 'Sistemas', value: 620, color: '#0047ba' },
  { name: 'Comercial', value: 340, color: '#ffb800' },
  { name: 'Civil', value: 220, color: '#38bdf8' },
]

const MOCK_BLOCKS = [
  { time: '08:00', blocks: 4 },
  { time: '10:00', blocks: 6 },
  { time: '12:00', blocks: 7 },
  { time: '14:00', blocks: 11 },
  { time: '16:00', blocks: 14 },
  { time: '18:00', blocks: 16 },
]

const RECENT_ACTIVITY = [
  { id: 1, action: 'Calificación registrada', student: 'Cáte. Mamani J.', materia: 'Cálculo I', nota: 78, hash: 'a3f4e2...', time: 'Hace 5 min', ok: true },
  { id: 2, action: 'Bloque minado', student: 'Sistema', materia: '—', nota: null, hash: 'b7c9d1...', time: 'Hace 12 min', ok: true },
  { id: 3, action: 'Certificado emitido', student: 'Tnte. García R.', materia: 'Historial Completo', nota: null, hash: 'c2a8f3...', time: 'Hace 28 min', ok: true },
  { id: 4, action: 'Calificación registrada', student: 'Sgto. López M.', materia: 'Física II', nota: 55, hash: 'd1e5b2...', time: 'Hace 1 hora', ok: false },
  { id: 5, action: 'Verificación de hash', student: 'Admin Sistema', materia: '—', nota: null, hash: 'e9f3a1...', time: 'Hace 2 horas', ok: true },
]

const STUDENT_DOCUMENTS = [
  { id: 1, num: 1, title: 'Certificado de Nacimiento',       icon: Baby,        archivo: 'cert_nacimiento_yhadel.pdf',  fecha: '15/02/2024 10:15' },
  { id: 2, num: 2, title: 'Foto 4x4 Fondo Azul',            icon: User,        archivo: 'foto_4x4_yhadel.jpg',         fecha: '15/02/2024 10:16' },
  { id: 3, num: 3, title: 'Título de Bachiller Legalizado', icon: GraduationCap,archivo: 'titulo_bachiller_yhadel.pdf', fecha: '15/02/2024 10:18' },
  { id: 4, num: 4, title: 'Fotocopia de Carnet del Tutor',  icon: Contact,     archivo: 'carnet_tutor_yhadel.pdf',     fecha: '15/02/2024 10:20' },
  { id: 5, num: 5, title: 'Croquis del Domicilio',          icon: Map,         archivo: 'croquis_yhadel.pdf',          fecha: '15/02/2024 10:21' },
  { id: 6, num: 6, title: 'Certificado Médico',             icon: Heart,       archivo: 'cert_medico_yhadel.pdf',      fecha: '15/02/2024 10:22' },
  { id: 7, num: 7, title: 'REJAP',                          icon: FileCheck,   archivo: 'rejap_yhadel.pdf',            fecha: '15/02/2024 10:23' },
]

const DOCENTE_DOCUMENTS = [
  { id: 1,  num: 1,  title: 'Título de Provisión Nacional', icon: GraduationCap, archivo: 'titulo_provision_nacional.pdf', fecha: '15/03/2024 10:21' },
  { id: 2,  num: 2,  title: 'Título Académico',             icon: GraduationCap, archivo: 'titulo_academico.pdf',          fecha: '15/03/2024 10:24' },
  { id: 3,  num: 3,  title: 'Diplomado en Educación Superior', icon: Award,      archivo: 'diplomado_robotica.pdf',       fecha: '15/03/2024 10:27' },
  { id: 4,  num: 4,  title: 'Cursos mayores a 400 horas',   icon: Clock,         archivo: 'cursos_400_horas.pdf',         fecha: '15/03/2024 10:31' },
  { id: 5,  num: 5,  title: 'Experiencia Laboral',          icon: Briefcase,     archivo: 'experiencia_laboral.pdf',      fecha: '15/03/2024 10:34' },
  { id: 6,  num: 6,  title: 'Certificado de Disciplina',    icon: Shield,        archivo: 'certificado_disciplina.pdf',   fecha: '15/03/2024 10:37' },
  { id: 7,  num: 7,  title: 'Fotocopia de Carnet',          icon: Contact,       archivo: 'fotocopia_carnet.pdf',         fecha: '15/03/2024 10:40' },
  { id: 8,  num: 8,  title: 'NIT',                          icon: FileText,      archivo: 'nit.pdf',                      fecha: '15/03/2024 10:43' },
  { id: 9,  num: 9,  title: 'SEGIP',                        icon: Fingerprint,   archivo: 'segip.pdf',                    fecha: '15/03/2024 10:46' },
  { id: 10, num: 10, title: 'REJAP',                        icon: FileCheck,     archivo: 'rejap.pdf',                    fecha: '15/03/2024 10:49' },
]

const CUSTOM_TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 12,
  color: '#081e46',
  boxShadow: '0 4px 14px rgba(8, 30, 70, 0.08)',
}

// ── Modal de Edición de Perfil ──────────────────────────────────
function EditProfileModal({ isOpen, onClose, userRole, formData, setFormData, onSave, saving }) {
  if (!isOpen) return null
  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <div className="flex items-center gap-2">
            <Edit2 size={18} className="text-gold" />
            <h4>
              {userRole === 'estudiante' && 'Actualizar Mis Datos de Estudiante'}
              {userRole === 'docente' && 'Actualizar Mis Datos de Docente'}
              {userRole === 'administrativo' && 'Actualizar Mis Datos de Personal Administrativo'}
            </h4>
          </div>
          <button type="button" className="doc-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={onSave}>
          <div className="doc-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Los cambios que guardes se actualizarán de inmediato en tu sesión y se sincronizarán con el panel de administración.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Carnet de Identidad (CI)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ci || ''}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono / Celular</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Correo Electrónico *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dirección de Domicilio</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              {userRole === 'estudiante' && (
                <>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Carrera</label>
                    <select
                      className="form-input"
                      value={formData.carrera || 'Ingeniería de Sistemas'}
                      onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    >
                      <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                      <option value="Ingeniería Civil">Ingeniería Civil</option>
                      <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                      <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                      <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Semestre Actual</label>
                    <select
                      className="form-input"
                      value={formData.semestre || '6to'}
                      onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                    >
                      {['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'].map((s) => (
                        <option key={s} value={s}>{s} Semestre</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Género</label>
                    <select
                      className="form-input"
                      value={formData.genero || 'Masculino'}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de Nacimiento</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="DD/MM/AAAA"
                      value={formData.fechaNacimiento || ''}
                      onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    />
                  </div>
                </>
              )}

              {userRole === 'docente' && (
                <>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Especialidad</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.especialidad || ''}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Grado Académico</label>
                    <select
                      className="form-input"
                      value={formData.grado || 'Doctor'}
                      onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Magíster">Magíster</option>
                      <option value="Licenciado">Licenciado</option>
                      <option value="Ingeniero">Ingeniero</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Carrera</label>
                    <select
                      className="form-input"
                      value={formData.carrera || 'Ingeniería de Sistemas'}
                      onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    >
                      <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                      <option value="Ingeniería Civil">Ingeniería Civil</option>
                      <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                      <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                    </select>
                  </div>
                </>
              )}

              {userRole === 'administrativo' && (
                <>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.cargo || ''}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Área / Departamento</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
                    <select
                      className="form-input"
                      value={formData.turno || 'Mañana'}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Tiempo Completo">Tiempo Completo</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Grado Académico</label>
                    <select
                      className="form-input"
                      value={formData.gradoAcademico || 'Licenciatura'}
                      onChange={(e) => setFormData({ ...formData, gradoAcademico: e.target.value })}
                    >
                      <option value="Técnico Superior">Técnico Superior</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Nueva Contraseña (opcional, dejar en blanco para conservar actual)
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="doc-modal-footer">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar y Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const userRoleStr = String(user?.role || user?.rol || '').toLowerCase()
  const isEstudiante = userRoleStr === 'estudiante'
  const isDocente = userRoleStr === 'docente'
  const isAdministrativo = userRoleStr === 'administrativo'
  const isJefeCarrera = userRoleStr.includes('jefe') || userRoleStr.includes('carrera')

  // Clave única del usuario logueado para buscar sus documentos persistidos
  const userKey = (user?.email || user?.username || user?.codigo || 'guest').toLowerCase()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailTab, setDetailTab] = useState('general')
  const [previewDoc, setPreviewDoc] = useState(null)
  // Documentos reales subidos por el usuario logueado
  const [myUploadedDocs, setMyUploadedDocs] = useState([])
  // Para el administrador: todos los documentos de todos los usuarios
  const [allDocs, setAllDocs] = useState([])
  const [adminDocFilter, setAdminDocFilter] = useState('')
  const [adminDocRoleFilter, setAdminDocRoleFilter] = useState('todos')
  const [previewUploadedDoc, setPreviewUploadedDoc] = useState(null)

  // Estados de edición de perfil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [profileFormData, setProfileFormData] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const handleOpenEditStudent = () => {
    const cur = getStudentProfile(user)
    setProfileFormData({
      nombre: cur.nombre || user?.name || '',
      ci: cur.ci || user?.ci || '',
      email: cur.email || user?.email || '',
      telefono: cur.telefono || user?.telefono || '+591 71234567',
      direccion: cur.direccion || user?.direccion || 'Av. Arce Nº 2456, La Paz',
      carrera: cur.carrera || user?.carrera || 'Ingeniería de Sistemas',
      semestre: cur.semestre_actual || cur.semestre || user?.semestre || '6to',
      genero: cur.genero || user?.genero || 'Masculino',
      fechaNacimiento: cur.fechaNacimiento || user?.fechaNacimiento || '14/06/2002',
      password: '',
    })
    setShowEditProfileModal(true)
  }

  const handleOpenEditDocente = () => {
    const cur = getDocenteProfile(user)
    setProfileFormData({
      nombre: cur.nombre || user?.name || '',
      ci: cur.ci || user?.ci || '',
      email: cur.email || user?.email || '',
      telefono: cur.telefono || user?.telefono || '+591 76543210',
      direccion: cur.direccion || user?.direccion || 'Av. Ballivián Nº 1234, Sopocachi',
      especialidad: cur.especialidad || user?.especialidad || 'Sistemas Operativos',
      grado: cur.grado || user?.grado || 'Doctor',
      carrera: cur.carrera || user?.carrera || 'Ingeniería de Sistemas',
      password: '',
    })
    setShowEditProfileModal(true)
  }

  const handleOpenEditAdmin = () => {
    const cur = getAdministrativoProfile(user)
    setProfileFormData({
      nombre: cur.nombre || user?.name || '',
      ci: cur.ci || user?.ci || '',
      email: cur.email || user?.email || '',
      telefono: cur.telefono || user?.telefono || '+591 72345678',
      direccion: cur.direccion || user?.direccion || 'Av. Ejército 123, La Paz',
      cargo: cur.cargo || user?.cargo || 'Jefe de Secretaría',
      area: cur.area || user?.area || 'Secretaría General',
      turno: cur.turno || user?.turno || 'Mañana',
      gradoAcademico: cur.gradoAcademico || user?.gradoAcademico || 'Licenciatura',
      password: '',
    })
    setShowEditProfileModal(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      let updatedUser
      if (isEstudiante) {
        updatedUser = await syncUpdateStudentProfile(user, profileFormData)
        toast.success('¡Datos de estudiante actualizados! Se reflejan de inmediato en tu perfil y en la Gestión de Estudiantes del Administrador.')
      } else if (isDocente) {
        updatedUser = await syncUpdateDocenteProfile(user, profileFormData)
        toast.success('¡Datos de docente actualizados! Se reflejan de inmediato en tu perfil y en la Gestión de Docentes del Administrador.')
      } else if (isAdministrativo) {
        updatedUser = await syncUpdateAdministrativoProfile(user, profileFormData)
        toast.success('¡Datos administrativos actualizados! Se reflejan de inmediato en tu perfil y en el módulo de Personal Administrativo.')
      }
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowEditProfileModal(false)
    } catch (err) {
      toast.error('Error al actualizar los datos.')
    } finally {
      setSavingProfile(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await reportesService.getDashboard()
        setData(res)
      } catch {
        setData({
          totalEstudiantes: 1180,
          totalDocentes: 87,
          totalMaterias: 142,
          totalBloques: 4328,
          tasaAprobacion: 85.4,
          promedioGeneral: 72.8,
          certificadosEmitidos: 234,
          gestionActual: '1/2024',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Cargar documentos subidos (propios o todos si es admin)
  useEffect(() => {
    if (isEstudiante || isDocente || isAdministrativo) {
      setMyUploadedDocs(getUserUploadedDocs(userKey))
    }
    // Para vistas de administrador del sistema (no el rol 'administrativo')
    if (!isEstudiante && !isDocente && !isAdministrativo && !isJefeCarrera) {
      setAllDocs(getAllUploadedDocs())
    }
  }, [userKey, isEstudiante, isDocente, isAdministrativo, isJefeCarrera])


  if (isJefeCarrera) {
    return <JefeCarrera />
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spin" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <span>Cargando datos del sistema...</span>
      </div>
    )
  }

  /* ================================================================ */
  /* VISTA DASHBOARD ESTUDIANTE (SEGÚN IMAGEN OFICIAL)                 */
  /* ================================================================ */
  if (isEstudiante) {
    const studentProfile = getStudentProfile(user)
    const estNombre = studentProfile.nombre
    const estCodigo = studentProfile.codigo
    const estEmail = studentProfile.email
    const estCarrera = studentProfile.carrera
    const estTelefono = studentProfile.telefono || '+591 71234567'
    const estDireccion = studentProfile.direccion || 'Av. Arce Nº 2456, La Paz'
    const estCI = studentProfile.ci || `${estCodigo} LP`
    const estSemestre = studentProfile.semestre_actual || studentProfile.semestre || '6to'
    const estGenero = studentProfile.genero || 'Masculino'
    const estFechaNac = studentProfile.fechaNacimiento || '14/06/2002'

    const estObj = {
      nombre: estNombre,
      codigo: estCodigo,
      carrera: estCarrera,
      semestre: estSemestre,
      email: estEmail,
      ci: estCI,
      estado: 'ACTIVO',
      promedio: studentProfile.promedio || 0.00,
    }

    return (
      <div className="fade-in">
        {/* Header Card */}
        <div className="doc-detail-header-card mb-4">
          <div className="doc-detail-avatar" style={{ background: 'linear-gradient(135deg, #1a3a6b, #0f2044)' }}>
            <User size={44} />
          </div>

          <div className="doc-detail-main-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="doc-detail-name">{estNombre}</h2>
              <span className="badge badge-success">ACTIVO</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue">Código: {estCodigo}</span>
            </div>
            <div className="doc-detail-title-sub">
              Estudiante de {estCarrera}
            </div>
            <div className="doc-detail-univ">Escuela Militar de Ingeniería</div>
          </div>

          <div className="doc-detail-header-right">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleOpenEditStudent}
              >
                <Edit2 size={14} /> Editar Mis Datos
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => toast.error('Solo administración puede realizar la baja de un estudiante.')}
              >
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
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <User size={16} className="text-gold" />
                  <h3>Información Personal</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={handleOpenEditStudent}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carnet de Identidad</span>
                    <span className="doc-info-value">{estCI}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Nacimiento</span>
                    <span className="doc-info-value">{estFechaNac}</span>
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
                    <span className="doc-info-value">{estGenero}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Teléfono</span>
                    <span className="doc-info-value">{estTelefono}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Correo Electrónico</span>
                    <span className="doc-info-value">{estEmail}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Dirección</span>
                    <span className="doc-info-value">{estDireccion}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Grupo Sanguíneo</span>
                    <span className="doc-info-value">O+</span>
                  </div>
                </div>
              </div>

              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <GraduationCap size={16} className="text-gold" />
                  <h3>Información Académica</h3>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carrera</span>
                    <span className="doc-info-value">{estCarrera}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Semestre Actual</span>
                    <span className="doc-info-value">{estSemestre}</span>
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
                    <span className="doc-info-value font-bold text-chain">0.00</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Créditos Aprobados</span>
                    <span className="doc-info-value">120</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Tutor Académico</span>
                    <span className="doc-info-value">Ing. Roberto Vargas Mendoza</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Modalidad de Ingreso</span>
                    <span className="doc-info-value">Examen de Admisión</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Información Académica Detallada */}
        {detailTab === 'academica' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Plan de Estudios y Materias del Semestre</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Créditos</th>
                    <th>Horario</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="font-mono text-gold">SIS-311</span></td>
                    <td><strong>Sistemas de Información Geográfica</strong></td>
                    <td>Ing. Laura Reyes García</td>
                    <td>4</td>
                    <td>Lun - Mié 08:00 - 10:00</td>
                    <td><span className="badge badge-success">En Curso</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-mono text-gold">SIS-312</span></td>
                    <td><strong>Inteligencia Artificial y Redes Neuronales</strong></td>
                    <td>Dr. Roberto Vargas Mendoza</td>
                    <td>5</td>
                    <td>Mar - Jue 10:00 - 12:00</td>
                    <td><span className="badge badge-success">En Curso</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-mono text-gold">SIS-313</span></td>
                    <td><strong>Seguridad de la Información y Blockchain</strong></td>
                    <td>Ing. Héctor Quispe Condori</td>
                    <td>4</td>
                    <td>Vie 08:00 - 12:00</td>
                    <td><span className="badge badge-success">En Curso</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Documentación */}
        {detailTab === 'documentacion' && (
          <div className="fade-in">
            <div className="est-docs-section-header">
              <div>
                <h3 className="est-docs-section-title">Expediente Digital del Estudiante</h3>
                <p className="est-docs-section-sub">
                  Documentación reglamentaria verificada con hash SHA-256 e inmutable en Blockchain.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const ok = downloadCompleteDossier(estObj, STUDENT_DOCUMENTS, 'Estudiante')
                    if (ok) toast.success(`Expediente completo de ${estNombre} descargado en PDF.`)
                    else toast.error('Error al generar el expediente.')
                  }}
                >
                  <FileDown size={14} />
                  Descargar Expediente (PDF)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => toast.success('Expediente sincronizado con Blockchain.')}
                >
                  <RefreshCw size={13} />
                  Actualizar
                </button>
              </div>
            </div>

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
                    return (
                      <tr key={doc.id}>
                        <td className="est-docs-num-cell">{doc.num}</td>
                        <td>
                          <div className="est-docs-doc-cell">
                            <div className="est-docs-doc-icon"><IconComp size={15} /></div>
                            <span className="est-docs-doc-name">{doc.title}</span>
                          </div>
                        </td>
                        <td><span className="est-docs-filename font-mono">{doc.archivo}</span></td>
                        <td><span className="est-docs-date">{doc.fecha}</span></td>
                        <td><span className="est-docs-verified-badge"><CheckCircle2 size={11} /> Verificado</span></td>
                        <td>
                          <div className="est-docs-actions">
                            <button type="button" className="est-docs-action-btn" title="Ver documento" onClick={() => setPreviewDoc(doc)}>
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="est-docs-action-btn download-btn"
                              title="Descargar documento (PDF)"
                              onClick={() => {
                                const ok = downloadSingleDocument(doc, estObj, 'Estudiante')
                                if (ok) toast.success(`Descargando: ${doc.title}`)
                                else toast.error('Error al generar el documento.')
                              }}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Documentos Reales Subidos por el Estudiante ── */}
            {myUploadedDocs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div className="est-docs-section-header" style={{ marginBottom: 12 }}>
                  <div>
                    <h3 className="est-docs-section-title" style={{ fontSize: 15 }}>
                      📤 Documentos que has subido
                    </h3>
                    <p className="est-docs-section-sub">
                      Archivos reales cargados desde el módulo Kardex. El administrador puede verlos y descargarlos.
                    </p>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setMyUploadedDocs(getUserUploadedDocs(userKey))}>
                    <RefreshCw size={12} /> Actualizar
                  </button>
                </div>
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
                      {myUploadedDocs.map((rec, idx) => (
                        <tr key={rec.id}>
                          <td className="est-docs-num-cell">{idx + 1}</td>
                          <td>
                            <div className="est-docs-doc-cell">
                              <div className="est-docs-doc-icon"><FileText size={15} /></div>
                              <span className="est-docs-doc-name">{rec.docTitle}</span>
                            </div>
                          </td>
                          <td><span className="est-docs-filename font-mono">{rec.fileName}</span></td>
                          <td><span className="est-docs-date">{rec.uploadedAt}</span></td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                              <CheckCircle2 size={11} /> Subido
                            </span>
                          </td>
                          <td>
                            <div className="est-docs-actions">
                              <button type="button" className="est-docs-action-btn" title="Vista previa" onClick={() => setPreviewUploadedDoc(rec)}>
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
            )}

            {previewDoc && (
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
                    </div>
                  </div>
                  <div className="doc-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewDoc(null)}>Cerrar</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { downloadSingleDocument(previewDoc, estObj, 'Estudiante'); toast.success(`Descargando ${previewDoc.title}...`) }}>
                      <Download size={14} /> Descargar PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal preview doc real subido */}
            {previewUploadedDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewUploadedDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gold" />
                      <h4>Vista Previa — {previewUploadedDoc.docTitle}</h4>
                    </div>
                    <button type="button" className="doc-modal-close" onClick={() => setPreviewUploadedDoc(null)}><X size={16} /></button>
                  </div>
                  <div className="doc-modal-body">
                    <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-xs text-muted font-mono mb-3">{previewUploadedDoc.fileName}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <span className="text-muted" style={{ fontSize: 11, display: 'block' }}>Titular:</span>
                          <strong className="text-white" style={{ fontSize: 13 }}>{previewUploadedDoc.userName}</strong>
                        </div>
                        <div>
                          <span className="text-muted" style={{ fontSize: 11, display: 'block' }}>Fecha subida:</span>
                          <strong className="text-gold" style={{ fontSize: 13 }}>{previewUploadedDoc.uploadedAt}</strong>
                        </div>
                      </div>
                      {previewUploadedDoc.fileData && previewUploadedDoc.fileType?.startsWith('image/') && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                          <img src={previewUploadedDoc.fileData} alt={previewUploadedDoc.docTitle} style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                      )}
                      {previewUploadedDoc.fileType === 'application/pdf' && (
                        <div style={{ marginTop: 12 }}>
                          <iframe
                            src={previewUploadedDoc.fileData}
                            style={{ width: '100%', height: '360px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                            title={previewUploadedDoc.docTitle}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="doc-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewUploadedDoc(null)}>Cerrar</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { downloadUploadedDoc(previewUploadedDoc); toast.success(`Descargando ${previewUploadedDoc.fileName}...`) }}>
                      <Download size={14} /> Descargar Archivo
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
            <h4 className="font-display text-sm font-bold mb-3">Historial de Calificaciones y Bloques</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Gestión</th>
                    <th>Materia</th>
                    <th>Nota</th>
                    <th>Estado</th>
                    <th>Blockchain Hash</th>
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
            <h4 className="font-display text-sm font-bold mb-3">Certificados Digitales Emitidos</h4>
            <div className="flex gap-3">
              <span className="badge badge-gold">Certificado de Matrícula - 1/2024</span>
              <span className="badge badge-blue">Certificado de Notas - 2023</span>
            </div>
          </div>
        )}
        {/* Modal para editar mis datos de estudiante */}
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          userRole="estudiante"
          formData={profileFormData}
          setFormData={setProfileFormData}
          onSave={handleSaveProfile}
          saving={savingProfile}
        />
      </div>
    )
  }

  /* ================================================================ */
  /* VISTA DASHBOARD DOCENTE (SEGÚN DISEÑO OFICIAL EMI)                */
  /* ================================================================ */
  if (isDocente) {
    const docenteProfile = getDocenteProfile(user)
    const docNombre = docenteProfile.nombre
    const docCodigo = docenteProfile.codigo
    const docEmail = docenteProfile.email
    const docEspecialidad = docenteProfile.especialidad
    const docCarrera = docenteProfile.carrera
    const docTelefono = docenteProfile.telefono || '+591 76543210'
    const docDireccion = docenteProfile.direccion || 'Av. Ballivián Nº 1234, Sopocachi'
    const docCI = docenteProfile.ci || '12345678 LP'
    const docGrado = docenteProfile.grado || 'Doctor'

    const docObj = {
      nombre: docNombre,
      codigo: docCodigo,
      carrera: docCarrera,
      email: docEmail,
      ci: docCI,
      grado: docGrado,
      estado: 'ACTIVO',
    }

    return (
      <div className="fade-in">
        {/* Header Card */}
        <div className="doc-detail-header-card mb-4">
          <div className="doc-detail-avatar" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}>
            <User size={44} />
          </div>

          <div className="doc-detail-main-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="doc-detail-name">{docNombre}</h2>
              <span className="badge badge-success">ACTIVO</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue">Código: {docCodigo}</span>
            </div>
            <div className="doc-detail-title-sub">
              Docente de {docEspecialidad}
            </div>
            <div className="doc-detail-univ">Escuela Militar de Ingeniería</div>
          </div>

          <div className="doc-detail-header-right">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleOpenEditDocente}
              >
                <Edit2 size={14} /> Editar Mis Datos
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => toast.error('Solo administración puede realizar la baja de un docente.')}
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>

            <div className="doc-detail-meta-box">
              <div className="doc-meta-item">
                <span className="doc-meta-label">📅 Fecha de Registro</span>
                <span className="doc-meta-val font-mono">15/03/2024</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🕒 Último Acceso</span>
                <span className="doc-meta-val font-mono">20/05/2024 08:23</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🛡️ Estado</span>
                <span className="doc-meta-val text-chain font-bold">Activo</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🔗 Blockchain ID</span>
                <span className="doc-meta-val font-mono" style={{ fontSize: 10 }}>0x9a7b...f3c2d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="kardex-tabs-bar mb-4">
          <button
            className={`kardex-tab-btn ${detailTab === 'general' ? 'active' : ''}`}
            onClick={() => setDetailTab('general')}
          >
            Información General
          </button>
          <button
            className={`kardex-tab-btn ${detailTab === 'academica' ? 'active' : ''}`}
            onClick={() => setDetailTab('academica')}
          >
            Información Académica
          </button>
          <button
            className={`kardex-tab-btn ${detailTab === 'documentacion' ? 'active' : ''}`}
            onClick={() => setDetailTab('documentacion')}
          >
            Documentación
          </button>
          <button
            className={`kardex-tab-btn ${detailTab === 'materias' ? 'active' : ''}`}
            onClick={() => setDetailTab('materias')}
          >
            Materias Asignadas
          </button>
          <button
            className={`kardex-tab-btn ${detailTab === 'historial' ? 'active' : ''}`}
            onClick={() => setDetailTab('historial')}
          >
            Historial
          </button>
          <button
            className={`kardex-tab-btn ${detailTab === 'certificados' ? 'active' : ''}`}
            onClick={() => setDetailTab('certificados')}
          >
            Certificados
          </button>
        </div>

        {/* TAB 1: Información General */}
        {detailTab === 'general' && (
          <div className="fade-in flex flex-col gap-4">
            <div className="grid-2">
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <User size={16} className="text-gold" />
                  <h3>Información Personal</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={handleOpenEditDocente}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carnet de Identidad</span>
                    <span className="doc-info-value">{docCI}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Nacimiento</span>
                    <span className="doc-info-value">12/08/1977</span>
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
                    <span className="doc-info-value">Masculino</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Teléfono</span>
                    <span className="doc-info-value">{docTelefono}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Correo Electrónico</span>
                    <span className="doc-info-value">{docEmail}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Dirección</span>
                    <span className="doc-info-value">{docDireccion}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado Civil</span>
                    <span className="doc-info-value">Casado</span>
                  </div>
                </div>
              </div>

              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <GraduationCap size={16} className="text-gold" />
                  <h3>Información Académica</h3>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Especialidad</span>
                    <span className="doc-info-value font-bold">{docEspecialidad}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Grado Académico</span>
                    <span className="doc-info-value">{docGrado}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Facultad/Área</span>
                    <span className="doc-info-value">{docCarrera}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Ingreso</span>
                    <span className="doc-info-value">02/02/2015</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado Laboral</span>
                    <span className="doc-info-value text-chain font-bold">Regular / Activo</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Experiencia</span>
                    <span className="doc-info-value">15 años</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Materias Asignadas</span>
                    <span className="doc-info-value">3 materias</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carga Horaria Semanal</span>
                    <span className="doc-info-value">12 horas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="doc-info-card">
              <div className="doc-info-card-header">
                <Phone size={16} className="text-gold" />
                <h3>Información de Contacto de Emergencia</h3>
              </div>
              <div className="doc-info-grid grid-2-col">
                <div className="doc-info-pair">
                  <span className="doc-info-label">Nombre del Contacto</span>
                  <span className="doc-info-value">María Elena Mendoza</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Teléfono de Emergencia</span>
                  <span className="doc-info-value">+591 76889900</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Parentesco</span>
                  <span className="doc-info-value">Esposa</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Dirección del Contacto</span>
                  <span className="doc-info-value">Av. Arce Nº 2211, La Paz</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Información Académica Detallada */}
        {detailTab === 'academica' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Títulos y Formación de Posgrado</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Título Obtenido</th>
                    <th>Institución</th>
                    <th>Año</th>
                    <th>Verificación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-gold">Doctorado</span></td>
                    <td><strong>Ph.D. en Ciencias de la Computación</strong></td>
                    <td>Universidad Politécnica de Madrid</td>
                    <td>2018</td>
                    <td><span className="badge badge-success">✓ Verificado</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-blue">Maestría</span></td>
                    <td><strong>M.Sc. en Inteligencia Artificial y Big Data</strong></td>
                    <td>Escuela Militar de Ingeniería</td>
                    <td>2014</td>
                    <td><span className="badge badge-success">✓ Verificado</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-muted">Licenciatura</span></td>
                    <td><strong>Ingeniero de Sistemas</strong></td>
                    <td>Escuela Militar de Ingeniería</td>
                    <td>2008</td>
                    <td><span className="badge badge-success">✓ Verificado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Documentación */}
        {detailTab === 'documentacion' && (
          <div className="fade-in">
            <div className="est-docs-section-header">
              <div>
                <h3 className="est-docs-section-title">Expediente Digital del Docente</h3>
                <p className="est-docs-section-sub">
                  Documentación institucional y títulos verificados con hash criptográfico en Blockchain.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const ok = downloadCompleteDossier(docObj, DOCENTE_DOCUMENTS, 'Docente')
                    if (ok) toast.success(`Expediente completo de ${docNombre} descargado en PDF.`)
                    else toast.error('Error al generar el expediente.')
                  }}
                >
                  <FileDown size={14} /> Descargar Expediente (PDF)
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => toast.success('Expediente docente sincronizado con Blockchain.')}>
                  <RefreshCw size={13} /> Actualizar
                </button>
              </div>
            </div>

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
                  {DOCENTE_DOCUMENTS.map((doc) => {
                    const IconComp = doc.icon
                    return (
                      <tr key={doc.id}>
                        <td className="est-docs-num-cell">{doc.num}</td>
                        <td>
                          <div className="est-docs-doc-cell">
                            <div className="est-docs-doc-icon"><IconComp size={15} /></div>
                            <span className="est-docs-doc-name">{doc.title}</span>
                          </div>
                        </td>
                        <td><span className="est-docs-filename font-mono">{doc.archivo}</span></td>
                        <td><span className="est-docs-date">{doc.fecha}</span></td>
                        <td><span className="est-docs-verified-badge"><CheckCircle2 size={11} /> Verificado</span></td>
                        <td>
                          <div className="est-docs-actions">
                            <button type="button" className="est-docs-action-btn" title="Ver documento" onClick={() => setPreviewDoc(doc)}><Eye size={14} /></button>
                            <button
                              type="button"
                              className="est-docs-action-btn download-btn"
                              title="Descargar documento (PDF)"
                              onClick={() => {
                                const ok = downloadSingleDocument(doc, docObj, 'Docente')
                                if (ok) toast.success(`Descargando: ${doc.title}`)
                                else toast.error('Error al generar el documento.')
                              }}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Documentos Reales Subidos por el Docente ── */}
            {myUploadedDocs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div className="est-docs-section-header" style={{ marginBottom: 12 }}>
                  <div>
                    <h3 className="est-docs-section-title" style={{ fontSize: 15 }}>📤 Documentos que has subido</h3>
                    <p className="est-docs-section-sub">Archivos reales cargados desde el módulo Kardex. El administrador puede verlos y descargarlos.</p>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setMyUploadedDocs(getUserUploadedDocs(userKey))}>
                    <RefreshCw size={12} /> Actualizar
                  </button>
                </div>
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
                      {myUploadedDocs.map((rec, idx) => (
                        <tr key={rec.id}>
                          <td className="est-docs-num-cell">{idx + 1}</td>
                          <td>
                            <div className="est-docs-doc-cell">
                              <div className="est-docs-doc-icon"><FileText size={15} /></div>
                              <span className="est-docs-doc-name">{rec.docTitle}</span>
                            </div>
                          </td>
                          <td><span className="est-docs-filename font-mono">{rec.fileName}</span></td>
                          <td><span className="est-docs-date">{rec.uploadedAt}</span></td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                              <CheckCircle2 size={11} /> Subido
                            </span>
                          </td>
                          <td>
                            <div className="est-docs-actions">
                              <button type="button" className="est-docs-action-btn" title="Vista previa" onClick={() => setPreviewUploadedDoc(rec)}><Eye size={14} /></button>
                              <button
                                type="button"
                                className="est-docs-action-btn download-btn"
                                title="Descargar archivo original"
                                onClick={() => {
                                  const ok = downloadUploadedDoc(rec)
                                  if (ok) toast.success(`Descargando: ${rec.fileName}`)
                                  else toast.error('Error al descargar.')
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
            )}

            {previewDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2"><FileText size={18} className="text-gold" /><h4>Vista Previa del Documento</h4></div>
                    <button type="button" className="doc-modal-close" onClick={() => setPreviewDoc(null)}><X size={16} /></button>
                  </div>
                  <div className="doc-modal-body">
                    <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-sm font-bold text-white mb-1">{previewDoc.title}</div>
                      <div className="text-xs text-muted font-mono mb-2">{previewDoc.archivo}</div>
                    </div>
                  </div>
                  <div className="doc-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewDoc(null)}>Cerrar</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { downloadSingleDocument(previewDoc, docObj, 'Docente'); toast.success(`Descargando ${previewDoc.title}...`) }}>
                      <Download size={14} /> Descargar PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {previewUploadedDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewUploadedDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2"><FileText size={18} className="text-gold" /><h4>Vista Previa — {previewUploadedDoc.docTitle}</h4></div>
                    <button type="button" className="doc-modal-close" onClick={() => setPreviewUploadedDoc(null)}><X size={16} /></button>
                  </div>
                  <div className="doc-modal-body">
                    <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-xs text-muted font-mono mb-3">{previewUploadedDoc.fileName}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><span className="text-muted" style={{ fontSize: 11, display: 'block' }}>Titular:</span><strong style={{ fontSize: 13 }}>{previewUploadedDoc.userName}</strong></div>
                        <div><span className="text-muted" style={{ fontSize: 11, display: 'block' }}>Fecha:</span><strong className="text-gold" style={{ fontSize: 13 }}>{previewUploadedDoc.uploadedAt}</strong></div>
                      </div>
                      {previewUploadedDoc.fileData && previewUploadedDoc.fileType?.startsWith('image/') && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                          <img src={previewUploadedDoc.fileData} alt={previewUploadedDoc.docTitle} style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 6 }} />
                        </div>
                      )}
                      {previewUploadedDoc.fileType === 'application/pdf' && (
                        <div style={{ marginTop: 12 }}>
                          <iframe
                            src={previewUploadedDoc.fileData}
                            style={{ width: '100%', height: '360px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                            title={previewUploadedDoc.docTitle}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="doc-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewUploadedDoc(null)}>Cerrar</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { downloadUploadedDoc(previewUploadedDoc); toast.success(`Descargando ${previewUploadedDoc.fileName}...`) }}>
                      <Download size={14} /> Descargar Archivo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Materias Asignadas */}
        {detailTab === 'materias' && (
          <div className="fade-in card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookMarked size={18} className="text-gold" />
                <h4 className="font-display text-sm font-bold">Materias Asignadas — Gestión Actual 1/2024</h4>
              </div>
              <span className="badge badge-gold">3 Materias Activas</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Materia</th>
                    <th>Carrera</th>
                    <th>Semestre</th>
                    <th>Estudiantes</th>
                    <th>Horario</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="font-mono text-gold font-bold">SIS-301</span></td>
                    <td><strong>Sistemas Operativos I</strong></td>
                    <td>Ingeniería de Sistemas</td>
                    <td>5to</td>
                    <td><span className="badge badge-blue">34 Alumnos</span></td>
                    <td>Lun - Mié 08:00 - 10:00</td>
                    <td><span className="badge badge-success">Activo</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-mono text-gold font-bold">SIS-501</span></td>
                    <td><strong>Inteligencia Artificial</strong></td>
                    <td>Ingeniería de Sistemas</td>
                    <td>7mo</td>
                    <td><span className="badge badge-blue">28 Alumnos</span></td>
                    <td>Mar - Jue 10:00 - 12:00</td>
                    <td><span className="badge badge-success">Activo</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-mono text-gold font-bold">SIS-402</span></td>
                    <td><strong>Arquitectura de Computadoras</strong></td>
                    <td>Ingeniería de Sistemas</td>
                    <td>6to</td>
                    <td><span className="badge badge-blue">31 Alumnos</span></td>
                    <td>Vie 08:00 - 12:00</td>
                    <td><span className="badge badge-success">Activo</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Historial */}
        {detailTab === 'historial' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Historial Académico y Gestiones Docentes</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Gestión</th>
                    <th>Materia Dictada</th>
                    <th>Aprobados</th>
                    <th>Reprobados</th>
                    <th>Evaluación Docente</th>
                    <th>Blockchain Hash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2/2023</td>
                    <td>Sistemas Operativos I</td>
                    <td>32</td>
                    <td>2</td>
                    <td><span className="text-chain font-bold">96.5 pts</span></td>
                    <td><span className="font-mono" style={{ fontSize: 10 }}>0x8f2a1c...</span></td>
                  </tr>
                  <tr>
                    <td>1/2023</td>
                    <td>Inteligencia Artificial</td>
                    <td>27</td>
                    <td>1</td>
                    <td><span className="text-chain font-bold">98.0 pts</span></td>
                    <td><span className="font-mono" style={{ fontSize: 10 }}>0x7b3e9a...</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Certificados */}
        {detailTab === 'certificados' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Certificados y Reconocimientos Docentes</h4>
            <div className="flex gap-3">
              <span className="badge badge-gold">Certificado de Excelencia Docente 2023</span>
              <span className="badge badge-blue">Reconocimiento a la Investigación Científica</span>
            </div>
          </div>
        )}
        {/* Modal para editar mis datos de docente */}
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          userRole="docente"
          formData={profileFormData}
          setFormData={setProfileFormData}
          onSave={handleSaveProfile}
          saving={savingProfile}
        />
      </div>
    )
  }

  /* ================================================================ */
  /* VISTA DASHBOARD ADMINISTRATIVO                                     */
  /* ================================================================ */
  if (isAdministrativo) {
    const adminProfile = getAdministrativoProfile(user)
    const admNombre  = adminProfile.nombre
    const admCargo   = adminProfile.cargo
    const admArea    = adminProfile.area
    const admEmail   = adminProfile.email
    const admCodigo  = adminProfile.codigo
    const admCI      = adminProfile.ci || '—'
    const admTelefono = adminProfile.telefono || '+591 72345678'
    const admDireccion = adminProfile.direccion || 'Av. Ejército 123, La Paz'
    const admTurno   = adminProfile.turno || 'Mañana'
    const admGrado   = adminProfile.gradoAcademico || 'Licenciatura'

    return (
      <div className="fade-in">
        {/* Header Card */}
        <div className="doc-detail-header-card mb-4">
          <div className="doc-detail-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}>
            <Briefcase size={44} />
          </div>

          <div className="doc-detail-main-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="doc-detail-name">{admNombre}</h2>
              <span className="badge badge-success">ACTIVO</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue">Código: {admCodigo}</span>
              <span className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{admCargo}</span>
            </div>
            <div className="doc-detail-title-sub">{admArea}</div>
            <div className="doc-detail-univ">Escuela Militar de Ingeniería</div>
          </div>

          <div className="doc-detail-header-right">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleOpenEditAdmin}
              >
                <Edit2 size={14} /> Editar Mis Datos
              </button>
            </div>

            <div className="doc-detail-meta-box">
              <div className="doc-meta-item">
                <span className="doc-meta-label">📅 Fecha de Ingreso</span>
                <span className="doc-meta-val font-mono">{new Date().toLocaleDateString('es-BO')}</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🕒 Último Acceso</span>
                <span className="doc-meta-val font-mono">{new Date().toLocaleString('es-BO')}</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🛡️ Estado</span>
                <span className="doc-meta-val text-chain font-bold">Activo</span>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-label">🔗 Blockchain ID</span>
                <span className="doc-meta-val font-mono" style={{ fontSize: 10 }}>0xad1b...f7e3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="kardex-tabs-bar mb-4">
          {['general', 'funciones', 'documentos'].map((tab) => (
            <button
              key={tab}
              className={`kardex-tab-btn ${detailTab === tab ? 'active' : ''}`}
              onClick={() => setDetailTab(tab)}
            >
              {tab === 'general'   && 'Información General'}
              {tab === 'funciones' && 'Funciones y Área'}
              {tab === 'documentos' && '📤 Documentos Subidos'}
            </button>
          ))}
        </div>

        {/* TAB: Información General */}
        {detailTab === 'general' && (
          <div className="fade-in flex flex-col gap-4">
            <div className="grid-2">
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <User size={16} className="text-gold" />
                  <h3>Información Personal</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={handleOpenEditAdmin}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Nombre Completo</span>
                    <span className="doc-info-value font-bold">{admNombre}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carnet de Identidad</span>
                    <span className="doc-info-value">{admCI} LP</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Correo Electrónico</span>
                    <span className="doc-info-value">{admEmail}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Teléfono</span>
                    <span className="doc-info-value">{admTelefono}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Dirección</span>
                    <span className="doc-info-value">{admDireccion}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Rol en el Sistema</span>
                    <span className="doc-info-value text-chain font-bold">Administrativo</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Código de Personal</span>
                    <span className="doc-info-value font-mono">{admCodigo}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado</span>
                    <span className="doc-info-value text-chain font-bold">Activo</span>
                  </div>
                </div>
              </div>

              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <Briefcase size={16} className="text-gold" />
                  <h3>Información Laboral</h3>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Cargo</span>
                    <span className="doc-info-value font-bold">{admCargo}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Área / Departamento</span>
                    <span className="doc-info-value">{admArea}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Institución</span>
                    <span className="doc-info-value">Escuela Militar de Ingeniería</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Turno</span>
                    <span className="doc-info-value">{admTurno}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Grado Académico</span>
                    <span className="doc-info-value">{admGrado}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Funciones */}
        {detailTab === 'funciones' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Funciones y Responsabilidades</h4>
            <div className="doc-info-grid">
              <div className="doc-info-pair">
                <span className="doc-info-label">Área Asignada</span>
                <span className="doc-info-value font-bold">{admArea}</span>
              </div>
              <div className="doc-info-pair">
                <span className="doc-info-label">Cargo</span>
                <span className="doc-info-value">{admCargo}</span>
              </div>
              <div className="doc-info-pair">
                <span className="doc-info-label">Tipo de Acceso</span>
                <span className="doc-info-value text-chain">Administrativo — Solo lectura de módulos académicos</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Documentos Subidos */}
        {detailTab === 'documentos' && (
          <div className="fade-in">
            <div className="est-docs-section-header">
              <div>
                <h3 className="est-docs-section-title">📤 Documentos que has subido</h3>
                <p className="est-docs-section-sub">
                  Archivos cargados desde el módulo Kardex. El administrador del sistema puede revisarlos y descargarlos.
                </p>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setMyUploadedDocs(getUserUploadedDocs(userKey))}>
                <RefreshCw size={13} /> Actualizar
              </button>
            </div>

            {myUploadedDocs.length === 0 ? (
              <div className="card p-6 text-center" style={{ marginTop: 16 }}>
                <FileText size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                <h4 className="font-display text-sm font-bold mb-2">No has subido documentos aún</h4>
                <p className="text-secondary" style={{ fontSize: 13 }}>
                  Ve a <strong>Kardex → Subir Documentos</strong> para cargar tus documentos requeridos.
                </p>
              </div>
            ) : (
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
                    {myUploadedDocs.map((rec, idx) => (
                      <tr key={rec.id}>
                        <td className="est-docs-num-cell">{idx + 1}</td>
                        <td>
                          <div className="est-docs-doc-cell">
                            <div className="est-docs-doc-icon"><FileText size={15} /></div>
                            <span className="est-docs-doc-name">{rec.docTitle}</span>
                          </div>
                        </td>
                        <td><span className="est-docs-filename font-mono">{rec.fileName}</span></td>
                        <td><span className="est-docs-date">{rec.uploadedAt}</span></td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                            <CheckCircle2 size={11} /> Subido
                          </span>
                        </td>
                        <td>
                          <div className="est-docs-actions">
                            <button type="button" className="est-docs-action-btn" title="Vista previa" onClick={() => setPreviewUploadedDoc(rec)}><Eye size={14} /></button>
                            <button
                              type="button"
                              className="est-docs-action-btn download-btn"
                              title="Descargar archivo original"
                              onClick={() => {
                                const ok = downloadUploadedDoc(rec)
                                if (ok) toast.success(`Descargando: ${rec.fileName}`)
                                else toast.error('Error al descargar.')
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
            )}

            {previewUploadedDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewUploadedDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2"><FileText size={18} className="text-gold" /><h4>Vista Previa — {previewUploadedDoc.docTitle}</h4></div>
                    <button type="button" className="doc-modal-close" onClick={() => setPreviewUploadedDoc(null)}><X size={16} /></button>
                  </div>
                  <div className="doc-modal-body">
                    <div className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-xs text-muted font-mono mb-3">{previewUploadedDoc.fileName}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Titular:</span><strong style={{ fontSize: 13 }}>{previewUploadedDoc.userName}</strong></div>
                        <div><span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Fecha:</span><strong style={{ fontSize: 13, color: '#fbbf24' }}>{previewUploadedDoc.uploadedAt}</strong></div>
                      </div>
                      {previewUploadedDoc.fileData && previewUploadedDoc.fileType?.startsWith('image/') && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                          <img src={previewUploadedDoc.fileData} alt={previewUploadedDoc.docTitle} style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 6 }} />
                        </div>
                      )}
                      {previewUploadedDoc.fileType === 'application/pdf' && (
                        <div style={{ marginTop: 12 }}>
                          <iframe
                            src={previewUploadedDoc.fileData}
                            style={{ width: '100%', height: '360px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                            title={previewUploadedDoc.docTitle}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="doc-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewUploadedDoc(null)}>Cerrar</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { downloadUploadedDoc(previewUploadedDoc); toast.success(`Descargando ${previewUploadedDoc.fileName}...`) }}>
                      <Download size={14} /> Descargar Archivo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Modal para editar mis datos de personal administrativo */}
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          userRole="administrativo"
          formData={profileFormData}
          setFormData={setProfileFormData}
          onSave={handleSaveProfile}
          saving={savingProfile}
        />
      </div>
    )
  }

  /* ================================================================ */
  /* VISTA DASHBOARD ADMINISTRADOR / SECRETARÍA / AUDITOR              */
  /* ================================================================ */
  return (
    <div className="admin-dashboard-container fade-in">
      {/* Page Header */}
      <div className="dash-page-header">
        <div className="dash-header-titles">
          <h1 className="dash-main-title">Dashboard Principal</h1>
          <p className="dash-main-subtitle">
            Gestión académica · Gestión {data?.gestionActual || '1/2024'} ·
            <span className="dash-sync-pill"> ● Blockchain sincronizado</span>
          </p>
        </div>
        <div className="dash-header-actions">
          <div className="dashboard-date-badge">
            <Calendar size={15} color="#0066ff" />
            <span>Viernes, 18 De Septiembre De 2026</span>
          </div>
        </div>
      </div>

      {/* KPI Stats - Replica exacta de la imagen */}
      <div className="dash-kpi-grid">
        {/* KPI 1: Estudiantes Activos */}
        <div className="dash-kpi-card" id="statEstudiantes">
          <div className="kpi-icon-box gold">
            <GraduationCap size={22} strokeWidth={2.4} />
          </div>
          <div className="kpi-content">
            <div className="kpi-number">{String(data?.totalEstudiantes || 1180).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
            <div className="kpi-title">Estudiantes Activos</div>
            <div className="kpi-trend up">↑ +28 este semestre</div>
          </div>
        </div>

        {/* KPI 2: Docentes */}
        <div className="dash-kpi-card" id="statDocentes">
          <div className="kpi-icon-box navy">
            <Users size={22} strokeWidth={2.4} />
          </div>
          <div className="kpi-content">
            <div className="kpi-number">{data?.totalDocentes || 87}</div>
            <div className="kpi-title">Docentes</div>
            <div className="kpi-trend up">↑ +5 nuevos</div>
          </div>
        </div>

        {/* KPI 3: Tasa de Aprobación */}
        <div className="dash-kpi-card" id="statAprobacion">
          <div className="kpi-icon-box gold">
            <TrendingUp size={22} strokeWidth={2.4} />
          </div>
          <div className="kpi-content">
            <div className="kpi-number">{data?.tasaAprobacion || 85.4}%</div>
            <div className="kpi-title">Tasa de Aprobación</div>
            <div className="kpi-trend up">↑ +2.3% vs anterior</div>
          </div>
        </div>

        {/* KPI 4: Bloques Blockchain */}
        <div className="dash-kpi-card" id="statBloques">
          <div className="kpi-icon-box navy">
            <Link2 size={22} strokeWidth={2.4} />
          </div>
          <div className="kpi-content">
            <div className="kpi-number">{String(data?.totalBloques || 4328).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
            <div className="kpi-title">Bloques Blockchain</div>
            <div className="kpi-trend up">↑ 100% íntegros</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Rendimiento Académico */}
        <div className="dash-white-card" style={{ flex: 2 }}>
          <div className="dash-card-title">
            <TrendingUp size={18} color="#ffb800" strokeWidth={2.5} />
            <span>RENDIMIENTO ACADÉMICO - 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={MOCK_RENDIMIENTO} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGeneral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb800" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ffb800" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCarrera" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066ff" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="general"
                stroke="#ffb800"
                strokeWidth={2.5}
                fill="url(#gradGeneral)"
                dot={{ fill: '#ffb800', stroke: '#ffffff', strokeWidth: 2, r: 4.5 }}
                activeDot={{ r: 6, fill: '#ffb800', stroke: '#ffffff', strokeWidth: 2 }}
                name="Promedio General"
              />
              <Area
                type="monotone"
                dataKey="carrera"
                stroke="#0066ff"
                strokeWidth={2.5}
                fill="url(#gradCarrera)"
                dot={{ fill: '#0066ff', stroke: '#ffffff', strokeWidth: 2, r: 4.5 }}
                activeDot={{ r: 6, fill: '#0066ff', stroke: '#ffffff', strokeWidth: 2 }}
                name="Promedio Carrera"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="dashboard-chart-legend">
            <div className="legend-chip">
              <span className="legend-dot dot-yellow" />
              <span>Promedio General</span>
            </div>
            <div className="legend-chip">
              <span className="legend-dot dot-blue" />
              <span>Promedio Carrera</span>
            </div>
          </div>
        </div>

        {/* Estudiantes por Carrera */}
        <div className="dash-white-card" style={{ flex: 1.2 }}>
          <div className="dash-card-title">
            <GraduationCap size={18} color="#ffb800" strokeWidth={2.5} />
            <span>ESTUDIANTES POR CARRERA</span>
          </div>
          <div className="donut-chart-container">
            <div className="donut-wrapper-rel">
              <ResponsiveContainer width={190} height={190}>
                <PieChart>
                  <Pie
                    data={MOCK_CARRERAS}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {MOCK_CARRERAS.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-info">
                <div className="donut-val">1.180</div>
                <div className="donut-lbl">TOTAL</div>
              </div>
            </div>
            <div className="donut-legend-list">
              <div className="donut-legend-row">
                <span className="legend-dot dot-navy" />
                <span>Sistemas: 620</span>
              </div>
              <div className="donut-legend-row">
                <span className="legend-dot dot-yellow" />
                <span>Comercial: 340</span>
              </div>
              <div className="donut-legend-row">
                <span className="legend-dot dot-cyan" />
                <span>Civil: 220</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Actividad Reciente */}
        <div className="dash-white-card" style={{ flex: 2 }}>
          <div className="dash-card-title">
            <Activity size={18} color="#ffb800" strokeWidth={2.5} />
            <span>ACTIVIDAD RECIENTE</span>
          </div>
          <div className="dashboard-activity-list">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="dashboard-activity-item">
                <div className={`activity-dot ${item.ok ? 'ok' : 'warn'}`} />
                <div className="activity-body">
                  <div className="activity-action">{item.action}</div>
                  <div className="activity-details">
                    <span className="activity-student-materia">{item.student} {item.materia !== '—' && `· ${item.materia}`}</span>
                    {item.nota !== null && (
                      <span className="activity-pts-pill">
                        {item.nota} pts
                      </span>
                    )}
                  </div>
                </div>
                <div className="activity-right">
                  <div className="activity-hash-pill">
                    <Shield size={12} color="#0066ff" />
                    <span className="font-mono">{item.hash}</span>
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloques Minados Hoy */}
        <div className="dash-white-card" style={{ flex: 1.2 }}>
          <div className="dash-card-title">
            <LayoutGrid size={18} color="#ffb800" strokeWidth={2.5} />
            <span>BLOQUES MINADOS HOY</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_BLOCKS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} ticks={[0, 4, 8, 12, 16]} domain={[0, 16]} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="blocks" fill="#ffb800" radius={[4, 4, 0, 0]} name="Bloques" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── DOCUMENTOS RECIBIDOS DE USUARIOS ── */}
      <div className="dash-white-card" style={{ marginTop: 24 }}>
        <div className="dash-card-title" style={{ marginBottom: 16 }}>
          <FileText size={18} color="#ffb800" strokeWidth={2.5} />
          <span>DOCUMENTOS RECIBIDOS DE USUARIOS</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
            {allDocs.length} documento(s) en total
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginLeft: 8 }}
            onClick={() => { setAllDocs(getAllUploadedDocs()); toast.success('Lista actualizada.') }}
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="search-input"
            style={{ maxWidth: 260, flex: 1 }}
            placeholder="Buscar por usuario o documento..."
            value={adminDocFilter}
            onChange={(e) => setAdminDocFilter(e.target.value)}
          />
          <select
            className="form-input"
            style={{ maxWidth: 180 }}
            value={adminDocRoleFilter}
            onChange={(e) => setAdminDocRoleFilter(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Administrativo">Administrativo</option>
          </select>
        </div>

        {allDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 14 }}>No hay documentos subidos aún por ningún usuario.</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Los documentos aparecerán aquí cuando los usuarios los suban desde Kardex → Subir Documentos.</p>
          </div>
        ) : (
          <div className="est-docs-table-wrapper">
            <table className="est-docs-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Documento</th>
                  <th>Archivo</th>
                  <th>Fecha de Subida</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {allDocs
                  .filter((rec) => {
                    const matchRole = adminDocRoleFilter === 'todos' || rec.userRole === adminDocRoleFilter
                    const q = adminDocFilter.toLowerCase()
                    const matchSearch = !q || rec.userName?.toLowerCase().includes(q) || rec.docTitle?.toLowerCase().includes(q) || rec.fileName?.toLowerCase().includes(q) || rec.userKey?.includes(q)
                    return matchRole && matchSearch
                  })
                  .map((rec, idx) => (
                    <tr key={rec.id}>
                      <td className="est-docs-num-cell">{idx + 1}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{rec.userName || rec.userKey}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rec.userCodigo}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: rec.userRole === 'Estudiante' ? 'rgba(59,130,246,0.15)' : rec.userRole === 'Docente' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)',
                          color: rec.userRole === 'Estudiante' ? '#60a5fa' : rec.userRole === 'Docente' ? '#34d399' : '#a78bfa',
                        }}>{rec.userRole || 'Usuario'}</span>
                      </td>
                      <td><span className="est-docs-doc-name">{rec.docTitle}</span></td>
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
                              if (ok) toast.success(`Descargando: ${rec.fileName} de ${rec.userName}`)
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
        )}
      </div>

      {/* Modal preview doc recibido por admin */}
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
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Usuario:</span>
                    <strong style={{ fontSize: 14 }}>{previewUploadedDoc.userName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Rol:</span>
                    <strong style={{ fontSize: 14 }}>{previewUploadedDoc.userRole}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Código:</span>
                    <strong className="font-mono" style={{ fontSize: 13 }}>{previewUploadedDoc.userCodigo}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Documento:</span>
                    <strong style={{ fontSize: 13 }}>{previewUploadedDoc.docTitle}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Archivo:</span>
                    <span className="font-mono" style={{ fontSize: 12 }}>{previewUploadedDoc.fileName}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Fecha subida:</span>
                    <strong style={{ fontSize: 13, color: '#fbbf24' }}>{previewUploadedDoc.uploadedAt}</strong>
                  </div>
                </div>
                {previewUploadedDoc.fileData && previewUploadedDoc.fileType?.startsWith('image/') && (
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <img
                      src={previewUploadedDoc.fileData}
                      alt={previewUploadedDoc.docTitle}
                      style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                )}
                {previewUploadedDoc.fileType === 'application/pdf' && (
                  <div style={{ marginTop: 12 }}>
                    <iframe
                      src={previewUploadedDoc.fileData}
                      style={{ width: '100%', height: '420px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
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
                  toast.success(`Descargando ${previewUploadedDoc.fileName} de ${previewUploadedDoc.userName}...`)
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
