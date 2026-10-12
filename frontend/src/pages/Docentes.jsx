import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, Edit2, Trash2, X, Eye, EyeOff,
  ArrowLeft, User, GraduationCap, Phone, CheckCircle, FileText,
  Shield, Clock, BookOpen, Award, Briefcase, Contact, Fingerprint, FileCheck,
  RefreshCw, Download, CheckCircle2, FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadSingleDocument, downloadCompleteDossier } from '../services/docDownloadService'
import { getAllUploadedDocs, downloadUploadedDoc, getDocsForPerson, getPersonDocForSlot } from '../services/docUploadService'
import { updateDocsUserInfo } from '../services/profileSyncService'
import './Docentes.css'

// Required document checklist for Docentes
const DOCENTE_DOCUMENTS = [
  { id: 1,  num: 1,  title: 'Título de Provisión Nacional', icon: GraduationCap, archivo: 'titulo_provision_nacional.pdf', fecha: '15/03/2024 10:21' },
  { id: 2,  num: 2,  title: 'Título Académico',             icon: GraduationCap, archivo: 'titulo_academico.pdf',          fecha: '15/03/2024 10:24' },
  { id: 3,  num: 3,  title: 'Diplomado',                    icon: Award,         archivo: 'diplomado_robotica.pdf',       fecha: '15/03/2024 10:27' },
  { id: 4,  num: 4,  title: 'Cursos mayores a 400 horas',   icon: Clock,         archivo: 'cursos_400_horas.pdf',         fecha: '15/03/2024 10:31' },
  { id: 5,  num: 5,  title: 'Experiencia Laboral',          icon: Briefcase,     archivo: 'experiencia_laboral.pdf',      fecha: '15/03/2024 10:34' },
  { id: 6,  num: 6,  title: 'Certificado de Disciplina',    icon: Shield,        archivo: 'certificado_disciplina.pdf',   fecha: '15/03/2024 10:37' },
  { id: 7,  num: 7,  title: 'Fotocopia de Carnet',          icon: Contact,       archivo: 'fotocopia_carnet.pdf',         fecha: '15/03/2024 10:40' },
  { id: 8,  num: 8,  title: 'NIT',                          icon: FileText,      archivo: 'nit.pdf',                      fecha: '15/03/2024 10:43' },
  { id: 9,  num: 9,  title: 'SEGIP',                        icon: Fingerprint,   archivo: 'segip.pdf',                    fecha: '15/03/2024 10:46' },
  { id: 10, num: 10, title: 'REJAP',                        icon: FileCheck,     archivo: 'rejap.pdf',                    fecha: '15/03/2024 10:49' },
]

const MOCK_DOCENTES = [
  { id: 1, ci: '12345678', nombre: 'Dr. Roberto Vargas Mendoza', especialidad: 'Sistemas Operativos', carrera: 'Ingeniería de Sistemas', email: 'r.vargas@emi.edu.bo', grado: 'Doctor', materias: 3, estado: 'ACTIVO', codigo: 'DOC-2024-0018' },
  { id: 2, ci: '23456789', nombre: 'Ing. Laura Reyes García', especialidad: 'Redes y Telecomunicaciones', carrera: 'Ingeniería de Sistemas', email: 'l.reyes@emi.edu.bo', grado: 'Magíster', materias: 4, estado: 'ACTIVO', codigo: 'DOC-2024-0019' },
  { id: 3, ci: '34567890', nombre: 'Dr. Marco Flores Quispe', especialidad: 'Matemáticas Aplicadas', carrera: 'Ingeniería Civil', email: 'm.flores@emi.edu.bo', grado: 'Doctor', materias: 2, estado: 'ACTIVO', codigo: 'DOC-2024-0020' },
  { id: 4, ci: '45678901', nombre: 'Ing. Héctor Quispe Condori', especialidad: 'Inteligencia Artificial', carrera: 'Ingeniería de Sistemas', email: 'h.quispe@emi.edu.bo', grado: 'Magíster', materias: 3, estado: 'ACTIVO', codigo: 'DOC-2024-0021' },
]

const INITIAL_FORM = {
  ci: '',
  codigo: '',
  nombre: '',
  especialidad: '',
  carrera: 'Ingeniería de Sistemas',
  email: '',
  telefono: '',
  direccion: '',
  grado: 'Doctor',
  turno: 'Mañana',
  experiencia: '',
  cargaHoraria: '',
  contactoEmergenciaNombre: '',
  contactoEmergenciaTelefono: '',
  contactoEmergenciaParentesco: '',
  contactoEmergenciaDireccion: '',
  password: '',
  estado: 'ACTIVO'
}

export default function Docentes() {
  const [docentes, setDocentes] = useState(() => {
    const saved = localStorage.getItem('emi_docentes')
    if (saved) {
      try { return JSON.parse(saved) } catch { return MOCK_DOCENTES }
    }
    localStorage.setItem('emi_docentes', JSON.stringify(MOCK_DOCENTES))
    return MOCK_DOCENTES
  })

  const [selectedDocente, setSelectedDocente] = useState(null)
  const [detailTab, setDetailTab] = useState('general')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewUploadedDoc, setPreviewUploadedDoc] = useState(null)
  const [, setDocVersion] = useState(0)

  useEffect(() => {
    const handleDocUpdate = () => setDocVersion(v => v + 1)
    window.addEventListener('emi_docs_updated', handleDocUpdate)
    return () => window.removeEventListener('emi_docs_updated', handleDocUpdate)
  }, [])

  // Sincronización en caliente cuando un docente actualiza sus datos
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('emi_docentes')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDocentes(parsed)
          if (selectedDocente) {
            const up = parsed.find(d => d.id === selectedDocente.id || d.codigo === selectedDocente.codigo || d.ci === selectedDocente.ci)
            if (up) setSelectedDocente(up)
          }
        } catch {}
      }
    }
    window.addEventListener('emi_docentes_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('emi_docentes_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [selectedDocente])

  useEffect(() => {
    localStorage.setItem('emi_docentes', JSON.stringify(docentes))
  }, [docentes])

  const filtered = docentes.filter(d =>
    !search || d.nombre.toLowerCase().includes(search.toLowerCase()) || d.ci.includes(search)
  )

  const openCreate = () => {
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowPassword(false)
    setShowModal(true)
  }

  const openEdit = (d) => {
    setEditing(d)
    setForm({
      ci: d.ci || '',
      codigo: d.codigo || '',
      nombre: d.nombre || '',
      especialidad: d.especialidad || '',
      carrera: d.carrera || 'Ingeniería de Sistemas',
      email: d.email || '',
      telefono: d.telefono || '',
      direccion: d.direccion || '',
      grado: d.grado || 'Doctor',
      turno: d.turno || 'Mañana',
      experiencia: d.experiencia || '',
      cargaHoraria: d.cargaHoraria || '',
      contactoEmergenciaNombre: d.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: d.contactoEmergenciaTelefono || '',
      contactoEmergenciaParentesco: d.contactoEmergenciaParentesco || '',
      contactoEmergenciaDireccion: d.contactoEmergenciaDireccion || '',
      password: d.password || '',
      estado: d.estado || 'ACTIVO'
    })
    setShowPassword(false)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nombre.trim() || !form.ci.trim()) {
      toast.error('Por favor complete los campos obligatorios.')
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

    const newDocente = {
      id: editing ? editing.id : Date.now(),
      ci: form.ci,
      codigo: form.codigo || (editing ? (editing.codigo || `DOC-2024-${String(editing.id).padStart(4, '0')}`) : `DOC-2024-${String(Date.now()).slice(-4)}`),
      nombre: form.nombre,
      especialidad: form.especialidad,
      carrera: form.carrera || 'Ingeniería de Sistemas',
      email: form.email || `${form.ci}@emi.edu.bo`,
      telefono: form.telefono || '',
      direccion: form.direccion || '',
      grado: form.grado,
      turno: form.turno || 'Mañana',
      experiencia: form.experiencia || '',
      cargaHoraria: form.cargaHoraria || '',
      contactoEmergenciaNombre: form.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: form.contactoEmergenciaTelefono || '',
      contactoEmergenciaParentesco: form.contactoEmergenciaParentesco || '',
      contactoEmergenciaDireccion: form.contactoEmergenciaDireccion || '',
      materias: editing ? editing.materias : 0,
      estado: form.estado,
      password: form.password || (editing?.password || '123456'),
    }

    let updatedList
    if (editing) {
      updatedList = docentes.map(d => d.id === editing.id ? newDocente : d)
      toast.success('Docente actualizado y guardado permanentemente.')
      if (selectedDocente && selectedDocente.id === editing.id) {
        setSelectedDocente(newDocente)
      }
    } else {
      updatedList = [newDocente, ...docentes]
      toast.success(`Docente guardado permanentemente. Correo: "${newDocente.email}"`)
    }

    setDocentes(updatedList)
    localStorage.setItem('emi_docentes', JSON.stringify(updatedList))

    try {
      const existing = JSON.parse(localStorage.getItem('created_users') || '[]')
      const filteredRegistry = existing.filter(u => u.email !== newDocente.email && u.username !== newDocente.email && u.ci !== newDocente.ci && u.codigo !== newDocente.codigo)
      const userToSave = {
        username: newDocente.email,
        email: newDocente.email,
        ci: newDocente.ci,
        codigo: newDocente.codigo,
        name: newDocente.nombre,
        password: newDocente.password,
        role: 'Docente',
        especialidad: newDocente.especialidad,
        carrera: newDocente.carrera,
        grado: newDocente.grado,
        turno: newDocente.turno,
        experiencia: newDocente.experiencia,
        cargaHoraria: newDocente.cargaHoraria,
        contactoEmergenciaNombre: newDocente.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: newDocente.contactoEmergenciaTelefono,
        contactoEmergenciaParentesco: newDocente.contactoEmergenciaParentesco,
        contactoEmergenciaDireccion: newDocente.contactoEmergenciaDireccion,
      }
      localStorage.setItem('created_users', JSON.stringify([...filteredRegistry, userToSave]))
    } catch (e) {
      console.error('Error guardando en registro:', e)
    }

    // Sincronizar documentos previamente subidos con el nuevo nombre y CI
    updateDocsUserInfo([editing?.email, editing?.ci, editing?.codigo, newDocente.email, newDocente.ci, newDocente.codigo], newDocente)

    // Notificar en caliente a toda la ventana para actualizar el dashboard del docente
    window.dispatchEvent(new CustomEvent('emi_docentes_updated', { detail: newDocente }))
    window.dispatchEvent(new Event('storage'))

    // Si el usuario en sesión es este docente, actualizar emi_user
    try {
      const curUser = JSON.parse(localStorage.getItem('emi_user') || '{}')
      if (curUser && (curUser.ci === newDocente.ci || curUser.email === newDocente.email || curUser.codigo === newDocente.codigo)) {
        const updatedAuth = { ...curUser, ...newDocente, name: newDocente.nombre }
        localStorage.setItem('emi_user', JSON.stringify(updatedAuth))
      }
    } catch {}

    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Desea eliminar este docente?')) return
    const updated = docentes.filter(x => x.id !== id)
    setDocentes(updated)
    localStorage.setItem('emi_docentes', JSON.stringify(updated))
    toast.success('Docente eliminado.')
    if (selectedDocente && selectedDocente.id === id) {
      setSelectedDocente(null)
    }
  }

  /* ============================================================ */
  /* DETAILED PROFILE VIEW (WHEN A DOCENTE IS SELECTED BY ADMIN)   */
  /* ============================================================ */
  if (selectedDocente) {
    return (
      <div className="fade-in doc-detail-container">
        {/* Back Link */}
        <button className="btn-back-link mb-4" onClick={() => setSelectedDocente(null)}>
          <ArrowLeft size={16} /> Volver a Docentes
        </button>

        {/* Header Profile Card matching reference image */}
        <div className="doc-detail-header-card mb-4">
          <div className="doc-detail-avatar">
            <User size={44} />
          </div>

          <div className="doc-detail-main-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="doc-detail-name">{selectedDocente.nombre}</h2>
              <span className={`badge ${selectedDocente.estado === 'ACTIVO' ? 'badge-success' : 'badge-muted'}`}>
                {selectedDocente.estado}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue">
                Código: {selectedDocente.codigo || `DOC-2024-00${selectedDocente.id}`}
              </span>
            </div>
            <div className="doc-detail-title-sub">Docente de {selectedDocente.especialidad || 'Sistemas Operativos'}</div>
            <div className="doc-detail-univ">Escuela Militar de Ingeniería</div>
          </div>

          {/* Actions & Meta box on right */}
          <div className="doc-detail-header-right">
            <div className="flex gap-2 mb-3">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(selectedDocente)}>
                <Edit2 size={14} /> Editar Docente
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedDocente.id)}>
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

        {/* Detail Tabs Bar matching UI mockup */}
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
            Materias
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
              {/* Card 1: Información Personal */}
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <User size={16} className="text-gold" />
                  <h3>Información Personal</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => openEdit(selectedDocente)}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carnet de Identidad</span>
                    <span className="doc-info-value">{selectedDocente.ci ? `${selectedDocente.ci} LP` : '—'}</span>
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
                    <span className="doc-info-value">{selectedDocente.telefono || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Correo Electrónico</span>
                    <span className="doc-info-value">{selectedDocente.email || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Dirección</span>
                    <span className="doc-info-value">{selectedDocente.direccion || '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado Civil</span>
                    <span className="doc-info-value">Casado</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Información Académica */}
              <div className="doc-info-card">
                <div className="doc-info-card-header">
                  <GraduationCap size={16} className="text-gold" />
                  <h3>Información Académica</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => openEdit(selectedDocente)}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                </div>
                <div className="doc-info-grid">
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Especialidad</span>
                    <span className="doc-info-value">{selectedDocente.especialidad}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Grado Académico</span>
                    <span className="doc-info-value">{selectedDocente.grado}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Facultad/Área</span>
                    <span className="doc-info-value">{selectedDocente.carrera || 'Ingeniería de Sistemas'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Fecha de Ingreso</span>
                    <span className="doc-info-value">02/02/2015</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Estado Académico/Laboral</span>
                    <span className="doc-info-value text-chain font-bold">Regular</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Turno</span>
                    <span className="doc-info-value">{selectedDocente.turno || 'Mañana'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Experiencia</span>
                    <span className="doc-info-value">{selectedDocente.experiencia ? `${selectedDocente.experiencia} años` : '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Materias Asignadas</span>
                    <span className="doc-info-value">{selectedDocente.materias !== undefined ? `${selectedDocente.materias} materias` : '—'}</span>
                  </div>
                  <div className="doc-info-pair">
                    <span className="doc-info-label">Carga Horaria Semanal</span>
                    <span className="doc-info-value">{selectedDocente.cargaHoraria ? `${selectedDocente.cargaHoraria} horas` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Contacto de Emergencia */}
            <div className="doc-info-card">
              <div className="doc-info-card-header">
                <Phone size={16} className="text-gold" />
                <h3>Información de Contacto de Emergencia</h3>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => openEdit(selectedDocente)}
                >
                  <Edit2 size={12} /> Editar
                </button>
              </div>
              <div className="doc-info-grid grid-2-col">
                <div className="doc-info-pair">
                  <span className="doc-info-label">Nombre del Contacto</span>
                  <span className="doc-info-value">{selectedDocente.contactoEmergenciaNombre || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Teléfono de Emergencia</span>
                  <span className="doc-info-value">{selectedDocente.contactoEmergenciaTelefono || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Parentesco</span>
                  <span className="doc-info-value">{selectedDocente.contactoEmergenciaParentesco || '—'}</span>
                </div>
                <div className="doc-info-pair">
                  <span className="doc-info-label">Dirección del Contacto</span>
                  <span className="doc-info-value">{selectedDocente.contactoEmergenciaDireccion || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Documentación */}
        {detailTab === 'documentacion' && (
          <div className="fade-in">
            {/* Section Header */}
            <div className="est-docs-section-header">
              <div className="flex items-start gap-3">
                <div className="doc-section-icon-box">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="est-docs-section-title">Documentos del Docente</h3>
                  <p className="est-docs-section-sub">
                    Lista completa de documentos requeridos para el registro del docente. Puedes previsualizar o descargar los documentos individuales o el legajo institucional completo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const ok = downloadCompleteDossier(selectedDocente, DOCENTE_DOCUMENTS, 'Docente')
                    if (ok) toast.success(`Expediente completo de ${selectedDocente.nombre} descargado correctamente.`)
                    else toast.error('Error al generar el expediente.')
                  }}
                >
                  <FileDown size={14} />
                  Descargar Expediente Completo (PDF)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => toast.success('Documentos actualizados y sincronizados.')}
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
                  {DOCENTE_DOCUMENTS.map((doc) => {
                    const IconComp = doc.icon
                    const realDoc = getPersonDocForSlot(selectedDocente, doc)
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
                              Subido por docente
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
                              title={isUploaded ? (isImage ? 'Ver imagen subida por docente' : 'Ver documento subido') : 'Ver documento'}
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
                              title={isUploaded ? 'Descargar archivo original del docente' : 'Descargar documento (PDF)'}
                              onClick={() => {
                                if (isUploaded) {
                                  downloadUploadedDoc(realDoc)
                                  toast.success(`Descargando: ${realDoc.fileName}`)
                                } else {
                                  const ok = downloadSingleDocument(doc, selectedDocente, 'Docente')
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

            {/* Bottom Summary Bar */}
            <div className="docente-footer-bar">
              <div className="docente-footer-msg">
                <div className="docente-check-circle flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="docente-footer-title">¡Excelente!</div>
                  <div className="docente-footer-sub">Todos los documentos reglamentarios se encuentran registrados y sincronizados con Blockchain.</div>
                </div>
              </div>
              <div className="docente-footer-count">
                <div className="docente-count-num">10 de 10</div>
                <div className="docente-count-label">Documentos Verificados</div>
              </div>
            </div>

            {/* ── Archivos Reales Subidos por el Docente ── */}
            {(() => {
              const uploadedDocs = getDocsForPerson(selectedDocente)
              if (uploadedDocs.length === 0) return null
              return (
                <div style={{ marginTop: 28 }}>
                  <div className="est-docs-section-header" style={{ marginBottom: 14 }}>
                    <div>
                      <h3 className="est-docs-section-title" style={{ fontSize: 15 }}>
                        📤 Archivos subidos por el docente
                        <span style={{
                          marginLeft: 10, fontSize: 11, background: '#22c55e22', color: '#22c55e',
                          padding: '2px 10px', borderRadius: 20, fontWeight: 700
                        }}>{uploadedDocs.length} archivo(s)</span>
                      </h3>
                      <p className="est-docs-section-sub">Documentos e imágenes reales cargados por el docente. Puedes previsualizarlos y descargarlos.</p>
                    </div>
                  </div>
                  <div className="est-docs-table-wrapper">
                    <table className="est-docs-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>Tipo</th>
                          <th>Documento</th>
                          <th>Archivo Original</th>
                          <th>Fecha de Subida</th>
                          <th style={{ width: 120 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedDocs.map((rec, idx) => (
                          <tr key={rec.id || idx}>
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
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Docente:</span>
                          <strong style={{ fontSize: 14 }}>{previewUploadedDoc.userName || selectedDocente.nombre}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Código:</span>
                          <strong className="font-mono" style={{ fontSize: 13 }}>{previewUploadedDoc.userCodigo || selectedDocente.codigo}</strong>
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

            {/* Document Preview Modal */}
            {previewDoc && (
              <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
                <div className="doc-modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
                  <div className="doc-modal-header">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gold" />
                      <h4>Vista Previa del Documento Docente</h4>
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
                          <span className="text-muted block">Docente Titular:</span>
                          <strong className="text-white">{selectedDocente.nombre}</strong>
                        </div>
                        <div>
                          <span className="text-muted block">Código Institucional:</span>
                          <strong className="text-gold">{selectedDocente.codigo || `DOC-2024-00${selectedDocente.id}`}</strong>
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
                      Documento oficial digitalizado verificado por la Dirección de Kardex de la EMI con firma y sello electrónico.
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
                        downloadSingleDocument(previewDoc, selectedDocente, 'Docente')
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
          </div>
        )}

        {/* TAB 4: Materias */}
        {detailTab === 'materias' && (
          <div className="fade-in table-container">
            <div className="table-header">
              <BookOpen size={16} className="text-gold" />
              <span className="table-title">Materias Asignadas</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Materia</th>
                    <th>Carrera</th>
                    <th>Gestión</th>
                    <th>Estudiantes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="font-mono text-gold">SIS-501</span></td>
                    <td>Sistemas Operativos</td>
                    <td>Ingeniería de Sistemas</td>
                    <td>1/2024</td>
                    <td><span className="badge badge-chain">42 estudiantes</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-mono text-gold">SIS-401</span></td>
                    <td>Base de Datos Avanzados</td>
                    <td>Ingeniería de Sistemas</td>
                    <td>1/2024</td>
                    <td><span className="badge badge-chain">38 estudiantes</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Historial */}
        {detailTab === 'historial' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Historial de Registro en Blockchain</h4>
            <div className="flex flex-col gap-2 font-mono text-xs text-secondary">
              <div>• 20/05/2024 08:23 - Calificaciones registradas para SIS-501 (Hash: 0xa3f4e2...)</div>
              <div>• 15/03/2024 10:30 - Registro de perfil docente verificado en blockchain (Hash: 0x9a7b...)</div>
            </div>
          </div>
        )}

        {/* TAB 6: Certificados */}
        {detailTab === 'certificados' && (
          <div className="fade-in card p-4">
            <h4 className="font-display text-sm font-bold mb-3">Certificados Docentes Emitidos</h4>
            <div className="badge badge-gold">Certificado de Ejercicio Docente EMI - 2024</div>
          </div>
        )}
      </div>
    )
  }

  /* ============================================================ */
  /* DOCENTES TABLE LIST VIEW (ADMIN ROLE DEFAULT)                 */
  /* ============================================================ */
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Docentes</h1>
          <p className="page-subtitle">{filtered.length} docentes registrados (almacenamiento inmutable)</p>
        </div>
        <button id="newDocenteBtn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo Docente
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={14} />
          <input
            id="searchDocente"
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o CI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <Users size={16} className="text-gold" />
          <span className="table-title">Cuerpo Docente</span>
          <span className="badge badge-muted">{filtered.length}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>C.I.</th>
                <th>Nombre Completo</th>
                <th>Especialidad</th>
                <th>Grado</th>
                <th>Materias</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><span className="font-mono" style={{ fontSize: 11 }}>{d.ci}</span></td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => setSelectedDocente(d)}
                      title="Ver detalle del docente"
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #162438, #1e3654)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--color-gold-400)', flexShrink: 0
                      }}>
                        {d.nombre.split(' ').slice(-1)[0].charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }} className="text-hover-gold">{d.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{d.especialidad}</td>
                  <td><span className="badge badge-gold">{d.grado}</span></td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-chain">{d.materias}</span></td>
                  <td><span className={`badge ${d.estado === 'ACTIVO' ? 'badge-success' : 'badge-muted'}`}>{d.estado}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => setSelectedDocente(d)} title="Ver Detalle"><Eye size={13} /></button>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => {
                          const ok = downloadCompleteDossier(d, DOCENTE_DOCUMENTS, 'Docente')
                          if (ok) toast.success(`Descargando expediente completo de ${d.nombre}`)
                          else toast.error('Error al descargar expediente')
                        }}
                        title="Descargar Expediente Completo (PDF)"
                      >
                        <Download size={13} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(d)} title="Editar"><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d.id)} title="Eliminar"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Nuevo / Editar Docente */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal fade-in" style={{ maxWidth: 540 }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div className="flex items-center gap-2">
                <Plus size={18} style={{ color: '#a855f7' }} />
                <span className="modal-title font-display" style={{ fontSize: 15 }}>
                  {editing ? 'Editar Docente' : 'Nuevo Docente'}
                </span>
              </div>
              <button
                className="btn btn-outline btn-icon btn-sm"
                onClick={() => setShowModal(false)}
                style={{ borderRadius: '50%', width: 28, height: 28, padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: 24 }}>
              <div className="grid-2 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    C.I. *
                  </label>
                  <input
                    id="formDocenteCI"
                    className="form-input font-mono"
                    placeholder="12345678"
                    maxLength={10}
                    value={form.ci}
                    onKeyDown={(e) => {
                      if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                        toast.error('El carnet (C.I.) solo debe contener números.', { id: 'docente-ci-err' })
                      }
                    }}
                    onChange={e => {
                      const raw = e.target.value
                      const clean = raw.replace(/\D/g, '').slice(0, 10)
                      if (raw !== clean && /[a-zA-Z]/.test(raw)) {
                        toast.error('No se permiten letras en el carnet.', { id: 'docente-ci-err' })
                      }
                      setForm({ ...form, ci: clean })
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Solo números (máximo 10 dígitos).
                  </span>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    GRADO ACADÉMICO
                  </label>
                  <select
                    id="formDocenteGrado"
                    className="form-input form-select"
                    value={form.grado}
                    onChange={e => setForm({ ...form, grado: e.target.value })}
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Magíster">Magíster</option>
                    <option value="Licenciado">Licenciado</option>
                    <option value="Ingeniero">Ingeniero</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                  NOMBRE COMPLETO *
                </label>
                <input
                  id="formDocenteNombre"
                  className="form-input"
                  placeholder="Ej. Dr. Roberto Vargas Mendoza"
                  value={form.nombre}
                  onKeyDown={(e) => {
                    if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault()
                      toast.error('Solo se permiten letras en el nombre completo.', { id: 'docente-nombre-err' })
                    }
                  }}
                  onChange={e => {
                    const raw = e.target.value
                    const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]/g, '')
                    if (raw !== clean && /[0-9]/.test(raw)) {
                      toast.error('No se permiten números en el nombre completo.', { id: 'docente-nombre-err' })
                    }
                    setForm({ ...form, nombre: clean })
                  }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Solo letras y espacios (sin números).
                </span>
              </div>

              <div className="grid-2 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    ESPECIALIDAD
                  </label>
                  <input
                    id="formDocenteEsp"
                    className="form-input"
                    placeholder="Ej. Sistemas Operativos"
                    value={form.especialidad}
                    onChange={e => setForm({ ...form, especialidad: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    CARRERA / FACULTAD
                  </label>
                  <select
                    id="formDocenteCarrera"
                    className="form-input form-select"
                    value={form.carrera}
                    onChange={e => setForm({ ...form, carrera: e.target.value })}
                  >
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                    <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
                  </select>
                </div>
              </div>

              <div className="grid-2 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    TELÉFONO / CELULAR
                  </label>
                  <input
                    id="formDocenteTelefono"
                    className="form-input"
                    placeholder="+591 7XXXXXXX"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                    DIRECCIÓN DE DOMICILIO
                  </label>
                  <input
                    id="formDocenteDireccion"
                    className="form-input"
                    placeholder="Av. Ballivián Nº..."
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                  EMAIL INSTITUCIONAL
                </label>
                <input
                  id="formDocenteEmail"
                  className="form-input"
                  placeholder="nombre@emi.edu.bo"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Field: CREAR CONTRASEÑA */}
              <div className="form-group mb-0">
                <label className="form-label" style={{ fontSize: 11, letterSpacing: '0.08em', color: '#94a3b8' }}>
                  CREAR CONTRASEÑA
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="formDocentePassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 20px', borderRadius: 8 }}
              >
                Cancelar
              </button>
              <button
                id="saveDocenteBtn"
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!form.nombre || !form.ci}
                style={{ padding: '8px 24px', borderRadius: 8 }}
              >
                {editing ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
