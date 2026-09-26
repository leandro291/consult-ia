import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import { cancelarCita, crearCita, listarCitas, reprogramarCita } from '@/services/citasService.js'

export const useCitasStore = defineStore('citas', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarCitas)

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearCita(datos))
  const reprogramar = (id, datos) => ejecutar(() => reprogramarCita(id, datos))
  const cancelar = (id) => ejecutar(() => cancelarCita(id))

  return { lista, cargando, error, cargar, crear, reprogramar, cancelar }
})
