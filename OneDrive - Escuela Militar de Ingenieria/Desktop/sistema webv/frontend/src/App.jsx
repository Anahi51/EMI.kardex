/**
 * ================================================================
 * ARCHIVO: App.jsx
 * MÓDULO:  Componente Raíz - Enrutador Principal
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * DESCRIPCIÓN:
 *   Punto de entrada principal de la aplicación React.
 *   Define el sistema de rutas, protege las rutas privadas con
 *   autenticación JWT, y organiza el layout principal (Sidebar + Header).
 *
 * ESTRUCTURA DE RUTAS:
 *   /login       → Página pública de inicio de sesión
 *   /dashboard   → Panel principal con KPIs y métricas [PRIVADA]
 *   /kardex      → Historial de calificaciones del estudiante [PRIVADA]
 *   /blockchain  → Explorador de bloques y verificación [PRIVADA]
 *   /certificados→ Emisión y verificación de certificados [PRIVADA]
 *   /estudiantes → Gestión del padrón estudiantil [PRIVADA]
 *   /administrativos → Gestión del personal administrativo [PRIVADA]
 *   /docentes    → Gestión del cuerpo docente [PRIVADA]
 *   /materias    → Catálogo de materias [PRIVADA]
 *   /gestiones   → Gestión de períodos académicos [PRIVADA]
 *   /reportes    → Estadísticas y reportes académicos [PRIVADA]
 *   /auditoria   → Log de auditoría del sistema [PRIVADA]
 *
 * ESTRATEGIA DE CARGA:
 *   Todas las páginas usan React.lazy() + Suspense para carga diferida
 *   (code splitting), mejorando el rendimiento inicial de la app.
 *
 * ROLES Y ACCESO:
 *   - Administrador : Acceso total a todas las rutas.
 *   - Secretaría    : Dashboard, Estudiantes, Certificados, Reportes.
 *   - Docente       : Dashboard, Kardex, Materias, Blockchain.
 *   - Estudiante    : Dashboard, Kardex (solo el propio), Certificados.
 *
 * ================================================================
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'    // Sistema de notificaciones flotantes
import useAuthStore from './store/authStore'  // Store global de autenticación

// -------------------------------------------------------
// Importación de componentes de Layout
// -------------------------------------------------------
import Sidebar from './components/layout/Sidebar'  // Menú lateral de navegación
import Header  from './components/layout/Header'   // Barra superior con usuario y acciones

// -------------------------------------------------------
// Importación DIFERIDA de páginas (Lazy Loading / Code Splitting)
// Cada página se carga solo cuando el usuario navega a ella,
// reduciendo el tamaño del bundle inicial.
// -------------------------------------------------------
const Login       = lazy(() => import('./pages/Login'))        // Pantalla de autenticación
const Dashboard   = lazy(() => import('./pages/Dashboard'))    // Panel principal con estadísticas
const Kardex      = lazy(() => import('./pages/Kardex'))       // Historial académico del estudiante
const Blockchain  = lazy(() => import('./pages/Blockchain'))   // Explorador de bloques
const Certificados= lazy(() => import('./pages/Certificados')) // Emisión y verificación de certificados
const Estudiantes = lazy(() => import('./pages/Estudiantes'))  // CRUD de estudiantes
const Administrativo = lazy(() => import('./pages/Administrativo')) // CRUD de personal administrativo
const Docentes    = lazy(() => import('./pages/Docentes'))     // CRUD de docentes
const Materias    = lazy(() => import('./pages/Materias'))     // Catálogo de materias
const Gestiones   = lazy(() => import('./pages/Gestiones'))   // Gestión de períodos académicos
const Reportes    = lazy(() => import('./pages/Reportes'))     // Reportes y estadísticas
const Auditoria        = lazy(() => import('./pages/Auditoria'))        // Log de auditoría (solo admin)
const CambioEncargado  = lazy(() => import('./pages/CambioEncargado')) // Cambio de encargado del Kardex (solo admin)


// -------------------------------------------------------
// COMPONENTE: PageLoader
// -------------------------------------------------------
/**
 * PageLoader
 * ----------
 * Indicador de carga que se muestra mientras Suspense espera
 * que la página lazy-loaded termine de descargarse.
 *
 * Se muestra centrado en la pantalla con un spinner animado.
 */
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: 16,
      color: 'var(--text-secondary)', fontSize: 14
    }}>
      <div className="loader-spin" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <span>Cargando...</span>
    </div>
  )
}


// -------------------------------------------------------
// COMPONENTE: PrivateRoute
// -------------------------------------------------------
/**
 * PrivateRoute
 * ------------
 * Guarda de rutas protegidas. Verifica si el usuario está autenticado
 * antes de renderizar el contenido.
 *
 * @param {ReactNode} children - Componente hijo a proteger.
 *
 * COMPORTAMIENTO:
 *   - Si el usuario está autenticado (token válido) → renderiza el children.
 *   - Si NO está autenticado → redirige automáticamente a /login.
 *
 * Usa el estado `isAuthenticated` del store de Zustand (authStore).
 */
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  // Si no está autenticado, redirige al login sin guardar historial (replace)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}


// -------------------------------------------------------
// COMPONENTE: AppLayout
// -------------------------------------------------------
/**
 * AppLayout
 * ---------
 * Layout principal de la aplicación para páginas autenticadas.
 * Combina el Sidebar (menú lateral) con el Header (barra superior)
 * y el área de contenido principal.
 *
 * @param {ReactNode} children - Página actual a renderizar en el área de contenido.
 *
 * ESTADO INTERNO:
 *   - collapsed   {boolean} : Controla si el sidebar está colapsado (solo iconos).
 *   - mobileOpen  {boolean} : Controla si el sidebar está abierto en móvil.
 *
 * ESTRUCTURA VISUAL:
 *   ┌────────────┬─────────────────────┐
 *   │            │  Header             │
 *   │  Sidebar   ├─────────────────────┤
 *   │            │  Página (children)  │
 *   └────────────┴─────────────────────┘
 */
function AppLayout({ children }) {
  const [collapsed,   setCollapsed]   = useState(false) // sidebar expandido/colapsado
  const [mobileOpen,  setMobileOpen]  = useState(false) // sidebar visible en móvil

  return (
    <div className="app-layout">
      {/* Header superior: barra transversal institucional */}
      <Header
        collapsed={collapsed}
        onMobileToggle={() => setMobileOpen(true)}
      />

      {/* Sidebar: menú lateral debajo del header */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Área principal: se ajusta al ancho del sidebar */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Contenido de la página con Suspense para lazy loading */}
        <main className="page-content">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}


// -------------------------------------------------------
// COMPONENTE PRINCIPAL: App
// -------------------------------------------------------
/**
 * App
 * ---
 * Componente raíz de la aplicación. Se encarga de:
 *   1. Cargar la sesión del usuario desde localStorage al iniciar.
 *   2. Configurar el sistema de notificaciones (react-hot-toast).
 *   3. Definir todas las rutas públicas y privadas del sistema.
 *
 * MONTAJE:
 *   Al montar, llama a loadUser() del authStore para restaurar
 *   la sesión guardada en localStorage sin necesidad de un nuevo login.
 */
export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  // Al montar la app, restaura los datos del usuario desde localStorage
  useEffect(() => {
    loadUser()
  }, []) // [] = solo se ejecuta una vez al montar el componente


  return (
    <>
      {/* -------------------------------------------------- */}
      {/* Sistema de notificaciones tipo toast                */}
      {/* Aparece en la esquina superior derecha              */}
      {/* -------------------------------------------------- */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:   'var(--bg-card)',
            color:        'var(--text-primary)',
            border:       '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            fontSize:     13,
          },
          success: {
            // Ícono de éxito con los colores dorados del sistema
            iconTheme: { primary: 'var(--color-chain-300)', secondary: 'var(--bg-card)' },
          },
        }}
      />

      {/* -------------------------------------------------- */}
      {/* Definición de rutas con React Router v6             */}
      {/* -------------------------------------------------- */}
      <Routes>

        {/* === RUTA PÚBLICA: Login === */}
        {/* Accesible sin autenticación */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />

        {/* === RUTAS PRIVADAS === */}
        {/* Cada ruta está envuelta en PrivateRoute + AppLayout */}

        {/* Panel principal con KPIs del sistema */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Historial académico (notas y calificaciones del estudiante) */}
        <Route
          path="/kardex"
          element={
            <PrivateRoute>
              <AppLayout><Kardex /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Explorador de la cadena de bloques y verificación de hashes */}
        <Route
          path="/blockchain"
          element={
            <PrivateRoute>
              <AppLayout><Blockchain /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Emisión y verificación de certificados académicos */}
        <Route
          path="/certificados"
          element={
            <PrivateRoute>
              <AppLayout><Certificados /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión del padrón estudiantil (CRUD de estudiantes) */}
        <Route
          path="/estudiantes"
          element={
            <PrivateRoute>
              <AppLayout><Estudiantes /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión del personal administrativo (CRUD de administrativos) */}
        <Route
          path="/administrativos"
          element={
            <PrivateRoute>
              <AppLayout><Administrativo /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión del cuerpo docente (CRUD de docentes) */}
        <Route
          path="/docentes"
          element={
            <PrivateRoute>
              <AppLayout><Docentes /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Catálogo de materias del plan de estudios */}
        <Route
          path="/materias"
          element={
            <PrivateRoute>
              <AppLayout><Materias /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión de períodos académicos (semestres/gestiones) */}
        <Route
          path="/gestiones"
          element={
            <PrivateRoute>
              <AppLayout><Gestiones /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Reportes estadísticos y análisis de rendimiento académico */}
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <AppLayout><Reportes /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Log de auditoría: acciones realizadas en el sistema (solo admin) */}
        <Route
          path="/auditoria"
          element={
            <PrivateRoute>
              <AppLayout><Auditoria /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* Cambio de encargado del Kardex (solo administrador) */}
        <Route
          path="/cambio-encargado"
          element={
            <PrivateRoute>
              <AppLayout><CambioEncargado /></AppLayout>
            </PrivateRoute>
          }
        />

        {/* === REDIRECCIONES === */}
        {/* La ruta raíz (/) redirige al dashboard */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        {/* Cualquier ruta desconocida (404) también va al dashboard */}
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </>
  )
}
