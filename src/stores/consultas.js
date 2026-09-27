import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import { listarConsultas, registrarConsulta } from '@/services/consultasService.js'

export const useConsultasStore = defineStore('consultas', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarConsultas)

  const cargar = () => ejecutar(() => {})
  const registrar = (datos) => ejecutar(() => registrarConsulta(datos))

  return { lista, cargando, error, cargar, registrar }
})
