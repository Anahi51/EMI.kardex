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
 * @param {Object} userInfo   - { key, name, role, codigo }
 * @returns {Promise<Object>} - El registro guardado
 */
export const uploadDoc = (file, docId, docTitle, userInfo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const all = getAllUploadedDocs()
        const userKey = (userInfo.key || userInfo.email || '').toLowerCase()

        // Eliminar versión previa del mismo documento del mismo usuario
        const filtered = all.filter(d => !(d.userKey === userKey && d.docId === docId))

        const record = {
          id:         `${userKey}_${docId}`,
          docId,
          docTitle,
          fileName:   file.name,
          fileData:   e.target.result,   // base64 data URL
          fileType:   file.type,
          uploadedAt: new Date().toLocaleString('es-BO'),
          userKey,
          userName:   userInfo.name    || '',
          userRole:   userInfo.role    || '',
          userCodigo: userInfo.codigo  || '',
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, record]))
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
}

/**
 * Descargar un documento subido (abre una nueva pestaña o descarga)
 * @param {Object} record - Registro del documento subido
 */
export const downloadUploadedDoc = (record) => {
  if (!record?.fileData) return false
  try {
    const link = document.createElement('a')
    link.href = record.fileData
    link.download = record.fileName || `${record.docTitle}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch {
    return false
  }
}

/**
 * Obtener documentos de un usuario por email/código (para vista admin)
 * Busca también por codigo para encontrar estudiantes registrados
 */
export const getDocsByUserEmail = (email) => {
  if (!email) return []
  const all = getAllUploadedDocs()
  const q = email.toLowerCase()
  return all.filter(d => d.userKey === q)
}
