import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  actualizarConsultorio,
  crearConsultorio,
  listarConsultorios
} from '@/services/consultoriosService.js'

export const useConsultoriosStore = defineStore('consultorios', () => {
  const lista = ref([])
  const cargando = ref(false)
  const error = ref(null)

  // Ejecuta una acción del servicio y refresca la lista. Devuelve true si salió bien.
  function ejecutar(accion) {
    cargando.value = true
    error.value = null
    try {
      accion()
      lista.value = listarConsultorios()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      cargando.value = false
    }
  }

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearConsultorio(datos))
  const actualizar = (id, datos) => ejecutar(() => actualizarConsultorio(id, datos))

  return { lista, cargando, error, cargar, crear, actualizar }
})
