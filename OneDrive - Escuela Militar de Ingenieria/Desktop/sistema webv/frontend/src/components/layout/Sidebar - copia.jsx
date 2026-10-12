import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Link2, FileText,
  Users, GraduationCap, BookMarked, BarChart3,
  Shield, LogOut, ChevronLeft, ChevronRight,
  Briefcase, ClipboardList, ArrowLeftRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import './Sidebar.css'

const navSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/kardex', label: 'Kardex', icon: BookOpen },
      { path: '/blockchain', label: 'Blockchain Explorer', icon: Link2 },
      { path: '/certificados', label: 'Certificados', icon: FileText },
    ]
  },
  {
    title: 'ACADÉMICO',
    items: [
      { path: '/estudiantes',     label: 'Estudiantes',     icon: GraduationCap, roles: ['Administrador', 'Docente', 'Jefe de Carrera'] },
      { path: '/administrativos', label: 'Administrativo',  icon: Briefcase,     roles: ['Administrador'] },
      { path: '/docentes',        label: 'Docentes',        icon: Users,         roles: ['Administrador'] },
      { path: '/materias',        label: 'Materias',        icon: BookMarked,    roles: ['Administrador', 'Docente', 'Jefe de Carrera'] },
      { path: '/gestiones',       label: 'Gestiones',       icon: ClipboardList, roles: ['Administrador'] },
    ]
  },
  {
    title: 'ANÁLISIS',
    items: [
      { path: '/reportes',   label: 'Reportes',   icon: BarChart3, roles: ['Administrador', 'Docente', 'Jefe de Carrera'] },
      { path: '/auditoria',  label: 'Auditoría',  icon: Shield, roles: ['Administrador'] },
    ]
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      { path: '/cambio-encargado', label: 'Cambio Encargado', icon: ArrowLeftRight, roles: ['Administrador'] },
    ]
  }
]

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const canSee = (item) => {
    if (!item.roles) return true
    if (!user?.role) return true
    const userRoleStr = String(user.role).trim().toLowerCase()
    return item.roles.some((r) => r.trim().toLowerCase() === userRoleStr)
  }

  const initial = (user?.name || user?.username || 'A').charAt(0).toUpperCase()
  const displayName = user?.name || user?.username || 'Admin Sistema'
  const displayRole = user?.role || 'Administrador'

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header EMI - Exacto a la imagen */}
      <div className="sidebar-brand-header">
        {!collapsed ? (
          <div className="sidebar-emi-brand">
            <div className="sidebar-brand-crest">
              <span className="sidebar-brand-emi-text">EMI</span>
              <svg className="sidebar-castle-icon" viewBox="0 0 70 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 16H17V24H23V16H31V24H39V16H47V24H53V16H63V32H67V48H3V32H7V16Z" fill="#FFB800" stroke="#B38000" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M27 48V34C27 31.8 28.8 30 31 30H39C41.2 30 43 31.8 43 34V48H27Z" fill="#081E46" stroke="#B38000" strokeWidth="1.5"/>
                <rect x="13" y="34" width="6" height="8" rx="2" fill="#081E46"/>
                <rect x="51" y="34" width="6" height="8" rx="2" fill="#081E46"/>
                <line x1="3" y1="48" x2="67" y2="48" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="sidebar-brand-strip">
              <span>ESCUELA MILITAR DE INGENIERÍA</span>
            </div>
            <div className="sidebar-brand-sublabel">
              Mcal. Antonio José de Sucre
            </div>
          </div>
        ) : (
          <div className="sidebar-emi-collapsed-logo">
            <span className="collapsed-emi-text">EMI</span>
          </div>
        )}
      </div>

      {/* Nav Section Items */}
      <nav className="sidebar-nav">
        {navSections.map((sec, secIdx) => {
          const visibleItems = sec.items.filter(canSee)
          if (visibleItems.length === 0) return null
          return (
            <div key={sec.title || secIdx} className="nav-section-group">
              {collapsed ? (
                <div className="sidebar-divider" />
              ) : (
                <div className="nav-section-label">{sec.title}</div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    id={`nav-${item.path.replace('/', '')}`}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="nav-icon" size={18} />
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {initial}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{displayRole}</div>
            </div>
          </div>
        )}

        <button
          id="logoutBtn"
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Cerrar Sesión"
        >
          <LogOut size={16} className="logout-icon" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>

        <button
          id="sidebarToggleBtn"
          className="sidebar-toggle-btn"
          onClick={onToggle}
          aria-label="Colapsar menú"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  )
}
