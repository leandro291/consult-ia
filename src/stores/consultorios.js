import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import {
  actualizarConsultorio,
  crearConsultorio,
  listarConsultorios
} from '@/services/consultoriosService.js'

export const useConsultoriosStore = defineStore('consultorios', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarConsultorios)

  const cargar = () => ejecutar(() => {})
  const crear = (datos) => ejecutar(() => crearConsultorio(datos))
  const actualizar = (id, datos) => ejecutar(() => actualizarConsultorio(id, datos))

  return { lista, cargando, error, cargar, crear, actualizar }
})
