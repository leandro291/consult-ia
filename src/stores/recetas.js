import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useCatalogo } from '@/composables/useCatalogo.js'
import { guardarReceta, listarRecetas } from '@/services/recetasService.js'

export const useRecetasStore = defineStore('recetas', () => {
  const { lista, cargando, error, ejecutar } = useCatalogo(listarRecetas)

  const cargar = () => ejecutar(() => {})
  const guardar = (datos) => ejecutar(() => guardarReceta(datos))

  // Borrador de receta de la IA, en memoria y por cita (RF6 del spec 018): lo arma "Atender cita"
  // al guardar la consulta y lo consume "Emitir receta" si todavía no hay receta guardada. No se
  // persiste: recargar la página antes de emitir la receta lo pierde.
  const borradores = reactive(new Map())

  function fijarBorrador(citaId, borrador) {
    borradores.set(citaId, borrador)
  }

  // Devuelve el borrador de la cita y lo quita del mapa.
  function tomarBorrador(citaId) {
    const borrador = borradores.get(citaId) ?? null
    borradores.delete(citaId)
    return borrador
  }

  return { lista, cargando, error, cargar, guardar, fijarBorrador, tomarBorrador }
})
