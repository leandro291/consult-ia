import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import {
  actualizarPaciente,
  crearPaciente,
  eliminarPaciente,
  listarPacientes,
  obtenerPaciente
} from '@/services/pacientesService.js'

export const usePacientesStore = defineStore('pacientes', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarPacientes)

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearPaciente(datos))
  const actualizar = (id, datos) => ejecutar(() => actualizarPaciente(id, datos))
  const eliminar = (id) => ejecutar(() => eliminarPaciente(id))

  // Devuelve el paciente (con sus campos derivados) o null si no existe.
  function obtener(id) {
    try {
      return obtenerPaciente(id)
    } catch {
      return null
    }
  }

  return { lista, cargando, error, cargar, crear, actualizar, eliminar, obtener }
})
