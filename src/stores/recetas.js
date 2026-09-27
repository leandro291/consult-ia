import { defineStore } from 'pinia'
import { useCatalogo } from '@/composables/useCatalogo.js'
import { guardarReceta, listarRecetas } from '@/services/recetasService.js'

export const useRecetasStore = defineStore('recetas', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarRecetas)

  const cargar = () => ejecutar(() => {})
  const guardar = (datos) => ejecutar(() => guardarReceta(datos))

  return { lista, cargando, error, cargar, guardar }
})
