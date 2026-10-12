/**
 * ================================================================
 * ARCHIVO: docUploadService.js
 * MÓDULO:  Servicio de Subida de Documentos (localStorage / base64)
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * Los documentos se almacenan en localStorage bajo la clave
 * 'emi_uploaded_docs' como un array de objetos:
 * [
 *   {
 *     id:          string,   // `${userKey}_${docId}`
 *     docId:       number,   // ID del documento según la lista de requerimientos
 *     docTitle:    string,   // Nombre del documento
 *     fileName:    string,   // Nombre original del archivo
 *     fileData:    string,   // base64 del archivo (data URL)
 *     fileType:    string,   // MIME type del archivo
 *     uploadedAt:  string,   // Fecha y hora de subida
 *     userKey:     string,   // email o identificador único del usuario
 *     userName:    string,   // Nombre completo del usuario
 *     userRole:    string,   // 'Estudiante' | 'Docente' | 'Administrativo'
 *     userCodigo:  string,   // Código del usuario
 *   }
 * ]
 * ================================================================
 */

const STORAGE_KEY = 'emi_uploaded_docs'

/** Obtener todos los documentos subidos (para el admin) */
export const getAllUploadedDocs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

/** Obtener documentos de un usuario específico */
export const getUserUploadedDocs = (userKey) => {
  const all = getAllUploadedDocs()
  return all.filter(d => d.userKey === userKey?.toLowerCase?.())
}

/** Obtener un documento específico de un usuario */
export const getUserDoc = (userKey, docId) => {
  const all = getAllUploadedDocs()
  return all.find(d => d.userKey === userKey?.toLowerCase?.() && d.docId === docId) || null
}

/**
 * Subir / actualizar un documento
 * @param {File} file         - Archivo seleccionado por el usuario
 * @param {number} docId      - ID del documento dentro del listado
 * @param {string} docTitle   - Título descriptivo del documento
 * @param {Object} userInfo   - { key, name, role, codigo, email, ci }
 * @returns {Promise<Object>} - El registro guardado
 */
export const uploadDoc = (file, docId, docTitle, userInfo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const all = getAllUploadedDocs()
        const userKey = (userInfo.key || userInfo.email || userInfo.username || userInfo.codigo || '').toLowerCase()

        // Eliminar versión previa del mismo documento del mismo usuario
        const filtered = all.filter(d => !(
          (d.userKey === userKey || (userInfo.email && d.userEmail?.toLowerCase() === userInfo.email.toLowerCase())) &&
          d.docId === docId
        ))

        const record = {
          id:         `${userKey}_${docId}_${Date.now()}`,
          docId,
          docTitle,
          fileName:   file.name,
          fileData:   e.target.result,   // base64 data URL
          fileType:   file.type,
          fileSize:   file.size,
          uploadedAt: new Date().toLocaleString('es-BO'),
          userKey,
          userName:   userInfo.name    || '',
          userEmail:  userInfo.email   || userKey,
          userRole:   userInfo.role    || '',
          userCodigo: userInfo.codigo  || '',
          userCI:     userInfo.ci      || '',
        }

        const updatedList = [...filtered, record]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))

        // Notificar a otras vistas que se actualizaron los documentos
        try {
          window.dispatchEvent(new CustomEvent('emi_docs_updated', { detail: record }))
        } catch {}

        resolve(record)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/** Eliminar un documento subido */
export const deleteUploadedDoc = (userKey, docId) => {
  const all = getAllUploadedDocs()
  const updated = all.filter(d => !(d.userKey === userKey?.toLowerCase?.() && d.docId === docId))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  try {
    window.dispatchEvent(new CustomEvent('emi_docs_updated'))
  } catch {}
}

/**
 * Descargar un documento subido (abre descarga en el navegador)
 * @param {Object} record - Registro del documento subido
 */
export const downloadUploadedDoc = (record) => {
  if (!record?.fileData) return false
  try {
    const link = document.createElement('a')
    link.href = record.fileData
    link.download = record.fileName || `${record.docTitle || 'documento'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch {
    return false
  }
}

/**
 * Obtener todos los documentos subidos por una persona (estudiante, docente o administrativo)
 * Busca exhaustivamente por email, código, CI o nombre
 * @param {Object} person
 * @returns {Array}
 */
export const getDocsForPerson = (person) => {
  if (!person) return []
  const all = getAllUploadedDocs()
  const pEmail = (person.email || '').toLowerCase().trim()
  const pCodigo = (person.codigo || '').toLowerCase().trim()
  const pCI = (person.ci || '').toLowerCase().trim()
  const pUser = (person.username || '').toLowerCase().trim()
  const pName = (person.nombre || person.name || '').toLowerCase().trim()

  return all.filter(doc => {
    const dKey = (doc.userKey || '').toLowerCase().trim()
    const dEmail = (doc.userEmail || '').toLowerCase().trim()
    const dCodigo = (doc.userCodigo || '').toLowerCase().trim()
    const dCI = (doc.userCI || '').toLowerCase().trim()
    const dName = (doc.userName || '').toLowerCase().trim()

    // 1. Coincidencia por email
    if (pEmail && (dKey === pEmail || dEmail === pEmail)) return true
    // 2. Coincidencia por código
    if (pCodigo && (dKey === pCodigo || dCodigo === pCodigo)) return true
    // 3. Coincidencia por CI
    if (pCI && (dKey === pCI || dCI === pCI)) return true
    // 4. Coincidencia por username
    if (pUser && (dKey === pUser || dEmail === pUser)) return true
    // 5. Coincidencia por nombre exacto o contenido
    if (pName && dName && (pName === dName || pName.includes(dName) || dName.includes(pName))) return true

    return false
  })
}

/**
 * Normalizar texto para comparación sin acentos ni mayúsculas
 */
const normalizeText = (s) => (s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

/**
 * Obtiene el documento específico para una carpeta (por docId o title) de una persona
 * @param {Object} person
 * @param {Object} docSlot - { id, num, title }
 * @returns {Object|null}
 */
export const getPersonDocForSlot = (person, docSlot) => {
  const userDocs = getDocsForPerson(person)
  if (!userDocs || userDocs.length === 0) return null

  // 1. Coincidencia por ID de documento
  const slotId = docSlot?.id !== undefined ? docSlot.id : docSlot?.num
  if (slotId !== undefined) {
    const byId = userDocs.find(d => Number(d.docId) === Number(slotId))
    if (byId) return byId
  }

  // 2. Coincidencia por título o alias
  const slotTitle = normalizeText(docSlot?.title)
  if (slotTitle) {
    const byTitle = userDocs.find(d => {
      const dt = normalizeText(d.docTitle)
      return dt === slotTitle || dt.includes(slotTitle) || slotTitle.includes(dt)
    })
    if (byTitle) return byTitle
  }

  return null
}

/**
 * Obtener documentos de un usuario por email/código (para vista admin)
 */
export const getDocsByUserEmail = (email) => {
  if (!email) return []
  const all = getAllUploadedDocs()
  const q = email.toLowerCase()
  return all.filter(d => d.userKey === q || d.userEmail?.toLowerCase() === q)
}

