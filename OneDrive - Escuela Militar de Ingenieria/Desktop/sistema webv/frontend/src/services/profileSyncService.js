/**
 * ================================================================
 * ARCHIVO: profileSyncService.js
 * MÓDULO:  Sincronización Bidireccional de Perfiles y Datos de Usuario
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * Permite que un Estudiante, Docente o Personal Administrativo
 * edite sus datos personales, laborales y académicos desde su
 * propio acceso y estos se sincronicen de inmediato con:
 *   1. El estado global y localStorage (authStore / emi_user).
 *   2. Las listas principales del Administrador:
 *      - emi_estudiantes       (Gestión de Estudiantes)
 *      - emi_docentes          (Gestión de Docentes)
 *      - emi_administrativos   (Personal Administrativo)
 *   3. El registro de credenciales de login (created_users).
 *   4. La API del backend (Django) si está conectada.
 * ================================================================
 */

import { estudiantesService, docentesService } from './api'

// ── Helpers ──────────────────────────────────────────────────────
const getList = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const saveList = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Error guardando en ${key}:`, err)
  }
}

const updateCreatedUsers = (queryKey, newUserData) => {
  try {
    const users = getList('created_users', [])
    const q = (queryKey || '').toLowerCase()
    const index = users.findIndex(u =>
      (u.email && u.email.toLowerCase() === q) ||
      (u.username && u.username.toLowerCase() === q) ||
      (u.codigo && u.codigo.toLowerCase() === q) ||
      (u.ci && u.ci.toLowerCase() === q)
    )

    if (index >= 0) {
      users[index] = { ...users[index], ...newUserData }
    } else {
      users.push(newUserData)
    }
    saveList('created_users', users)
  } catch (err) {
    console.error('Error actualizando created_users:', err)
  }
}

// Helper para actualizar nombre/código/CI en los documentos que el usuario haya subido
export const updateDocsUserInfo = (oldKeys, newInfo) => {
  try {
    const raw = localStorage.getItem('emi_uploaded_docs')
    if (!raw) return
    const docs = JSON.parse(raw)
    let changed = false
    const validKeys = (oldKeys || []).filter(Boolean).map(k => String(k).toLowerCase())
    const updatedDocs = docs.map(d => {
      const dKey = (d.userKey || '').toLowerCase()
      const dEmail = (d.userEmail || '').toLowerCase()
      const dCod = (d.userCodigo || '').toLowerCase()
      const dCi = (d.userCI || '').toLowerCase()
      const isMatch = validKeys.some(k => k === dKey || k === dEmail || k === dCod || k === dCi)
      if (isMatch) {
        changed = true
        return {
          ...d,
          userName: newInfo.nombre || d.userName,
          userCodigo: newInfo.codigo || d.userCodigo,
          userCI: newInfo.ci || d.userCI,
          userEmail: newInfo.email || d.userEmail,
        }
      }
      return d
    })
    if (changed) {
      localStorage.setItem('emi_uploaded_docs', JSON.stringify(updatedDocs))
      try {
        window.dispatchEvent(new CustomEvent('emi_docs_updated'))
      } catch {}
    }
  } catch (e) {
    console.error('Error actualizando info en docs subidos:', e)
  }
}

// ── 1. ESTUDIANTE ────────────────────────────────────────────────
export const getStudentProfile = (currentUser) => {
  const list = getList('emi_estudiantes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  const match = (qCod || qEmail || qCi || (qName && !['estudiante', 'cdte. juan mamani'].includes(qName))) ? list.find(s =>
    (qCod && s.codigo && s.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && s.email && s.email.toLowerCase().trim() === qEmail) ||
    (qCi && s.ci && s.ci.toLowerCase().trim() === qCi) ||
    (qName && s.nombre && s.nombre.toLowerCase().trim() === qName)
  ) : null

  if (match) {
    return {
      ...match,
      isNew: !match.nombre || match.nombre.trim() === '',
    }
  }

  // Al iniciar sesión por primera vez: DATOS VACÍOS para que el estudiante los llene
  return {
    nombre: (currentUser?.name && !['cdte. juan mamani', 'estudiante'].includes(currentUser.name.toLowerCase())) ? currentUser.name : '',
    codigo: currentUser?.codigo || '',
    carrera: currentUser?.carrera || '',
    semestre_actual: currentUser?.semestre || '',
    semestre: currentUser?.semestre || '',
    email: currentUser?.email || currentUser?.username || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    ci: currentUser?.ci || '',
    genero: currentUser?.genero || '',
    fechaNacimiento: currentUser?.fechaNacimiento || '',
    turno: currentUser?.turno || '',
    tutorAcademico: currentUser?.tutorAcademico || '',
    modalidadIngreso: currentUser?.modalidadIngreso || '',
    contactoEmergenciaNombre: currentUser?.contactoEmergenciaNombre || '',
    contactoEmergenciaTelefono: currentUser?.contactoEmergenciaTelefono || '',
    contactoEmergenciaParentesco: currentUser?.contactoEmergenciaParentesco || '',
    contactoEmergenciaDireccion: currentUser?.contactoEmergenciaDireccion || '',
    estado: 'ACTIVO',
    promedio: 0,
    isNew: true,
  }
}

export const syncUpdateStudentProfile = async (currentUser, updated) => {
  const list = getList('emi_estudiantes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  let studentId = null
  let matchedIndex = list.findIndex(s =>
    (qCod && s.codigo && s.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && s.email && s.email.toLowerCase().trim() === qEmail) ||
    (qCi && s.ci && s.ci.toLowerCase().trim() === qCi) ||
    (qName && s.nombre && s.nombre.toLowerCase().trim() === qName)
  )

  const generatedCod = `H${Math.floor(100 + Math.random() * 900)}-${Math.floor(1 + Math.random() * 9)}`
  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : generatedCod),
    nombre: updated.nombre || '',
    carrera: updated.carrera || 'Ingeniería de Sistemas',
    semestre_actual: updated.semestre || updated.semestre_actual || '1ro',
    semestre: updated.semestre || updated.semestre_actual || '1ro',
    email: updated.email || currentUser?.email || '',
    telefono: updated.telefono || '',
    direccion: updated.direccion || '',
    ci: updated.ci || '',
    genero: updated.genero || '',
    fechaNacimiento: updated.fechaNacimiento || '',
    turno: updated.turno || (matchedIndex >= 0 ? list[matchedIndex].turno : 'Mañana'),
    tutorAcademico: updated.tutorAcademico !== undefined ? updated.tutorAcademico : (matchedIndex >= 0 ? list[matchedIndex].tutorAcademico : ''),
    modalidadIngreso: updated.modalidadIngreso !== undefined ? updated.modalidadIngreso : (matchedIndex >= 0 ? list[matchedIndex].modalidadIngreso : ''),
    contactoEmergenciaNombre: updated.contactoEmergenciaNombre !== undefined ? updated.contactoEmergenciaNombre : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaNombre : ''),
    contactoEmergenciaTelefono: updated.contactoEmergenciaTelefono !== undefined ? updated.contactoEmergenciaTelefono : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaTelefono : ''),
    contactoEmergenciaParentesco: updated.contactoEmergenciaParentesco !== undefined ? updated.contactoEmergenciaParentesco : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaParentesco : ''),
    contactoEmergenciaDireccion: updated.contactoEmergenciaDireccion !== undefined ? updated.contactoEmergenciaDireccion : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaDireccion : ''),
    estado: updated.estado || 'ACTIVO',
    promedio: matchedIndex >= 0 ? (list[matchedIndex].promedio || 0) : 0,
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    studentId = list[matchedIndex].id
    list[matchedIndex] = updatedRecord
  } else {
    studentId = updatedRecord.id
    list.unshift(updatedRecord)
  }

  // Guardar en emi_estudiantes para que aparezca en el acceso del administrador
  saveList('emi_estudiantes', list)

  // Actualizar credenciales de login
  updateCreatedUsers(currentUser?.email || currentUser?.username || currentUser?.codigo, {
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    codigo: updatedRecord.codigo,
    ci: updatedRecord.ci,
    role: 'Estudiante',
    carrera: updatedRecord.carrera,
    ...(updated.password ? { password: updated.password } : {}),
  })

  // Sincronizar documentos previamente subidos con el nuevo nombre/código
  updateDocsUserInfo([currentUser?.email, currentUser?.username, currentUser?.codigo, currentUser?.ci], updatedRecord)

  // Intentar sincronizar con Django
  if (studentId && typeof studentId === 'number' && studentId < 1000000) {
    try {
      await estudiantesService.update(studentId, {
        nombre: updatedRecord.nombre,
        email: updatedRecord.email,
        telefono: updatedRecord.telefono,
        semestre_actual: updatedRecord.semestre_actual,
      })
    } catch {}
  }

  // Notificar a toda la ventana para actualización en caliente inmediata
  window.dispatchEvent(new CustomEvent('emi_students_updated', { detail: updatedRecord }))
  window.dispatchEvent(new Event('storage'))

  // Devolver el objeto de usuario actualizado para authStore
  return {
    ...currentUser,
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    carrera: updatedRecord.carrera,
    semestre: updatedRecord.semestre_actual,
    telefono: updatedRecord.telefono,
    direccion: updatedRecord.direccion,
    ci: updatedRecord.ci,
    genero: updatedRecord.genero,
    fechaNacimiento: updatedRecord.fechaNacimiento,
    codigo: updatedRecord.codigo,
    turno: updatedRecord.turno,
    tutorAcademico: updatedRecord.tutorAcademico,
    modalidadIngreso: updatedRecord.modalidadIngreso,
    contactoEmergenciaNombre: updatedRecord.contactoEmergenciaNombre,
    contactoEmergenciaTelefono: updatedRecord.contactoEmergenciaTelefono,
    contactoEmergenciaParentesco: updatedRecord.contactoEmergenciaParentesco,
    contactoEmergenciaDireccion: updatedRecord.contactoEmergenciaDireccion,
    ...(updated.password ? { password: updated.password } : {}),
  }
}

// ── 2. DOCENTE ───────────────────────────────────────────────────
export const getDocenteProfile = (currentUser) => {
  const list = getList('emi_docentes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  const match = (qCod || qEmail || qCi || (qName && !['docente', 'dr. roberto vargas mendoza', 'ing. santiago m.'].includes(qName))) ? list.find(d =>
    (qCod && d.codigo && d.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && d.email && d.email.toLowerCase().trim() === qEmail) ||
    (qCi && d.ci && d.ci.toLowerCase().trim() === qCi) ||
    (qName && d.nombre && d.nombre.toLowerCase().trim() === qName)
  ) : null

  if (match) {
    return {
      ...match,
      isNew: !match.nombre || match.nombre.trim() === '',
    }
  }

  // Al iniciar sesión por primera vez: DATOS VACÍOS para que el docente los llene
  return {
    nombre: (currentUser?.name && !['docente', 'dr. roberto vargas mendoza', 'ing. santiago m.'].includes(currentUser.name.toLowerCase())) ? currentUser.name : '',
    codigo: currentUser?.codigo || '',
    ci: currentUser?.ci || '',
    email: currentUser?.email || currentUser?.username || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    especialidad: currentUser?.especialidad || '',
    grado: currentUser?.grado || '',
    carrera: currentUser?.carrera || '',
    turno: currentUser?.turno || '',
    experiencia: currentUser?.experiencia || '',
    cargaHoraria: currentUser?.cargaHoraria || '',
    contactoEmergenciaNombre: currentUser?.contactoEmergenciaNombre || '',
    contactoEmergenciaTelefono: currentUser?.contactoEmergenciaTelefono || '',
    contactoEmergenciaParentesco: currentUser?.contactoEmergenciaParentesco || '',
    contactoEmergenciaDireccion: currentUser?.contactoEmergenciaDireccion || '',
    materias: 0,
    estado: 'ACTIVO',
    isNew: true,
  }
}

export const syncUpdateDocenteProfile = async (currentUser, updated) => {
  const list = getList('emi_docentes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  let docenteId = null
  let matchedIndex = list.findIndex(d =>
    (qCod && d.codigo && d.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && d.email && d.email.toLowerCase().trim() === qEmail) ||
    (qCi && d.ci && d.ci.toLowerCase().trim() === qCi) ||
    (qName && d.nombre && d.nombre.toLowerCase().trim() === qName)
  )

  const generatedCod = `DOC-2024-${Math.floor(1000 + Math.random() * 9000)}`
  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : generatedCod),
    nombre: updated.nombre || '',
    ci: updated.ci || '',
    email: updated.email || currentUser?.email || '',
    telefono: updated.telefono || '',
    direccion: updated.direccion || '',
    especialidad: updated.especialidad || '',
    grado: updated.grado || 'Licenciado',
    carrera: updated.carrera || 'Ingeniería de Sistemas',
    turno: updated.turno || (matchedIndex >= 0 ? list[matchedIndex].turno : 'Mañana'),
    experiencia: updated.experiencia !== undefined ? updated.experiencia : (matchedIndex >= 0 ? list[matchedIndex].experiencia : ''),
    cargaHoraria: updated.cargaHoraria !== undefined ? updated.cargaHoraria : (matchedIndex >= 0 ? list[matchedIndex].cargaHoraria : ''),
    contactoEmergenciaNombre: updated.contactoEmergenciaNombre !== undefined ? updated.contactoEmergenciaNombre : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaNombre : ''),
    contactoEmergenciaTelefono: updated.contactoEmergenciaTelefono !== undefined ? updated.contactoEmergenciaTelefono : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaTelefono : ''),
    contactoEmergenciaParentesco: updated.contactoEmergenciaParentesco !== undefined ? updated.contactoEmergenciaParentesco : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaParentesco : ''),
    contactoEmergenciaDireccion: updated.contactoEmergenciaDireccion !== undefined ? updated.contactoEmergenciaDireccion : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaDireccion : ''),
    estado: updated.estado || 'ACTIVO',
    materias: matchedIndex >= 0 ? list[matchedIndex].materias : 0,
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    docenteId = list[matchedIndex].id
    list[matchedIndex] = updatedRecord
  } else {
    docenteId = updatedRecord.id
    list.unshift(updatedRecord)
  }

  // Guardar en emi_docentes para que aparezca en el panel del administrador
  saveList('emi_docentes', list)

  // Actualizar credenciales de login
  updateCreatedUsers(currentUser?.email || currentUser?.username || currentUser?.ci, {
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    codigo: updatedRecord.codigo,
    role: 'Docente',
    especialidad: updatedRecord.especialidad,
    carrera: updatedRecord.carrera,
    ...(updated.password ? { password: updated.password } : {}),
  })

  // Sincronizar documentos previamente subidos con el nuevo nombre y CI
  updateDocsUserInfo([currentUser?.email, currentUser?.username, currentUser?.codigo, currentUser?.ci], updatedRecord)

  if (docenteId && typeof docenteId === 'number' && docenteId < 1000000) {
    try {
      await docentesService.update(docenteId, {
        nombre: updatedRecord.nombre,
        email: updatedRecord.email,
        especialidad: updatedRecord.especialidad,
      })
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('emi_docentes_updated', { detail: updatedRecord }))
  window.dispatchEvent(new Event('storage'))

  return {
    ...currentUser,
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    codigo: updatedRecord.codigo,
    especialidad: updatedRecord.especialidad,
    grado: updatedRecord.grado,
    carrera: updatedRecord.carrera,
    turno: updatedRecord.turno,
    experiencia: updatedRecord.experiencia,
    cargaHoraria: updatedRecord.cargaHoraria,
    contactoEmergenciaNombre: updatedRecord.contactoEmergenciaNombre,
    contactoEmergenciaTelefono: updatedRecord.contactoEmergenciaTelefono,
    contactoEmergenciaParentesco: updatedRecord.contactoEmergenciaParentesco,
    contactoEmergenciaDireccion: updatedRecord.contactoEmergenciaDireccion,
    telefono: updatedRecord.telefono,
    direccion: updatedRecord.direccion,
    ...(updated.password ? { password: updated.password } : {}),
  }
}

// ── 3. ADMINISTRATIVO ────────────────────────────────────────────
export const getAdministrativoProfile = (currentUser) => {
  const list = getList('emi_administrativos', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  const match = (qCod || qEmail || qCi || (qName && !['administrativo', 'lic. carmen rodríguez vidal', 'lic. rodrigo taca'].includes(qName))) ? list.find(a =>
    (qCod && a.codigo && a.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && a.email && a.email.toLowerCase().trim() === qEmail) ||
    (qCi && a.ci && a.ci.toLowerCase().trim() === qCi) ||
    (qName && a.nombre && a.nombre.toLowerCase().trim() === qName)
  ) : null

  if (match) {
    return {
      ...match,
      isNew: !match.nombre || match.nombre.trim() === '',
    }
  }

  // Al iniciar sesión por primera vez: DATOS VACÍOS para que el administrativo los llene
  return {
    nombre: (currentUser?.name && !['administrativo', 'lic. carmen rodríguez vidal', 'lic. rodrigo taca'].includes(currentUser.name.toLowerCase())) ? currentUser.name : '',
    codigo: currentUser?.codigo || '',
    ci: currentUser?.ci || '',
    cargo: currentUser?.cargo || '',
    area: currentUser?.area || '',
    email: currentUser?.email || currentUser?.username || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    turno: currentUser?.turno || '',
    gradoAcademico: currentUser?.gradoAcademico || '',
    contactoEmergenciaNombre: currentUser?.contactoEmergenciaNombre || '',
    contactoEmergenciaTelefono: currentUser?.contactoEmergenciaTelefono || '',
    contactoEmergenciaParentesco: currentUser?.contactoEmergenciaParentesco || '',
    contactoEmergenciaDireccion: currentUser?.contactoEmergenciaDireccion || '',
    estado: 'ACTIVO',
    isNew: true,
  }
}

export const syncUpdateAdministrativoProfile = async (currentUser, updated) => {
  const list = getList('emi_administrativos', [])
  const qCod = (currentUser?.codigo || '').toLowerCase().trim()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase().trim()
  const qCi = (currentUser?.ci || '').toLowerCase().trim()
  const qName = (currentUser?.name || '').toLowerCase().trim()

  let matchedIndex = list.findIndex(a =>
    (qCod && a.codigo && a.codigo.toLowerCase().trim() === qCod) ||
    (qEmail && a.email && a.email.toLowerCase().trim() === qEmail) ||
    (qCi && a.ci && a.ci.toLowerCase().trim() === qCi) ||
    (qName && a.nombre && a.nombre.toLowerCase().trim() === qName)
  )

  const generatedCod = `ADM-2024-${Math.floor(100 + Math.random() * 900)}`
  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : generatedCod),
    nombre: updated.nombre || '',
    ci: updated.ci || '',
    email: updated.email || currentUser?.email || '',
    telefono: updated.telefono || '',
    direccion: updated.direccion || '',
    cargo: updated.cargo || '',
    area: updated.area || '',
    turno: updated.turno || 'Mañana',
    gradoAcademico: updated.gradoAcademico || 'Licenciatura',
    contactoEmergenciaNombre: updated.contactoEmergenciaNombre !== undefined ? updated.contactoEmergenciaNombre : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaNombre : ''),
    contactoEmergenciaTelefono: updated.contactoEmergenciaTelefono !== undefined ? updated.contactoEmergenciaTelefono : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaTelefono : ''),
    contactoEmergenciaParentesco: updated.contactoEmergenciaParentesco !== undefined ? updated.contactoEmergenciaParentesco : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaParentesco : ''),
    contactoEmergenciaDireccion: updated.contactoEmergenciaDireccion !== undefined ? updated.contactoEmergenciaDireccion : (matchedIndex >= 0 ? list[matchedIndex].contactoEmergenciaDireccion : ''),
    estado: updated.estado || 'ACTIVO',
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    list[matchedIndex] = updatedRecord
  } else {
    list.unshift(updatedRecord)
  }

  // Guardar en emi_administrativos para que aparezca en el panel del administrador
  saveList('emi_administrativos', list)

  // Actualizar credenciales de login
  updateCreatedUsers(currentUser?.email || currentUser?.username || currentUser?.ci, {
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    codigo: updatedRecord.codigo,
    role: 'Administrativo',
    cargo: updatedRecord.cargo,
    area: updatedRecord.area,
    ...(updated.password ? { password: updated.password } : {}),
  })

  // Sincronizar documentos previamente subidos con el nuevo nombre y CI
  updateDocsUserInfo([currentUser?.email, currentUser?.username, currentUser?.codigo, currentUser?.ci], updatedRecord)

  window.dispatchEvent(new CustomEvent('emi_administrativos_updated', { detail: updatedRecord }))
  window.dispatchEvent(new Event('storage'))

  return {
    ...currentUser,
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    codigo: updatedRecord.codigo,
    cargo: updatedRecord.cargo,
    area: updatedRecord.area,
    turno: updatedRecord.turno,
    gradoAcademico: updatedRecord.gradoAcademico,
    telefono: updatedRecord.telefono,
    direccion: updatedRecord.direccion,
    contactoEmergenciaNombre: updatedRecord.contactoEmergenciaNombre,
    contactoEmergenciaTelefono: updatedRecord.contactoEmergenciaTelefono,
    contactoEmergenciaParentesco: updatedRecord.contactoEmergenciaParentesco,
    contactoEmergenciaDireccion: updatedRecord.contactoEmergenciaDireccion,
    ...(updated.password ? { password: updated.password } : {}),
  }
}

