import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle,
  UserPlus, Mail, CheckCircle2, ChevronDown
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { authService } from '../services/api'
import './Login.css'

const ROLES = [
  { value: 'JEFE_CARRERA',   label: 'Jefe de Carrera' },
  { value: 'ESTUDIANTE',     label: 'Estudiante' },
  { value: 'DOCENTE',        label: 'Docente' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'SECRETARIA',     label: 'Secretaría' },
  { value: 'AUDITOR',        label: 'Auditor Blockchain' },
]

const DEMO_USERS = [
  { username: 'capitan soruco ( jefe de carrera)', email: 'jefe@emi.edu.bo', password: 'EMI26', role: 'Jefe de Carrera', label: 'Jefe de Carrera', name: 'Ing. Carlos Mendoza (Jefe de Carrera)' },
  { username: 'admin12', password: '1234567', role: 'Administrador', label: 'Administrador', name: 'Admin Sistema' },
  { username: 'santiagom@emi.bo', email: 'santiagom@emi.bo', password: '123456', role: 'Docente', label: 'Docente', name: '' },
  { username: 'estudiante1', email: 'estudiante1@emi.edu.bo', password: 'est123', role: 'Estudiante', label: 'Estudiante', name: '' },
  { username: 'administrativo', email: 'administrativo@emi.edu.bo', password: 'admin123', role: 'Administrativo', label: 'Administrativo', name: '' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [tab, setTab] = useState('login') // 'login' | 'register'

  // Login state
  const [loginForm, setLoginForm] = useState({ username: 'santiagom@emi.bo o usuario', password: '' })
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Register state
  const [regForm, setRegForm] = useState({
    username: '', password: '', password2: '', nombre: '', email: '', rol: 'JEFE_CARRERA'
  })
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegPass2, setShowRegPass2] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')

  /* ── LOGIN ── */
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    setLoginError('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Por favor complete todos los campos.')
      return
    }
    setLoginLoading(true)
    setLoginError('')

    try {
      const { data } = await authService.login(loginForm)
      login(data.user, data.access)
      navigate('/dashboard')
    } catch {
      // Buscar en usuarios registrados por el administrador + usuarios demo
      const customUsers = JSON.parse(localStorage.getItem('created_users') || '[]')
      const allUsers = [...DEMO_USERS, ...customUsers]

      const q = loginForm.username.trim().toLowerCase()
      const passEntered = loginForm.password

      // Buscar coincidencia exacta por email, username, CI o código + contraseña correcta
      const foundUser = allUsers.find(
        (u) =>
          ((u.username && u.username.toLowerCase() === q) ||
           (u.email && u.email.toLowerCase() === q) ||
           (u.ci && u.ci.toLowerCase() === q) ||
           (u.codigo && u.codigo.toLowerCase() === q)) &&
          u.password === passEntered
      )

      if (!foundUser) {
        // Si no coincide exactamente → mostrar error claro, NO crear usuario fantasma
        setLoginError('Correo o contraseña incorrectos. Verifique sus credenciales.')
        setLoginLoading(false)
        return
      }

      // Pasar TODOS los datos del usuario al store (nombre, rol, cargo, área, carrera, código, email)
      const userPayload = {
        name:         foundUser.name,
        role:         foundUser.role,
        username:     foundUser.email || foundUser.username,
        email:        foundUser.email || foundUser.username,
        cargo:        foundUser.cargo        || '',
        area:         foundUser.area         || '',
        carrera:      foundUser.carrera      || '',
        codigo:       foundUser.codigo       || '',
        especialidad: foundUser.especialidad || '',
        ci:           foundUser.ci           || '',
      }

      let tokenStr = "user"
      try { tokenStr = btoa(unescape(encodeURIComponent(JSON.stringify(foundUser)))) } catch { tokenStr = "token" }
      const mockToken = `demo.${tokenStr}.token`
      login(userPayload, mockToken)
      navigate('/dashboard')
    } finally {
      setLoginLoading(false)
    }
  }

  const loginDemo = (u) => {
    let tokenStr = "user"; try { tokenStr = btoa(unescape(encodeURIComponent(JSON.stringify(u)))) } catch { tokenStr = "token" }
    const mockToken = `demo.${tokenStr}.token`
    login({
      name: u.name || '',
      role: u.role,
      username: u.username,
      email: u.email || u.username,
      codigo: u.codigo || '',
      ci: u.ci || '',
      cargo: u.cargo || '',
      area: u.area || '',
      carrera: u.carrera || '',
      especialidad: u.especialidad || '',
    }, mockToken)
    navigate('/dashboard')
  }

  /* ── REGISTER ── */
  const handleRegChange = (e) => {
    let { name, value } = e.target
    if (name === 'nombre') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    }
    setRegForm({ ...regForm, [name]: value })
    setRegError('')
    setRegSuccess('')
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    if (!regForm.username || !regForm.password || !regForm.password2 || !regForm.nombre) {
      setRegError('Complete todos los campos obligatorios.')
      return
    }
    if (regForm.password !== regForm.password2) {
      setRegError('Las contraseñas no coinciden.')
      return
    }
    if (regForm.password.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setRegLoading(true)
    setRegError('')
    try {
      const { data } = await authService.register(regForm)
      login(data.user, data.access)
      navigate('/dashboard')
    } catch (err) {
      const errData = err.response?.data
      if (errData) {
        const msg = Object.values(errData).flat().join(' ')
        setRegError(msg || 'Error al crear la cuenta.')
      } else {
        const customUsers = JSON.parse(localStorage.getItem('created_users') || '[]')
        const roleMap = {
          'JEFE_CARRERA': 'Jefe de Carrera',
          'ESTUDIANTE': 'Estudiante',
          'DOCENTE': 'Docente',
          'ADMINISTRATIVO': 'Administrativo',
          'SECRETARIA': 'Secretaría',
          'AUDITOR': 'Auditor Blockchain'
        }
        const assignedRole = roleMap[regForm.rol] || 'Jefe de Carrera'
        const newUser = {
          name: regForm.nombre,
          role: assignedRole,
          username: regForm.username,
          email: regForm.email || regForm.username,
          password: regForm.password,
        }
        customUsers.push(newUser)
        localStorage.setItem('created_users', JSON.stringify(customUsers))

        let tokenStr = "user"
        try { tokenStr = btoa(unescape(encodeURIComponent(JSON.stringify(newUser)))) } catch {}
        login(newUser, `demo.${tokenStr}.token`)
        navigate('/dashboard')
      }
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background blueprint grid */}
      <div className="login-bg">
        <div className="login-bg-glow" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-container">
        {/* Top-Left Corner Ribbon - Azul/Amarillo */}
        <svg className="login-corner-ribbon ribbon-top-left" viewBox="0 0 110 110" fill="none">
          <polygon points="0,0 40,0 0,40" fill="#001a6e" />
          <polygon points="40,0 80,0 0,80 0,40" fill="#003399" />
          <polygon points="80,0 110,0 0,110 0,80" fill="#f5c518" />
        </svg>

        {/* Bottom-Right Corner Ribbon - Azul/Amarillo */}
        <svg className="login-corner-ribbon ribbon-bottom-right" viewBox="0 0 110 110" fill="none">
          <polygon points="0,110 30,110 110,30 110,0" fill="#001a6e" />
          <polygon points="30,110 70,110 110,70 110,30" fill="#003399" />
          <polygon points="70,110 110,110 110,70" fill="#f5c518" />
        </svg>

        {/* Left Panel */}
        <div className="login-left">
          <div className="login-left-overlay" />
          <div className="login-left-content">
            <div className="login-brand">
              {/* Logo EMI */}
              <div className="login-logo-ring">
                <div className="login-logo">
                  <ShieldCheck size={36} strokeWidth={2.2} color="#0a1f44" />
                </div>
              </div>
              <p className="login-brand-eyebrow">ESCUELA MILITAR DE INGENIERÍA</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', letterSpacing: '0.02em' }}>
                Mcal. Antonio José de Sucre
              </p>
              <h1 className="login-brand-title">
                ESCUELA MILITAR<br />DE INGENIERÍA
              </h1>
              <p className="login-brand-sub">SISTEMA DE KARDEX DIGITAL</p>
              
              <p className="login-brand-desc">
                Plataforma académica con tecnología Blockchain para garantizar la{' '}
                <strong>integridad</strong> e <strong>inmutabilidad</strong> de los registros académicos.
              </p>
            </div>

            <div className="login-blockchain-visual">
              {/* Block 1 */}
              <div className="login-block-mini">
                <div className="login-block-mini-index">#001</div>
                <div className="login-block-mini-hash">a18b9e8c2...</div>
                <div className="login-block-mini-status">✓ VÁLIDO</div>
              </div>
              
              <div className="login-block-arrow">↓</div>

              {/* Block 2 */}
              <div className="login-block-mini">
                <div className="login-block-mini-index">#002</div>
                <div className="login-block-mini-hash">6fc146de ...</div>
                <div className="login-block-mini-status">✓ VÁLIDO</div>
              </div>

              <div className="login-block-arrow">↓</div>

              {/* Block 3 */}
              <div className="login-block-mini">
                <div className="login-block-mini-index">#003</div>
                <div className="login-block-mini-hash">5a66f7ab ...</div>
                <div className="login-block-mini-status">✓ VÁLIDO</div>
              </div>
            </div>

            <div className="login-chain-badge">
              <span className="blockchain-dot" />
              <span>Blockchain Activo · Red Segura</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right">
          <div className="login-form-card">

            {/* Tabs */}
            <div className="login-tabs">
              <button
                id="tabLogin"
                className={`login-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setLoginError('') }}
                type="button"
              >
                <Lock size={13} strokeWidth={2.4} />
                <span>Iniciar Sesión</span>
              </button>
              <button
                id="tabRegister"
                className={`login-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setRegError(''); setRegSuccess('') }}
                type="button"
              >
                <UserPlus size={13} strokeWidth={2.4} />
                <span>Crear Cuenta</span>
              </button>
            </div>

            {/* ── LOGIN FORM ── */}
            <div className={`login-panel ${tab === 'login' ? 'visible' : 'hidden'}`}>
              <div className="login-form-header">
                <h2 className="login-form-title">Bienvenido</h2>
                <p className="login-form-sub">Ingrese sus credenciales institucionales</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="login-form" id="loginForm">
                <div className="form-group">
                  <label className="form-label" htmlFor="username">
                    <User size={13} strokeWidth={2.2} />
                    <span>CORREO O USUARIO</span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-input"
                      placeholder="santiagom@emi.bo o usuario"
                      value={loginForm.username}
                      onChange={handleLoginChange}
                      autoComplete="username"
                    />
                    <User size={15} className="login-input-icon-right" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    <Lock size={13} strokeWidth={2.2} />
                    <span>CONTRASEÑA</span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showLoginPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-eye-btn"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      aria-label="Mostrar/ocultar contraseña"
                    >
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="login-error fade-in">
                    <AlertCircle size={14} />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  id="loginSubmitBtn"
                  type="submit"
                  className="login-submit-btn"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <><div className="loader-spin" />Autenticando...</>
                  ) : (
                    <><Lock size={16} strokeWidth={2.4} />Ingresar al Sistema</>
                  )}
                </button>
              </form>

              {/* Demo section */}
              <div className="login-demo-section">
                <div className="login-demo-divider">
                  <span className="login-demo-line" />
                  <span className="login-demo-label">ACCESO RÁPIDO (DEMO)</span>
                  <span className="login-demo-line" />
                </div>
                <div className="login-demo-btns-grid">
                  <div className="login-demo-row">
                    <button
                      type="button"
                      className="login-demo-btn"
                      onClick={() => loginDemo(DEMO_USERS[0])}
                    >
                      Jefe de Carrera
                    </button>
                    <button
                      type="button"
                      className="login-demo-btn"
                      onClick={() => loginDemo(DEMO_USERS[1])}
                    >
                      Administrador
                    </button>
                    <button
                      type="button"
                      className="login-demo-btn"
                      onClick={() => loginDemo(DEMO_USERS[2])}
                    >
                      Docente
                    </button>
                  </div>
                  <div className="login-demo-row">
                    <button
                      type="button"
                      className="login-demo-btn"
                      onClick={() => loginDemo(DEMO_USERS[3])}
                    >
                      Estudiante
                    </button>
                    <button
                      type="button"
                      className="login-demo-btn"
                      onClick={() => loginDemo(DEMO_USERS[4])}
                    >
                      Administrativo
                    </button>
                  </div>
                </div>
              </div>

              <div className="login-switch-hint">
                ¿No tienes cuenta?{' '}
                <button type="button" className="login-switch-link" onClick={() => setTab('register')}>
                  Crear cuenta
                </button>
              </div>
            </div>

            {/* ── REGISTER FORM ── */}
            <div className={`login-panel ${tab === 'register' ? 'visible' : 'hidden'}`}>
              <div className="login-form-header">
                <h2 className="login-form-title">Crear Cuenta</h2>
                <p className="login-form-sub">Complete los datos para registrarse</p>
              </div>

              <form onSubmit={handleRegSubmit} className="login-form" id="registerForm">
                {/* Nombre completo */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-nombre">
                    <User size={13} strokeWidth={2.2} />
                    <span>NOMBRE COMPLETO <span className="req-star">*</span></span>
                  </label>
                  <input
                    id="reg-nombre"
                    name="nombre"
                    type="text"
                    className="form-input"
                    placeholder="Ej: Juan Carlos Mamani"
                    value={regForm.nombre}
                    onKeyDown={(e) => {
                      if (/^[0-9]$/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    onChange={handleRegChange}
                  />
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-username">
                    <User size={13} strokeWidth={2.2} />
                    <span>USUARIO <span className="req-star">*</span></span>
                  </label>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    className="form-input"
                    placeholder="Ej: jmamani2024"
                    value={regForm.username}
                    onChange={handleRegChange}
                    autoComplete="username"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">
                    <Mail size={13} strokeWidth={2.2} />
                    <span>CORREO ELECTRÓNICO</span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="correo@emi.edu.bo"
                    value={regForm.email}
                    onChange={handleRegChange}
                    autoComplete="email"
                  />
                </div>

                {/* Rol */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-rol">
                    <ShieldCheck size={13} strokeWidth={2.2} />
                    <span>ROL</span>
                  </label>
                  <div className="login-select-wrapper">
                    <select
                      id="reg-rol"
                      name="rol"
                      className="form-input login-select"
                      value={regForm.rol}
                      onChange={handleRegChange}
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="login-select-icon" />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">
                    <Lock size={13} strokeWidth={2.2} />
                    <span>CONTRASEÑA <span className="req-star">*</span></span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-password"
                      name="password"
                      type={showRegPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Mín. 6 caracteres"
                      value={regForm.password}
                      onChange={handleRegChange}
                      autoComplete="new-password"
                    />
                    <button type="button" className="login-eye-btn" onClick={() => setShowRegPass(!showRegPass)}>
                      {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password2">
                    <Lock size={13} strokeWidth={2.2} />
                    <span>CONFIRMAR CONTRASEÑA <span className="req-star">*</span></span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-password2"
                      name="password2"
                      type={showRegPass2 ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Repita su contraseña"
                      value={regForm.password2}
                      onChange={handleRegChange}
                      autoComplete="new-password"
                    />
                    <button type="button" className="login-eye-btn" onClick={() => setShowRegPass2(!showRegPass2)}>
                      {showRegPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {regError && (
                  <div className="login-error fade-in">
                    <AlertCircle size={14} />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="login-success fade-in">
                    <CheckCircle2 size={14} />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <button
                  id="registerSubmitBtn"
                  type="submit"
                  className="login-submit-btn"
                  disabled={regLoading}
                >
                  {regLoading ? (
                    <><div className="loader-spin" />Registrando...</>
                  ) : (
                    <><UserPlus size={16} strokeWidth={2.4} />Crear Cuenta</>
                  )}
                </button>
              </form>

              <div className="login-switch-hint">
                ¿Ya tienes cuenta?{' '}
                <button type="button" className="login-switch-link" onClick={() => setTab('login')}>
                  Iniciar sesión
                </button>
              </div>
            </div>

            <div className="login-footer-text">
              <ShieldCheck size={14} strokeWidth={2} />
              <span>Conexión segura · Datos protegidos · EMI © 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
