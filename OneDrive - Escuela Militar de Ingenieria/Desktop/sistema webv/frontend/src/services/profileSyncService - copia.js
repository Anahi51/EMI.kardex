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

// ── 1. ESTUDIANTE ────────────────────────────────────────────────
export const getStudentProfile = (currentUser) => {
  const list = getList('emi_estudiantes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  const match = list.find(s =>
    (qCod && s.codigo && s.codigo.toLowerCase() === qCod) ||
    (qEmail && s.email && s.email.toLowerCase() === qEmail) ||
    (qCi && s.ci && s.ci.toLowerCase() === qCi) ||
    (qName && s.nombre && s.nombre.toLowerCase() === qName)
  )

  return match || {
    nombre: currentUser?.name || 'Yhadel armin rojas guarachi',
    codigo: currentUser?.codigo || 'H551-8',
    carrera: currentUser?.carrera || 'Ingeniería de Sistemas',
    semestre_actual: currentUser?.semestre || '6to',
    email: currentUser?.email || currentUser?.username || 'yrojas@emi.edu.bo',
    telefono: currentUser?.telefono || '+591 71234567',
    direccion: currentUser?.direccion || 'Av. Arce Nº 2456, La Paz',
    ci: currentUser?.ci || `${currentUser?.codigo || 'H551-8'} LP`,
    genero: currentUser?.genero || 'Masculino',
    fechaNacimiento: currentUser?.fechaNacimiento || '14/06/2002',
    estado: 'ACTIVO',
    promedio: 88.5,
  }
}

export const syncUpdateStudentProfile = async (currentUser, updated) => {
  const list = getList('emi_estudiantes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  let studentId = null
  let matchedIndex = list.findIndex(s =>
    (qCod && s.codigo && s.codigo.toLowerCase() === qCod) ||
    (qEmail && s.email && s.email.toLowerCase() === qEmail) ||
    (qCi && s.ci && s.ci.toLowerCase() === qCi) ||
    (qName && s.nombre && s.nombre.toLowerCase() === qName)
  )

  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : 'H551-8'),
    nombre: updated.nombre,
    carrera: updated.carrera,
    semestre_actual: updated.semestre || updated.semestre_actual || '6to',
    semestre: updated.semestre || updated.semestre_actual || '6to',
    email: updated.email,
    telefono: updated.telefono,
    direccion: updated.direccion,
    ci: updated.ci,
    genero: updated.genero || 'Masculino',
    fechaNacimiento: updated.fechaNacimiento || '14/06/2002',
    estado: updated.estado || 'ACTIVO',
    promedio: matchedIndex >= 0 ? list[matchedIndex].promedio : 88.5,
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    studentId = list[matchedIndex].id
    list[matchedIndex] = updatedRecord
  } else {
    studentId = updatedRecord.id
    list.unshift(updatedRecord)
  }

  // Guardar en emi_estudiantes
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

  // Notificar a toda la ventana para actualización en caliente
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
    ...(updated.password ? { password: updated.password } : {}),
  }
}

// ── 2. DOCENTE ───────────────────────────────────────────────────
export const getDocenteProfile = (currentUser) => {
  const list = getList('emi_docentes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  const match = list.find(d =>
    (qCod && d.codigo && d.codigo.toLowerCase() === qCod) ||
    (qEmail && d.email && d.email.toLowerCase() === qEmail) ||
    (qCi && d.ci && d.ci.toLowerCase() === qCi) ||
    (qName && d.nombre && d.nombre.toLowerCase() === qName)
  )

  return match || {
    nombre: currentUser?.name || 'Dr. Roberto Vargas Mendoza',
    codigo: currentUser?.codigo || 'DOC-2024-0018',
    ci: currentUser?.ci || '12345678',
    email: currentUser?.email || currentUser?.username || 'r.vargas@emi.edu.bo',
    telefono: currentUser?.telefono || '+591 76543210',
    direccion: currentUser?.direccion || 'Av. Ballivián Nº 1234, Sopocachi',
    especialidad: currentUser?.especialidad || 'Sistemas Operativos',
    grado: currentUser?.grado || 'Doctor',
    carrera: currentUser?.carrera || 'Ingeniería de Sistemas',
    materias: 3,
    estado: 'ACTIVO',
  }
}

export const syncUpdateDocenteProfile = async (currentUser, updated) => {
  const list = getList('emi_docentes', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  let docenteId = null
  let matchedIndex = list.findIndex(d =>
    (qCod && d.codigo && d.codigo.toLowerCase() === qCod) ||
    (qEmail && d.email && d.email.toLowerCase() === qEmail) ||
    (qCi && d.ci && d.ci.toLowerCase() === qCi) ||
    (qName && d.nombre && d.nombre.toLowerCase() === qName)
  )

  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : 'DOC-2024-0018'),
    nombre: updated.nombre,
    ci: updated.ci,
    email: updated.email,
    telefono: updated.telefono,
    direccion: updated.direccion,
    especialidad: updated.especialidad,
    grado: updated.grado,
    carrera: updated.carrera,
    estado: updated.estado || 'ACTIVO',
    materias: matchedIndex >= 0 ? list[matchedIndex].materias : 3,
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    docenteId = list[matchedIndex].id
    list[matchedIndex] = updatedRecord
  } else {
    docenteId = updatedRecord.id
    list.unshift(updatedRecord)
  }

  saveList('emi_docentes', list)

  updateCreatedUsers(currentUser?.email || currentUser?.username || currentUser?.ci, {
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    role: 'Docente',
    especialidad: updatedRecord.especialidad,
    carrera: updatedRecord.carrera,
    ...(updated.password ? { password: updated.password } : {}),
  })

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
    especialidad: updatedRecord.especialidad,
    grado: updatedRecord.grado,
    carrera: updatedRecord.carrera,
    telefono: updatedRecord.telefono,
    direccion: updatedRecord.direccion,
    ...(updated.password ? { password: updated.password } : {}),
  }
}

// ── 3. ADMINISTRATIVO ────────────────────────────────────────────
export const getAdministrativoProfile = (currentUser) => {
  const list = getList('emi_administrativos', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  const match = list.find(a =>
    (qCod && a.codigo && a.codigo.toLowerCase() === qCod) ||
    (qEmail && a.email && a.email.toLowerCase() === qEmail) ||
    (qCi && a.ci && a.ci.toLowerCase() === qCi) ||
    (qName && a.nombre && a.nombre.toLowerCase() === qName)
  )

  return match || {
    nombre: currentUser?.name || 'Lic. Carmen Rodríguez Vidal',
    codigo: currentUser?.codigo || 'ADM-2024-001',
    ci: currentUser?.ci || '10234567',
    cargo: currentUser?.cargo || 'Jefe de Secretaría',
    area: currentUser?.area || 'Secretaría General',
    email: currentUser?.email || currentUser?.username || 'c.rodriguez@emi.edu.bo',
    telefono: currentUser?.telefono || '+591 72345678',
    direccion: currentUser?.direccion || 'Av. Ejército 123, La Paz',
    turno: currentUser?.turno || 'Mañana',
    gradoAcademico: currentUser?.gradoAcademico || 'Licenciatura',
    estado: 'ACTIVO',
  }
}

export const syncUpdateAdministrativoProfile = async (currentUser, updated) => {
  const list = getList('emi_administrativos', [])
  const qCod = (currentUser?.codigo || '').toLowerCase()
  const qEmail = (currentUser?.email || currentUser?.username || '').toLowerCase()
  const qCi = (currentUser?.ci || '').toLowerCase()
  const qName = (currentUser?.name || '').toLowerCase()

  let matchedIndex = list.findIndex(a =>
    (qCod && a.codigo && a.codigo.toLowerCase() === qCod) ||
    (qEmail && a.email && a.email.toLowerCase() === qEmail) ||
    (qCi && a.ci && a.ci.toLowerCase() === qCi) ||
    (qName && a.nombre && a.nombre.toLowerCase() === qName)
  )

  const updatedRecord = {
    ...(matchedIndex >= 0 ? list[matchedIndex] : {}),
    id: matchedIndex >= 0 ? list[matchedIndex].id : Date.now(),
    codigo: updated.codigo || currentUser?.codigo || (matchedIndex >= 0 ? list[matchedIndex].codigo : 'ADM-2024-001'),
    nombre: updated.nombre,
    ci: updated.ci,
    email: updated.email,
    telefono: updated.telefono,
    direccion: updated.direccion,
    cargo: updated.cargo,
    area: updated.area,
    turno: updated.turno,
    gradoAcademico: updated.gradoAcademico,
    estado: updated.estado || 'ACTIVO',
    ...(updated.password ? { password: updated.password } : {}),
  }

  if (matchedIndex >= 0) {
    list[matchedIndex] = updatedRecord
  } else {
    list.unshift(updatedRecord)
  }

  saveList('emi_administrativos', list)

  updateCreatedUsers(currentUser?.email || currentUser?.username || currentUser?.ci, {
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    role: 'Administrativo',
    cargo: updatedRecord.cargo,
    area: updatedRecord.area,
    ...(updated.password ? { password: updated.password } : {}),
  })

  window.dispatchEvent(new CustomEvent('emi_administrativos_updated', { detail: updatedRecord }))
  window.dispatchEvent(new Event('storage'))

  return {
    ...currentUser,
    name: updatedRecord.nombre,
    email: updatedRecord.email,
    username: updatedRecord.email,
    ci: updatedRecord.ci,
    cargo: updatedRecord.cargo,
    area: updatedRecord.area,
    turno: updatedRecord.turno,
    gradoAcademico: updatedRecord.gradoAcademico,
    telefono: updatedRecord.telefono,
    direccion: updatedRecord.direccion,
    ...(updated.password ? { password: updated.password } : {}),
  }
}
