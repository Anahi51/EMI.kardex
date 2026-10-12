/**
 * ================================================================
 * ARCHIVO: api.js
 * MÓDULO:  Servicios de API - Capa de Comunicación con el Backend
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 */

import axios from 'axios'

const API_BASE        = import.meta.env.VITE_API_URL        || 'http://localhost:8000/api'
const BLOCKCHAIN_BASE = import.meta.env.VITE_BLOCKCHAIN_URL || 'http://localhost:3001/api'

const djangoApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

const blockchainApi = axios.create({
  baseURL: BLOCKCHAIN_BASE,
  headers: { 'Content-Type': 'application/json' },
})

const isRealBackendToken = (token) => {
  return typeof token === 'string' && token.startsWith('eyJ')
}

const authInterceptor = (config) => {
  const token = localStorage.getItem('emi_token')
  // Solo enviamos Authorization si es un JWT real generado por el backend Django (inicia con eyJ)
  // De esta manera, tokens locales (demo, admin, fallback) nunca provocan errores 401 en el servidor
  if (token && isRealBackendToken(token)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

djangoApi.interceptors.request.use(authInterceptor)
blockchainApi.interceptors.request.use(authInterceptor)

/**
 * errorInterceptor
 * ----------------
 * Manejador global de errores HTTP.
 * Previene expulsar o reiniciar la sesión cuando se usan credenciales locales o cuando falla un endpoint.
 */
const errorInterceptor = (error) => {
  if (error.response?.status === 401) {
    const url = error.config?.url || ''
    // Si el error 401 proviene del intento de login o registro, dejar que el catch del componente lo procese
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(error)
    }

    const token = localStorage.getItem('emi_token')
    // Si el usuario está usando una sesión local/demo, NO expulsarlo bajo ninguna circunstancia
    if (!token || !isRealBackendToken(token)) {
      return Promise.reject(error)
    }

    // Si es un token real de backend que expiró y no estamos ya en login, limpiar sesión
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('emi_token')
      localStorage.removeItem('emi_user')
      window.location.href = '/login'
    }
  }
  return Promise.reject(error)
}

djangoApi.interceptors.response.use((r) => r, errorInterceptor)
blockchainApi.interceptors.response.use((r) => r, errorInterceptor)

export const authService = {
  login:          (credentials) => djangoApi.post('/auth/login/', credentials),
  register:       (data)        => djangoApi.post('/auth/register/', data),
  logout:         ()            => djangoApi.post('/auth/logout/'),
  getProfile:     ()            => djangoApi.get('/auth/profile/'),
  changePassword: (data)        => djangoApi.post('/auth/change-password/', data),
}

export const estudiantesService = {
  getAll:   (params)     => djangoApi.get('/estudiantes/', { params }),
  getById:  (id)         => djangoApi.get(`/estudiantes/${id}/`),
  create:   (data)       => djangoApi.post('/estudiantes/', data),
  update:   (id, data)   => djangoApi.put(`/estudiantes/${id}/`, data),
  delete:   (id)         => djangoApi.delete(`/estudiantes/${id}/`),
  getKardex:(id)         => djangoApi.get(`/estudiantes/${id}/kardex/`),
}

export const docentesService = {
  getAll:  (params)   => djangoApi.get('/docentes/', { params }),
  getById: (id)       => djangoApi.get(`/docentes/${id}/`),
  create:  (data)     => djangoApi.post('/docentes/', data),
  update:  (id, data) => djangoApi.put(`/docentes/${id}/`, data),
  delete:  (id)       => djangoApi.delete(`/docentes/${id}/`),
}

export const materiasService = {
  getAll:  (params)   => djangoApi.get('/materias/', { params }),
  getById: (id)       => djangoApi.get(`/materias/${id}/`),
  create:  (data)     => djangoApi.post('/materias/', data),
  update:  (id, data) => djangoApi.put(`/materias/${id}/`, data),
  delete:  (id)       => djangoApi.delete(`/materias/${id}/`),
}

export const calificacionesService = {
  getAll:     (params)   => djangoApi.get('/calificaciones/', { params }),
  getById:    (id)       => djangoApi.get(`/calificaciones/${id}/`),
  create:     (data)     => djangoApi.post('/calificaciones/', data),
  update:     (id, data) => djangoApi.put(`/calificaciones/${id}/`),
  getMiKardex:()         => djangoApi.get('/calificaciones/mi-kardex/'),
}

export const gestionesService = {
  getAll:  ()         => djangoApi.get('/gestiones/'),
  getById: (id)       => djangoApi.get(`/gestiones/${id}/`),
  create:  (data)     => djangoApi.post('/gestiones/', data),
  update:  (id, data) => djangoApi.put(`/gestiones/${id}/`),
}

export const carrerasService = {
  getAll: () => djangoApi.get('/carreras/'),
}

export const blockchainService = {
  getStatus:   ()       => blockchainApi.get('/blockchain/status'),
  getBlocks:   (params) => blockchainApi.get('/blockchain/blocks', { params }),
  getBlock:    (index)  => blockchainApi.get(`/blockchain/blocks/${index}`),
  verifyChain: ()       => blockchainApi.get('/blockchain/verify'),
  verifyHash:  (hash)   => blockchainApi.post('/blockchain/verify-hash', { hash }),
  getStats:    ()       => blockchainApi.get('/blockchain/stats'),
}

export const certificadosService = {
  getAll:   ()       => djangoApi.get('/certificados/'),
  generate: (data)   => djangoApi.post('/certificados/generate/', data),
  verify:   (codigo) => djangoApi.get(`/certificados/verify/${codigo}/`),
}

export const reportesService = {
  getDashboard:   ()       => djangoApi.get('/reportes/dashboard/'),
  getRendimiento: (params) => djangoApi.get('/reportes/rendimiento/', { params }),
  getResumen:     (params) => djangoApi.get('/reportes/resumen/', { params }),
}

export const auditService = {
  getAll: (params) => djangoApi.get('/audit/', { params }),
}

export { djangoApi, blockchainApi }
