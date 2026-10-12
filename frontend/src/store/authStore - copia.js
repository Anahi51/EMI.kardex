/**
 * ================================================================
 * ARCHIVO: authStore.js
 * MÓDULO:  Store de Autenticación (Zustand)
 * SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
 * ================================================================
 *
 * DESCRIPCIÓN:
 *   Almacén global de estado para la sesión del usuario.
 *   Utiliza Zustand para manejar el estado de autenticación
 *   de forma reactiva en toda la aplicación React.
 *
 *   Los datos del token y usuario se persisten en localStorage
 *   para mantener la sesión activa al recargar la página.
 *
 * ROLES QUE USAN ESTE STORE:
 *   - Administrador : Inicia sesión con rol admin; accede a todos los módulos.
 *   - Secretaría    : Inicia sesión con rol secretaria; gestiona estudiantes y certificados.
 *   - Docente       : Inicia sesión con rol docente; registra calificaciones.
 *   - Estudiante    : Inicia sesión con rol estudiante; consulta su kardex.
 *
 * LLAVES EN localStorage:
 *   - 'emi_token' : JWT de autenticación enviado en cada petición al backend.
 *   - 'emi_user'  : Objeto JSON con los datos del usuario logueado.
 *
 * ================================================================
 */

import { create } from 'zustand'  // Librería de manejo de estado global ligera

/**
 * useAuthStore
 * ------------
 * Hook personalizado que expone el estado de autenticación
 * y las acciones para manipularlo.
 *
 * ESTADO:
 *   - user            {Object|null} : Datos del usuario logueado (nombre, rol, etc.)
 *   - token           {string|null} : JWT almacenado en localStorage.
 *   - isAuthenticated {boolean}     : true si hay un token válido en localStorage.
 *
 * ACCIONES:
 *   - login(user, token) : Guarda la sesión en estado y localStorage.
 *   - logout()           : Limpia la sesión del estado y localStorage.
 *   - setUser(user)      : Actualiza los datos del usuario sin tocar el token.
 *   - loadUser()         : Recupera los datos del usuario desde localStorage al iniciar la app.
 */
const useAuthStore = create((set) => ({

  // ----- ESTADO INICIAL -----

  user: (() => {
    try {
      const u = localStorage.getItem('emi_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })(),
  // Datos del usuario actualmente logueado (null si no hay sesión)

  token: localStorage.getItem('emi_token') || null,
  // JWT recuperado de localStorage; null si no existe

  isAuthenticated: !!localStorage.getItem('emi_token'),
  // true si existe el token en localStorage (doble negación convierte a booleano)


  // ----- ACCIÓN: login -----
  /**
   * Inicia sesión guardando el token y los datos del usuario.
   *
   * @param {Object} user  - Datos del usuario (nombre, rol, ci, etc.)
   * @param {string} token - JWT recibido del backend tras autenticarse.
   *
   * Uso: login({ nombre: 'Juan', rol: 'admin' }, 'eyJhbGci...')
   */
  login: (user, token) => {
    localStorage.setItem('emi_token', token)                // Persiste el token en localStorage
    localStorage.setItem('emi_user', JSON.stringify(user))  // Persiste el usuario como JSON
    set({ user, token, isAuthenticated: true })             // Actualiza el estado global
  },


  // ----- ACCIÓN: logout -----
  /**
   * Cierra sesión eliminando el token y los datos del usuario.
   * Limpia tanto el estado global como localStorage.
   *
   * Uso: logout()
   */
  logout: () => {
    localStorage.removeItem('emi_token')  // Elimina el token de localStorage
    localStorage.removeItem('emi_user')   // Elimina el usuario de localStorage
    set({ user: null, token: null, isAuthenticated: false })  // Resetea el estado
  },


  // ----- ACCIÓN: setUser -----
  /**
   * Actualiza únicamente los datos del usuario en el estado global.
   * No modifica el token ni isAuthenticated.
   *
   * @param {Object} user - Nuevos datos del usuario.
   *
   * Uso: setUser({ nombre: 'Juan Actualizado', rol: 'docente' })
   */
  setUser: (user) => {
    try {
      localStorage.setItem('emi_user', JSON.stringify(user))
    } catch {}
    set({ user })
  },


  // ----- ACCIÓN: loadUser -----
  /**
   * Recupera los datos del usuario desde localStorage al iniciar la app.
   * Se llama en App.jsx dentro de useEffect para restaurar la sesión.
   *
   * Si 'emi_user' existe en localStorage, lo parsea y lo carga en el estado.
   *
   * Uso: loadUser()   (llamado automáticamente al montar App.jsx)
   */
  loadUser: () => {
    const storedUser = localStorage.getItem('emi_user')  // Intenta leer el usuario guardado
    if (storedUser) {
      set({ user: JSON.parse(storedUser) })  // Parsea el JSON y actualiza el estado
    }
  },
}))

export default useAuthStore
