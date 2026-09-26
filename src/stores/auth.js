import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login, logout, sesionActual } from '@/services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const sesion = ref(sesionActual())
  const cargando = ref(false)
  const error = ref(null)

  function iniciarSesion(email, password) {
    cargando.value = true
    error.value = null
    try {
      sesion.value = login(email, password)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      cargando.value = false
    }
  }

  function cerrarSesion() {
    logout()
    sesion.value = null
  }

  return { sesion, cargando, error, iniciarSesion, cerrarSesion }
})
