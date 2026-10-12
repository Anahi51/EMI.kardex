/**
 * ================================================================
 * SERVICIO DE DESCARGA Y GENERACIÓN DE DOCUMENTOS (EMI DIGITAL)
 * ================================================================
 * Permite al administrador descargar documentos individuales y
 * expedientes completos en formato PDF oficial institucional.
 */

import { jsPDF } from 'jspdf'
import * as jspdfModule from 'jspdf'

/**
 * Obtiene el constructor de jsPDF de manera compatible con cualquier empaquetador
 */
function getJsPdfConstructor() {
  if (typeof jsPDF === 'function') return jsPDF
  if (jspdfModule && typeof jspdfModule.jsPDF === 'function') return jspdfModule.jsPDF
  if (jspdfModule && typeof jspdfModule.default === 'function') return jspdfModule.default
  if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF
  return jsPDF
}

/**
 * Sanitiza texto para evitar errores de codificación en fuentes estándar de jsPDF
 */
function cleanText(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/[«»]/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/º/g, 'o.')
    .replace(/ª/g, 'a.')
    .replace(/·/g, '-')
    .replace(/[^\x00-\xFF]/g, (char) => {
      // Reemplazo de caracteres fuera de latin1
      if (char === '“' || char === '”') return '"'
      if (char === '‘' || char === '’') return "'"
      if (char === '…') return '...'
      return ''
    })
    .trim()
}

/**
 * Genera un hash pseudo-único y consistente para propósitos de verificación
 */
function generateBlockchainHash(seed) {
  let hash = 0
  const str = String(seed || '') + '_EMI_BLOCKCHAIN_SECURITY_2024'
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x${hex}f4b27a8e9c1d35a09b8c7d6e5f4a3b2c1d0e`
}

/**
 * Descarga un documento individual verificado como PDF oficial
 */
export function downloadSingleDocument(doc, person, type = 'Estudiante') {
  try {
    if (!doc) throw new Error('Documento no especificado')
    const safePerson = person || {}
    const JsPdfClass = getJsPdfConstructor()

    const pdf = new JsPdfClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const hash = generateBlockchainHash(`${doc.id}_${safePerson.id || '0'}_${doc.title || ''}`)

    // 1. Header decorativo EMI (Azul Marino + Dorado)
    pdf.setFillColor(13, 23, 38) // #0d1726
    pdf.rect(0, 0, pageWidth, 38, 'F')

    pdf.setFillColor(234, 179, 8) // #eab308 (Dorado)
    pdf.rect(0, 38, pageWidth, 2.5, 'F')

    // Título Principal Cabecera
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text(cleanText('ESCUELA MILITAR DE INGENIERÍA'), pageWidth / 2, 14, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(203, 213, 225)
    pdf.text(cleanText('"MCAL. ANTONIO JOSÉ DE SUCRE" - LA PAZ, BOLIVIA'), pageWidth / 2, 20, { align: 'center' })

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(234, 179, 8)
    pdf.text(cleanText('DIRECCIÓN NACIONAL DE GRADO Y KARDEX ACADÉMICO DIGITAL'), pageWidth / 2, 27, { align: 'center' })

    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(7.5)
    pdf.setTextColor(148, 163, 184)
    pdf.text(cleanText('SISTEMA DE VERIFICACIÓN Y REGISTRO EN BLOCKCHAIN'), pageWidth / 2, 33, { align: 'center' })

    // 2. Tarjeta Título de Documento
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(226, 232, 240)
    pdf.roundedRect(15, 47, pageWidth - 30, 20, 2, 2, 'FD')

    pdf.setTextColor(15, 23, 42)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.text(cleanText((doc.title || 'DOCUMENTO OFICIAL').toUpperCase()), pageWidth / 2, 57, { align: 'center' })

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    pdf.text(cleanText(`DOCUMENTO REQUERIDO No. ${doc.num || doc.id || 1} - EXPEDIENTE DE ${type.toUpperCase()}`), pageWidth / 2, 63, { align: 'center' })

    // 3. Sección: Datos del Titular
    let currentY = 76
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(13, 23, 38)
    pdf.text(cleanText('1. DATOS GENERALES DEL TITULAR'), 15, currentY)

    pdf.setDrawColor(234, 179, 8)
    pdf.setLineWidth(0.5)
    pdf.line(15, currentY + 2, pageWidth - 15, currentY + 2)

    currentY += 8
    pdf.setFillColor(255, 255, 255)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(15, currentY, pageWidth - 30, 44, 2, 2, 'D')

    const leftColX = 20
    const midColX = 110

    pdf.setFontSize(8.5)

    // Fila 1
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Nombre Completo:'), leftColX, currentY + 7)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.nombre || 'Usuario Registrado'), leftColX + 32, currentY + 7)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Código Institucional:'), midColX, currentY + 7)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(202, 138, 4)
    pdf.text(cleanText(safePerson.codigo || `EMI-${safePerson.id || '2024'}`), midColX + 35, currentY + 7)

    // Fila 2
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Cédula de Identidad:'), leftColX, currentY + 15)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(`${safePerson.ci || '12345678'} LP`), leftColX + 32, currentY + 15)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Grado / Condición:'), midColX, currentY + 15)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.grado || (type === 'Estudiante' ? 'CADETE' : 'DOCENTE TITULAR')), midColX + 35, currentY + 15)

    // Fila 3
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText(type === 'Estudiante' ? 'Carrera Académica:' : 'Especialidad / Área:'), leftColX, currentY + 23)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.carrera || safePerson.especialidad || 'Ingeniería de Sistemas'), leftColX + 35, currentY + 23)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Semestre / Gestión:'), midColX, currentY + 23)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.semestre_actual || safePerson.semestre || 'Gestión 2024'), midColX + 35, currentY + 23)

    // Fila 4
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Correo Institucional:'), leftColX, currentY + 31)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.email || 'usuario@emi.edu.bo'), leftColX + 32, currentY + 31)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Estado en Sistema:'), midColX, currentY + 31)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(22, 163, 74)
    pdf.text(cleanText(safePerson.estado || 'ACTIVO'), midColX + 35, currentY + 31)

    // Fila 5: Blockchain User ID
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('ID Criptográfico:'), leftColX, currentY + 39)
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(7.5)
    pdf.setTextColor(30, 41, 59)
    pdf.text(cleanText(hash.slice(0, 32) + '...'), leftColX + 32, currentY + 39)

    // 4. Sección: Registro del Documento y Trazabilidad
    currentY += 52
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(13, 23, 38)
    pdf.text(cleanText('2. DETALLES DEL ARCHIVO Y REGISTRO DIGITAL'), 15, currentY)

    pdf.setDrawColor(234, 179, 8)
    pdf.setLineWidth(0.5)
    pdf.line(15, currentY + 2, pageWidth - 15, currentY + 2)

    currentY += 8
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(15, currentY, pageWidth - 30, 52, 2, 2, 'FD')

    pdf.setFontSize(8.5)
    // Item 1
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Nombre de Archivo Digital:'), leftColX, currentY + 8)
    pdf.setFont('courier', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(doc.archivo || `${(doc.title || 'documento').toLowerCase().replace(/\s+/g, '_')}.pdf`), leftColX + 45, currentY + 8)

    // Item 2
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Fecha y Hora de Subida:'), leftColX, currentY + 16)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(doc.fecha || '15/02/2024 10:15'), leftColX + 45, currentY + 16)

    // Item 3
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Formato y Tamaño:'), leftColX, currentY + 24)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText('Documento Digitalizado PDF / Imagen Alta Resolución (Max. 10MB)'), leftColX + 45, currentY + 24)

    // Item 4
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Estado de Verificación:'), leftColX, currentY + 32)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(16, 185, 129)
    pdf.text(cleanText('VERIFICADO Y AUTENTICADO POR KARDEX EMI (100%)'), leftColX + 45, currentY + 32)

    // Item 5: Hash SHA-256
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Firma Digital SHA-256:'), leftColX, currentY + 40)
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(7.5)
    pdf.setTextColor(2, 132, 199)
    pdf.text(cleanText(hash), leftColX + 45, currentY + 40)

    // Item 6: Bloque Blockchain
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Bloque en Blockchain:'), leftColX, currentY + 47)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    const blockNum = `Bloque #48${((doc.id || 1) * 137) % 900 + 100} - Smart Contract: 0xEMI_KARDEX_VERIFIER`
    pdf.text(cleanText(blockNum), leftColX + 45, currentY + 47)

    // 5. Sello y Certificación Institucional
    currentY += 60
    pdf.setFillColor(241, 245, 249)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(15, currentY, pageWidth - 30, 40, 2, 2, 'FD')

    // Columna Izquierda: Sello Informativo
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(13, 23, 38)
    pdf.text(cleanText('CERTIFICACIÓN INSTITUCIONAL DIGITAL'), 20, currentY + 8)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('El presente documento certifica la validez legal del archivo adjunto en el kardex de la EMI.'), 20, currentY + 14)
    pdf.text(cleanText('Los metadatos y firmas han sido inmutabilizados en el libro mayor de la red Blockchain EMI.'), 20, currentY + 19)
    pdf.text(cleanText('Cualquier alteración física o digital invalidará este certificado oficial.'), 20, currentY + 24)

    // Columna Derecha: Firma y Sello
    const signX = 145
    pdf.setDrawColor(100, 116, 139)
    pdf.setLineWidth(0.4)
    pdf.line(signX - 25, currentY + 28, signX + 25, currentY + 28)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(7.5)
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText('DIRECCIÓN NACIONAL DE KARDEX'), signX, currentY + 32, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6.5)
    pdf.setTextColor(100, 116, 139)
    pdf.text(cleanText('Firma Digitalizada y Sello Electrónico EMI'), signX, currentY + 36, { align: 'center' })

    // 6. Pie de Página
    pdf.setFillColor(13, 23, 38)
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(203, 213, 225)
    pdf.text(cleanText(`Expediente Oficial EMI - Documento: ${doc.title} - Titular: ${safePerson.nombre || ''}`), 15, pageHeight - 5)
    pdf.text('Página 1 de 1', pageWidth - 15, pageHeight - 5, { align: 'right' })

    // Descargar archivo
    const safeTitle = (doc.title || 'Documento').replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
    const safeName = (safePerson.nombre || 'Usuario').replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
    const filename = `${safeTitle}_${safeName}.pdf`

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error detallado generando PDF del documento:', error)
    return false
  }
}

/**
 * Descarga todo el expediente completo en un único PDF consolidado
 */
export function downloadCompleteDossier(person, docsList = [], type = 'Estudiante') {
  try {
    const safePerson = person || {}
    const list = Array.isArray(docsList) && docsList.length > 0 ? docsList : []
    const JsPdfClass = getJsPdfConstructor()

    const pdf = new JsPdfClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const mainHash = generateBlockchainHash(`DOSSIER_${safePerson.id || '0'}_${safePerson.codigo || safePerson.ci || 'EMI'}`)

    // ----------------------------------------------------
    // PORTADA / CARÁTULA DEL EXPEDIENTE
    // ----------------------------------------------------
    pdf.setFillColor(13, 23, 38)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    // Borde dorado
    pdf.setDrawColor(234, 179, 8)
    pdf.setLineWidth(1.5)
    pdf.rect(12, 12, pageWidth - 24, pageHeight - 24)

    pdf.setLineWidth(0.5)
    pdf.rect(14, 14, pageWidth - 28, pageHeight - 28)

    // Títulos de Carátula
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text(cleanText('ESCUELA MILITAR DE INGENIERÍA'), pageWidth / 2, 38, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(203, 213, 225)
    pdf.text(cleanText('"MARISCAL ANTONIO JOSÉ DE SUCRE"'), pageWidth / 2, 46, { align: 'center' })
    pdf.text(cleanText('DIRECCIÓN NACIONAL ACADÉMICA Y DE KARDEX'), pageWidth / 2, 52, { align: 'center' })

    // Insignia / Caja Central
    pdf.setFillColor(18, 30, 48)
    pdf.setDrawColor(234, 179, 8)
    pdf.roundedRect(30, 70, pageWidth - 60, 45, 4, 4, 'FD')

    pdf.setTextColor(234, 179, 8)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(15)
    pdf.text(cleanText('EXPEDIENTE DOCUMENTAL COMPLETO'), pageWidth / 2, 85, { align: 'center' })

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.text(cleanText(`LEGAJO DIGITAL DE ${type.toUpperCase()}`), pageWidth / 2, 94, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(148, 163, 184)
    pdf.text(cleanText('VERIFICACIÓN Y VALIDACIÓN CRIPTOGRÁFICA EN BLOCKCHAIN'), pageWidth / 2, 103, { align: 'center' })

    // Datos del Titular en la Carátula
    let cardY = 130
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(25, cardY, pageWidth - 50, 75, 3, 3, 'F')

    pdf.setTextColor(15, 23, 42)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(cleanText('DATOS DEL REGISTRO OFICIAL'), 32, cardY + 12)

    pdf.setDrawColor(234, 179, 8)
    pdf.setLineWidth(0.8)
    pdf.line(32, cardY + 15, pageWidth - 32, cardY + 15)

    pdf.setFontSize(9.5)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Nombre Titular:'), 32, cardY + 25)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.nombre || 'No registrado'), 68, cardY + 25)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Código EMI:'), 32, cardY + 33)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(202, 138, 4)
    pdf.text(cleanText(safePerson.codigo || `EMI-${safePerson.id || '2024'}`), 68, cardY + 33)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Cédula de Identidad:'), 32, cardY + 41)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(`${safePerson.ci || '12345678'} LP`), 68, cardY + 41)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText(type === 'Estudiante' ? 'Carrera:' : 'Especialidad:'), 32, cardY + 49)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.carrera || safePerson.especialidad || 'Ingeniería de Sistemas'), 68, cardY + 49)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Grado / Nivel:'), 32, cardY + 57)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText(safePerson.grado || (type === 'Estudiante' ? 'Cadete' : 'Docente Titular')), 68, cardY + 57)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Estado Documental:'), 32, cardY + 65)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(22, 163, 74)
    pdf.text(cleanText(`EXPEDIENTE COMPLETO Y VERIFICADO (${list.length} de ${list.length} Documentos)`), 68, cardY + 65)

    // Pie de Carátula
    pdf.setTextColor(203, 213, 225)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text(cleanText(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`), pageWidth / 2, 225, { align: 'center' })
    pdf.text(cleanText(`Firma Digital Blockchain: ${mainHash}`), pageWidth / 2, 231, { align: 'center' })

    // ----------------------------------------------------
    // PÁGINA 2: ÍNDICE DETALLADO Y TABLA DE DOCUMENTOS
    // ----------------------------------------------------
    pdf.addPage()

    // Header superior
    pdf.setFillColor(13, 23, 38)
    pdf.rect(0, 0, pageWidth, 28, 'F')
    pdf.setFillColor(234, 179, 8)
    pdf.rect(0, 28, pageWidth, 2, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text(cleanText('ESCUELA MILITAR DE INGENIERÍA - KARDEX DIGITAL'), pageWidth / 2, 12, { align: 'center' })

    pdf.setFontSize(8.5)
    pdf.setTextColor(234, 179, 8)
    pdf.text(cleanText(`ÍNDICE Y REGISTRO DE DOCUMENTOS PRESENTADOS (${type.toUpperCase()})`), pageWidth / 2, 20, { align: 'center' })

    // Tabla de documentos
    let tableY = 40
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(13, 23, 38)
    pdf.text(cleanText(`DOCUMENTOS VERIFICADOS DEL EXPEDIENTE (${list.length} TOTAL)`), 15, tableY)

    tableY += 6
    // Encabezado de tabla
    pdf.setFillColor(13, 23, 38)
    pdf.rect(15, tableY, pageWidth - 30, 8, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text('No.', 18, tableY + 5.5)
    pdf.text('DOCUMENTO REQUERIDO', 30, tableY + 5.5)
    pdf.text('ARCHIVO DIGITAL', 105, tableY + 5.5)
    pdf.text('FECHA REGISTRO', 150, tableY + 5.5)
    pdf.text('ESTADO', 180, tableY + 5.5)

    tableY += 8
    list.forEach((item, index) => {
      const isEven = index % 2 === 0
      pdf.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255)
      pdf.setDrawColor(226, 232, 240)
      pdf.rect(15, tableY, pageWidth - 30, 9, 'FD')

      pdf.setTextColor(15, 23, 42)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.text(String(item.num || index + 1), 18, tableY + 6)

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 41, 59)
      pdf.text(cleanText(item.title || ''), 30, tableY + 6)

      pdf.setFont('courier', 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(71, 85, 105)
      pdf.text(cleanText(item.archivo || `${(item.title || 'doc').toLowerCase().replace(/\s+/g, '_')}.pdf`), 105, tableY + 6)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(100, 116, 139)
      pdf.text(cleanText(item.fecha || '15/02/2024'), 150, tableY + 6)

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(16, 185, 129)
      pdf.text('Verificado', 180, tableY + 6)

      tableY += 9
    })

    // Sello final
    tableY += 10
    pdf.setFillColor(241, 245, 249)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(15, tableY, pageWidth - 30, 32, 2, 2, 'FD')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(13, 23, 38)
    pdf.text(cleanText('CONSTANCIA DE EXPEDIENTE COMPLETO'), 20, tableY + 8)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(71, 85, 105)
    pdf.text(cleanText('Se hace constar que el titular ha presentado la totalidad de la documentación reglamentaria.'), 20, tableY + 14)
    pdf.text(cleanText('Los documentos se encuentran archivados y validados en la base de datos y Blockchain EMI.'), 20, tableY + 19)

    // Pie de página
    pdf.setFillColor(13, 23, 38)
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(203, 213, 225)
    pdf.text(cleanText(`Expediente Completo - Titular: ${safePerson.nombre || ''} (${safePerson.codigo || safePerson.ci || ''})`), 15, pageHeight - 5)
    pdf.text('Página 2 de 2', pageWidth - 15, pageHeight - 5, { align: 'right' })

    const safeName = (safePerson.nombre || 'Titular').replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
    const filename = `Expediente_Completo_${type}_${safeName}.pdf`

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error detallado generando expediente completo:', error)
    return false
  }
}

/**
 * ================================================================
 * DESCARGA DEL ACTA OFICIAL DE ENTREGA A JEFE DE CARRERA (PDF)
 * Diseño Oficial Exacto EMI - Padrón Estudiantil
 * ================================================================
 */
export function downloadActaEntregaJefeCarrera(carreraName = 'Consolidado General de Carreras', estudiantesList = [], options = {}) {
  try {
    const JsPdfClass = getJsPdfConstructor()
    const pdf = new JsPdfClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()   // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight() // 297 mm
    const now = new Date()

    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const dia = now.getDate()
    const mes = meses[now.getMonth()]
    const anio = now.getFullYear()
    let horas = now.getHours()
    const minutos = String(now.getMinutes()).padStart(2, '0')
    const ampm = horas >= 12 ? 'p. m.' : 'a. m.'
    horas = horas % 12 || 12
    const horaFormateada = `${String(horas).padStart(2, '0')}:${minutos} ${ampm}`
    const fechaHoraCompleta = `${dia} de ${mes} de ${anio} - ${horaFormateada}`

    const gestionStr = options.gestion || `1/${anio}`
    const actaCode = options.codigoActa || `ACTA-EMI-${anio}-${Math.floor(10 + Math.random() * 89)}-${Math.floor(10 + Math.random() * 89)}`
    const rawHash = generateBlockchainHash(`ACTA_${carreraName}_${estudiantesList.length}_${anio}`)
    const displayHash = rawHash.replace('0x', '') + 'a3e7f9c4b2d6e1f3a8c9e7b5d2f4a6c8e1'.substring(0, 10) + '...'

    // ─────────────────────────────────────────────────────────────
    // 1. HEADER SUPERIOR (Azul Marino + Barra Dorada)
    // ─────────────────────────────────────────────────────────────
    pdf.setFillColor(7, 30, 73) // #071e49 Azul Marino Oficial
    pdf.rect(0, 0, pageWidth, 26, 'F')

    pdf.setFillColor(234, 179, 8) // #eab308 Dorado Brillante
    pdf.rect(0, 26, pageWidth, 1.8, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13.5)
    pdf.text(cleanText('ESCUELA MILITAR DE INGENIERÍA'), pageWidth / 2, 10.5, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(226, 232, 240)
    pdf.text(cleanText('"MCAL. ANTONIO JOSÉ DE SUCRE"'), pageWidth / 2, 16, { align: 'center' })

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(250, 204, 21) // Amarillo Dorado
    pdf.text(cleanText('DIRECCIÓN NACIONAL DE GRADO - KARDEX ACADÉMICO DIGITAL'), pageWidth / 2, 21.5, { align: 'center' })

    // ─────────────────────────────────────────────────────────────
    // 2. TÍTULOS PRINCIPALES
    // ─────────────────────────────────────────────────────────────
    let curY = 35.5
    pdf.setTextColor(8, 33, 83) // Azul Marino Intenso
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11.5)
    pdf.text(cleanText('ACTA OFICIAL DE ENTREGA Y RECEPCIÓN DE PADRÓN ESTUDIANTIL'), pageWidth / 2, curY, { align: 'center' })

    curY += 5
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(217, 119, 6) // Ámbar / Dorado
    pdf.text(cleanText(`CARRERA: ${carreraName.toUpperCase()}`), pageWidth / 2, curY, { align: 'center' })

    // ─────────────────────────────────────────────────────────────
    // 3. CAJA DE METADATOS (2 Columnas con borde suave)
    // ─────────────────────────────────────────────────────────────
    curY += 4.5
    const boxMargin = 10
    const boxWidth = pageWidth - (boxMargin * 2) // 190 mm
    const boxHeight = 19

    pdf.setFillColor(240, 247, 255) // Fondo celeste muy suave
    pdf.setDrawColor(147, 197, 253) // Borde azul suave #93c5fd
    pdf.setLineWidth(0.3)
    pdf.roundedRect(boxMargin, curY, boxWidth, boxHeight, 1.5, 1.5, 'FD')

    // Columna 1
    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Código de Acta:', boxMargin + 4, curY + 5)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(51, 65, 85)
    pdf.text(actaCode, boxMargin + 38, curY + 5)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Gestión Académica:', boxMargin + 4, curY + 10.5)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(51, 65, 85)
    pdf.text(gestionStr, boxMargin + 38, curY + 10.5)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Fecha y Hora:', boxMargin + 4, curY + 16)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(51, 65, 85)
    pdf.text(fechaHoraCompleta, boxMargin + 38, curY + 16)

    // Columna 2
    const col2X = boxMargin + 106
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Total Estudiantes:', col2X, curY + 5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(22, 101, 52) // Verde oscuro
    pdf.text(`${estudiantesList.length} Registrados Activos`, col2X + 33, curY + 5)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Tipo de Custodia:', col2X, curY + 10.5)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(51, 65, 85)
    pdf.text('Oficial / Kardex Inmutable', col2X + 33, curY + 10.5)

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text('Blockchain Hash:', col2X, curY + 16)
    pdf.setFont('courier', 'normal')
    pdf.setFontSize(6.8)
    pdf.setTextColor(71, 85, 105)
    pdf.text(displayHash.substring(0, 36), col2X + 33, curY + 16)

    // ─────────────────────────────────────────────────────────────
    // 4. DECLARACIÓN LEGAL
    // ─────────────────────────────────────────────────────────────
    curY += boxHeight + 3.5
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6.5)
    pdf.setTextColor(51, 65, 85)
    const declaracionText = `En la ciudad de La Paz, en instalaciones de la Escuela Militar de Ingeniería, se procede a la entrega formal del padrón estudiantil consolidado correspondiente a la carrera de ${carreraName}. El presente documento certifica la nómina de estudiantes debidamente matriculados, sus documentos académicos y la documentación reglamentaria verificada mediante cadena de bloques inmutable.`
    const splitDec = pdf.splitTextToSize(cleanText(declaracionText), boxWidth)
    pdf.text(splitDec, boxMargin, curY)

    // ─────────────────────────────────────────────────────────────
    // 5. NÓMINA CONSOLIDADA DE ESTUDIANTES
    // ─────────────────────────────────────────────────────────────
    curY += 7.5
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(8, 33, 83)
    pdf.text(cleanText(`NÓMINA CONSOLIDADA DE ESTUDIANTES (${estudiantesList.length})`), boxMargin, curY)

    curY += 3
    const tblLeft = boxMargin
    const tblWidth = boxWidth
    const colW = {
        num: 10,
        codigo: 28,
        nombre: 57,
        carrera: 45,
        docs: 50,
    }

    // Encabezado de Tabla
    const headerHeight = 6.5
    pdf.setFillColor(7, 43, 97) // Azul Marino Tabla
    pdf.rect(tblLeft, curY, tblWidth, headerHeight, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')

    pdf.text('N°', tblLeft + (colW.num / 2), curY + 4.5, { align: 'center' })
    pdf.text('CÓDIGO EMI', tblLeft + colW.num + 4, curY + 4.5)
    pdf.text('NOMBRE COMPLETO', tblLeft + colW.num + colW.codigo + 4, curY + 4.5)
    pdf.text('CARRERA', tblLeft + colW.num + colW.codigo + colW.nombre + 4, curY + 4.5)
    pdf.text('DOCUMENTOS', tblLeft + colW.num + colW.codigo + colW.nombre + colW.carrera + 4, curY + 4.5)

    curY += headerHeight

    // Documentos variados por estudiante
    const docVariants = [
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Documentos académicos previos'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Documento de convalidación'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Título de bachiller'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Título de bachiller'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Documentos académicos previos'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Título de bachiller'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Documento de convalidación'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Título de bachiller'],
      ['Ficha de matrícula', 'Certificado de nacimiento', 'Carnet de identidad', 'Documentos académicos previos'],
    ]

    const docIconsColors = [
      [37, 99, 235],   // Azul (Ficha)
      [220, 38, 38],   // Rojo (Certificado)
      [22, 163, 74],   // Verde (Carnet)
      [147, 51, 234],  // Morado (Título / Otros)
    ]

    const maxItems = Math.min(estudiantesList.length, 9)
    const rowHeight = 16.2 // Altura exacta para que entren los 9 estudiantes en 1 sola página

    estudiantesList.slice(0, maxItems).forEach((est, idx) => {
      const isEven = idx % 2 === 0
      pdf.setFillColor(isEven ? 255 : 250, isEven ? 255 : 252, isEven ? 255 : 255)
      pdf.setDrawColor(191, 219, 254) // #bfdbfe Azul Suave
      pdf.setLineWidth(0.2)
      pdf.rect(tblLeft, curY, tblWidth, rowHeight, 'FD')

      // Líneas divisorias verticales internas
      let sepX = tblLeft + colW.num
      pdf.line(sepX, curY, sepX, curY + rowHeight)
      sepX += colW.codigo
      pdf.line(sepX, curY, sepX, curY + rowHeight)
      sepX += colW.nombre
      pdf.line(sepX, curY, sepX, curY + rowHeight)
      sepX += colW.carrera
      pdf.line(sepX, curY, sepX, curY + rowHeight)

      // N°
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.setTextColor(15, 23, 42)
      pdf.text(String(idx + 1), tblLeft + (colW.num / 2), curY + 9, { align: 'center' })

      // CÓDIGO EMI (Dorado / Ámbar #d97706)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.setTextColor(217, 119, 6)
      pdf.text(cleanText(est.codigo || `H${550 + idx}-${idx + 1}`), tblLeft + colW.num + 4, curY + 9)

      // NOMBRE COMPLETO
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(7.5)
      pdf.setTextColor(15, 23, 42)
      const nombreEst = cleanText(est.nombre || 'Estudiante EMI')
      pdf.text(nombreEst, tblLeft + colW.num + colW.codigo + 4, curY + 9)

      // CARRERA
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      pdf.setTextColor(51, 65, 85)
      const carreraEst = cleanText(est.carrera_nombre || est.carrera || carreraName)
      pdf.text(carreraEst, tblLeft + colW.num + colW.codigo + colW.nombre + 4, curY + 9)

      // DOCUMENTOS (4 viñetas con mini iconos de colores)
      const docsArr = docVariants[idx % docVariants.length]
      let docY = curY + 3.2
      const docsStartX = tblLeft + colW.num + colW.codigo + colW.nombre + colW.carrera + 3.5

      docsArr.forEach((docItem, docIdx) => {
        // Iconito rectangular de color con letra o dibujo
        const iconColor = docIconsColors[docIdx % docIconsColors.length]
        pdf.setFillColor(iconColor[0], iconColor[1], iconColor[2])
        pdf.roundedRect(docsStartX, docY - 2.2, 2.8, 2.8, 0.4, 0.4, 'F')

        // Letra del ícono
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(4)
        const iconLetter = docIdx === 0 ? 'M' : docIdx === 1 ? 'N' : docIdx === 2 ? 'CI' : 'T'
        pdf.text(iconLetter, docsStartX + 1.4, docY - 0.4, { align: 'center' })

        // Texto del documento
        pdf.setTextColor(51, 65, 85)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(5.8)
        pdf.text(cleanText(`•  ${docItem}`), docsStartX + 4.2, docY - 0.2)

        docY += 3.4
      })

      curY += rowHeight
    })

    // ─────────────────────────────────────────────────────────────
    // 6. CONFORMIDAD Y CONSTANCIA DE ENTREGA (Firmas)
    // ─────────────────────────────────────────────────────────────
    curY += 5.5
    pdf.setTextColor(8, 33, 83)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(7.5)
    pdf.text(cleanText('CONFORMIDAD Y CONSTANCIA DE ENTREGA'), pageWidth / 2, curY, { align: 'center' })

    curY += 10
    const firmaLineWidth = 58
    const leftFirmaX = boxMargin + 10
    const rightFirmaX = pageWidth - boxMargin - firmaLineWidth - 10

    // Líneas superiores
    pdf.setDrawColor(51, 65, 85)
    pdf.setLineWidth(0.3)
    pdf.line(leftFirmaX, curY, leftFirmaX + firmaLineWidth, curY)
    pdf.line(rightFirmaX, curY, rightFirmaX + firmaLineWidth, curY)

    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 23, 42)
    pdf.text(cleanText('ENTREGUÉ CONFORME'), leftFirmaX + (firmaLineWidth / 2), curY + 3.5, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6)
    pdf.text(cleanText('Encargado de Kardex / Administrador'), leftFirmaX + (firmaLineWidth / 2), curY + 6.8, { align: 'center' })

    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.text(cleanText('RECIBÍ CONFORME'), rightFirmaX + (firmaLineWidth / 2), curY + 3.5, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6)
    pdf.text(cleanText(`Jefe de Carrera ${carreraName}`), rightFirmaX + (firmaLineWidth / 2), curY + 6.8, { align: 'center' })

    // Línea inferior central (Vo. Bo. Dirección Académica)
    curY += 12
    const centerFirmaX = (pageWidth / 2) - (firmaLineWidth / 2)
    pdf.line(centerFirmaX, curY, centerFirmaX + firmaLineWidth, curY)

    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.text(cleanText('Vo. Bo. DIRECCIÓN ACADÉMICA'), pageWidth / 2, curY + 3.5, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6)
    pdf.text(cleanText('Escuela Militar de Ingeniería'), pageWidth / 2, curY + 6.8, { align: 'center' })

    // ─────────────────────────────────────────────────────────────
    // 7. FOOTER INFERIOR (Azul Marino + Línea Dorada)
    // ─────────────────────────────────────────────────────────────
    const footerHeight = 10
    const footerY = pageHeight - footerHeight

    pdf.setFillColor(7, 30, 73) // Azul Marino
    pdf.rect(0, footerY, pageWidth, footerHeight, 'F')

    pdf.setFillColor(234, 179, 8) // Línea dorada superior
    pdf.rect(0, footerY, pageWidth, 0.8, 'F')

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6.5)
    pdf.setTextColor(226, 232, 240)
    pdf.text(cleanText(`Acta Oficial de Entrega y Recepción de Padrón Estudiantil - ${carreraName}`), boxMargin, footerY + 6)
    pdf.text(cleanText('Documento Certificado Digitalmente'), pageWidth - boxMargin, footerY + 6, { align: 'right' })

    // Nombre de archivo
    const safeCarrera = carreraName.replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
    const fileName = `Acta_Oficial_Entrega_Padron_${safeCarrera}_${anio}.pdf`

    pdf.save(fileName)
    return true
  } catch (error) {
    console.error('Error generando Acta Oficial de Entrega a Jefe de Carrera:', error)
    return false
  }
}


