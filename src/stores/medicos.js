import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import { actualizarMedico, crearMedico, listarMedicos } from '@/services/medicosService.js'

export const useMedicosStore = defineStore('medicos', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarMedicos)

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearMedico(datos))
  const actualizar = (id, datos) => ejecutar(() => actualizarMedico(id, datos))

  return { lista, cargando, error, cargar, crear, actualizar }
})
