import { Bell, Menu, ChevronDown } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Principal',
  '/kardex': 'Kardex Digital',
  '/blockchain': 'Blockchain Explorer',
  '/certificados': 'Certificados Digitales',
  '/estudiantes': 'Gestión de Estudiantes',
  '/administrativos': 'Personal Administrativo',
  '/docentes': 'Gestión de Docentes',
  '/materias': 'Gestión de Materias',
  '/gestiones': 'Gestiones Académicas',
  '/reportes': 'Reportes y Estadísticas',
  '/auditoria': 'Panel de Auditoría',
  '/cambio-encargado': 'Cambio de Encargado',
}

export default function Header({ collapsed, onMobileToggle }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const userRoleStr = String(user?.role || '').toLowerCase()
  const isJefe = userRoleStr.includes('jefe') || userRoleStr.includes('carrera')

  let title = PAGE_TITLES[location.pathname] || 'Sistema EMI'
  if (isJefe && location.pathname === '/dashboard') {
    title = 'Dashboard Jefe de Carrera'
  }

  const initial = (user?.name || user?.username || 'A').charAt(0).toUpperCase()
  const displayName = user?.name || user?.username || 'Admin Sistema'
  const displayRole = user?.role || 'Administrador'

  return (
    <header className="header">
      {/* Mobile toggle button */}
      <button
        id="mobileMenuBtn"
        className="btn btn-outline btn-icon"
        onClick={onMobileToggle}
        aria-label="Abrir menú"
        style={{ display: 'none' }}
      >
        <Menu size={18} />
      </button>

      {/* Page Title */}
      <span className="header-title">{title}</span>

      <div className="header-spacer" />

      {/* Blockchain Status Pill */}
      <div className="blockchain-status" title="Red Blockchain Activa">
        <span className="blockchain-dot" />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>Blockchain · Activo</span>
      </div>

      {/* Notifications Bell */}
      <button id="notificationsBtn" className="btn btn-outline btn-icon" aria-label="Notificaciones">
        <Bell size={17} />
      </button>

      {/* User Info */}
      <div className="header-user" id="headerUser">
        <div className="user-avatar">
          {initial}
        </div>
        <div className="user-info">
          <div className="user-name">{displayName}</div>
          <div className="user-role">{displayRole}</div>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </header>
  )
}
