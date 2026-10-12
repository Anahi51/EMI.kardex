/**
 * ================================================================
 * ARCHIVO: Reportes.jsx
 * MÓDULO:  Página de Reportes y Estadísticas Académicas
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * DESCRIPCIÓN:
 *   Página de análisis estadístico del rendimiento académico
 *   institucional. Muestra KPIs, gráficos de barras por carrera,
 *   gráfico radar por área temática y tendencia histórica.
 *
 * ROLES QUE ACCEDEN A ESTA PÁGINA:
 *   - Administrador : Visión completa de toda la institución.
 *   - Secretaría    : Puede ver estadísticas para generar informes.
 *   - Docente       : Puede ver el rendimiento de su carrera.
 *   (Estudiante no tiene acceso a esta página)
 *
 * COMPONENTES DE VISUALIZACIÓN (recharts):
 *   - BarChart    : Comparación de aprobados/reprobados por carrera.
 *   - RadarChart  : Rendimiento promedio por área temática.
 *   - LineChart   : Tendencia histórica por gestiones.
 *
 * DATOS ACTUALES:
 *   Los datos son estáticos (mocks). En producción deben conectarse
 *   a reportesService.getRendimiento() y reportesService.getResumen()
 *   desde api.js para mostrar datos reales del backend.
 *
 * ================================================================
 */

import { BarChart3, TrendingUp, Users, BookOpen, Award } from 'lucide-react'  // Íconos del UI
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend
} from 'recharts'  // Librería de gráficos para React

// -------------------------------------------------------
// Estilo compartido para los tooltips de los gráficos
// Fondo oscuro con borde dorado acorde al tema del sistema
// -------------------------------------------------------
const TOOLTIP_STYLE = {
  background:   '#111e2e',
  border:       '1px solid rgba(201,162,39,0.2)',
  borderRadius: 8,
  fontSize:     12,
  color:        '#e8ecf1'
}

// -------------------------------------------------------
// DATOS ESTÁTICOS: Rendimiento por Carrera
// Fuente: mock data (reemplazar con API en producción)
// Campos: carrera, aprobados (%), reprobados (%), promedio (pts)
// -------------------------------------------------------
const DATA_CARRERAS = [
  { carrera: 'Sistemas',    aprobados: 88, reprobados: 12, promedio: 75 },
  { carrera: 'Civil',       aprobados: 82, reprobados: 18, promedio: 71 },
  { carrera: 'Electrónica', aprobados: 91, reprobados:  9, promedio: 78 },
  { carrera: 'Industrial',  aprobados: 79, reprobados: 21, promedio: 68 },
  { carrera: 'Mecánica',    aprobados: 85, reprobados: 15, promedio: 73 },
]

// -------------------------------------------------------
// DATOS ESTÁTICOS: Tendencia Histórica por Gestión
// Permite ver la evolución del rendimiento a lo largo del tiempo
// Campos: gestion (período), promedio (nota media), aprobados (%)
// -------------------------------------------------------
const DATA_TENDENCIA = [
  { gestion: '1/2022', promedio: 68.2, aprobados: 79 },
  { gestion: '2/2022', promedio: 70.5, aprobados: 82 },
  { gestion: '1/2023', promedio: 71.8, aprobados: 84 },
  { gestion: '2/2023', promedio: 73.2, aprobados: 86 },
  { gestion: '1/2024', promedio: 74.5, aprobados: 87 },
]

// -------------------------------------------------------
// DATOS ESTÁTICOS: Rendimiento por Área Temática (Radar)
// Muestra el promedio de notas en cada disciplina académica
// Campos: subject (nombre área), A (promedio de la institución)
// -------------------------------------------------------
const DATA_RADAR = [
  { subject: 'Matemáticas',  A: 72 },
  { subject: 'Física',       A: 68 },
  { subject: 'Programación', A: 85 },
  { subject: 'Redes',        A: 78 },
  { subject: 'Base Datos',   A: 82 },
  { subject: 'IA',           A: 76 },
]


// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Reportes
// -------------------------------------------------------
/**
 * Reportes
 * --------
 * Componente de página que renderiza el dashboard de reportes.
 *
 * SECCIONES:
 *   1. KPIs (tarjetas de métricas clave)
 *      - Promedio institucional general
 *      - Tasa de aprobación global
 *      - Total de estudiantes activos
 *      - Tasa de reprobación global
 *
 *   2. Gráfico de Barras: Aprobados vs Reprobados por carrera
 *      - Compara el rendimiento entre las carreras de la EMI
 *
 *   3. Gráfico Radar: Rendimiento por área temática
 *      - Identifica áreas fuertes y áreas que necesitan refuerzo
 *
 *   4. Gráfico de Línea: Tendencia histórica
 *      - Muestra la evolución del rendimiento académico por gestión
 *
 * @returns {JSX.Element} Página completa de reportes y estadísticas.
 */
export default function Reportes() {
  return (
    <div className="fade-in">  {/* fade-in: animación de entrada suave */}

      {/* -------------------------------------------------- */}
      {/* Encabezado de la página                            */}
      {/* -------------------------------------------------- */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes y Estadísticas</h1>
          <p className="page-subtitle">Análisis del rendimiento académico institucional</p>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* SECCIÓN 1: Tarjetas KPI (Indicadores Clave)        */}
      {/* Muestra las métricas más importantes a simple vista */}
      {/* -------------------------------------------------- */}
      <div className="stat-cards-grid" style={{ marginBottom: 24 }}>

        {/* KPI 1: Promedio institucional general */}
        <div className="stat-card gold">
          <div className="stat-icon gold"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-value text-gold">74.5</div>
            <div className="stat-label">Promedio Institucional</div>
            <div className="stat-change up">↑ +2.3 vs anterior</div>
          </div>
        </div>

        {/* KPI 2: Tasa de aprobación global */}
        <div className="stat-card chain">
          <div className="stat-icon chain"><Award size={22} /></div>
          <div>
            <div className="stat-value text-chain">85.3%</div>
            <div className="stat-label">Tasa de Aprobación</div>
            <div className="stat-change up">↑ +1.8%</div>
          </div>
        </div>

        {/* KPI 3: Total de estudiantes activos */}
        <div className="stat-card blue">
          <div className="stat-icon blue"><Users size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: '#5faee3' }}>1,180</div>
            <div className="stat-label">Estudiantes Activos</div>
            <div className="stat-change up">↑ +28</div>
          </div>
        </div>

        {/* KPI 4: Tasa de reprobación (indicador de alerta) */}
        <div className="stat-card red">
          <div className="stat-icon red"><BookOpen size={22} /></div>
          <div>
            <div className="stat-value text-danger">14.7%</div>
            <div className="stat-label">Tasa de Reprobación</div>
            <div className="stat-change down">↓ -1.8%</div>
          </div>
        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* SECCIÓN 2: Gráficos Fila 1                         */}
      {/* Izquierda: Barras por carrera | Derecha: Radar     */}
      {/* -------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Gráfico de Barras: Aprobados vs Reprobados por carrera */}
        <div className="chart-container">
          <div className="chart-title">📊 Rendimiento por Carrera (Gestión 1/2024)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DATA_CARRERAS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              {/* Eje X: nombres de las carreras */}
              <XAxis dataKey="carrera" stroke="#4a5d75" fontSize={11} />
              {/* Eje Y: porcentaje (0-100) */}
              <YAxis stroke="#4a5d75" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8a9bb0' }} />
              {/* Barra verde: porcentaje de estudiantes aprobados */}
              <Bar dataKey="aprobados" fill="#2ecc71" name="% Aprobados" radius={[4,4,0,0]} />
              {/* Barra roja: porcentaje de estudiantes reprobados */}
              <Bar dataKey="reprobados" fill="#e74c3c" name="% Reprobados" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Radar: Rendimiento promedio por área temática */}
        <div className="chart-container">
          <div className="chart-title">🎯 Rendimiento por Área</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={DATA_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              {/* Etiquetas de cada vértice del radar (área temática) */}
              <PolarAngleAxis dataKey="subject" stroke="#4a5d75" fontSize={10} />
              <PolarRadiusAxis stroke="#4a5d75" fontSize={9} />
              {/* Área dorada que representa el promedio institucional */}
              <Radar name="Promedio" dataKey="A" stroke="#c9a227" fill="#c9a227" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* SECCIÓN 3: Tendencia Histórica                     */}
      {/* Gráfico de líneas que muestra la evolución         */}
      {/* del rendimiento académico a lo largo de gestiones  */}
      {/* -------------------------------------------------- */}
      <div className="chart-container">
        <div className="chart-title">📈 Tendencia Histórica de Rendimiento</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={DATA_TENDENCIA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            {/* Eje X: gestión académica (ej: 1/2022, 2/2022) */}
            <XAxis dataKey="gestion" stroke="#4a5d75" fontSize={11} />
            <YAxis stroke="#4a5d75" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8a9bb0' }} />
            {/* Línea dorada: promedio de notas por gestión */}
            <Line
              type="monotone"
              dataKey="promedio"
              stroke="#c9a227"
              strokeWidth={2}
              dot={{ fill: '#c9a227', r: 4 }}
              name="Promedio"
            />
            {/* Línea verde: porcentaje de aprobados por gestión */}
            <Line
              type="monotone"
              dataKey="aprobados"
              stroke="#2ecc71"
              strokeWidth={2}
              dot={{ fill: '#2ecc71', r: 4 }}
              name="% Aprobados"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
