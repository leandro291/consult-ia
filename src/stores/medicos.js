import { ref } from 'vue'
import { defineStore } from 'pinia'
import { actualizarMedico, crearMedico, listarMedicos } from '@/services/medicosService.js'

export const useMedicosStore = defineStore('medicos', () => {
  const lista = ref([])
  const cargando = ref(false)
  const error = ref(null)

  // Ejecuta una acción del servicio y refresca la lista. Devuelve true si salió bien.
  function ejecutar(accion) {
    cargando.value = true
    error.value = null
    try {
      accion()
      lista.value = listarMedicos()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      cargando.value = false
    }
  }

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearMedico(datos))
  const actualizar = (id, datos) => ejecutar(() => actualizarMedico(id, datos))

  return { lista, cargando, error, cargar, crear, actualizar }
})
