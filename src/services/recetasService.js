import { CLAVES, guardar, leer } from '@/services/storage.js'
import { primerErrorReceta, validarReceta } from '@/utils/validaciones.js'

// Deja solo los campos de cada medicamento, sin espacios al borde.
function limpiarItems(items) {
  const texto = (valor) => (valor ?? '').trim()
  return items.map((item) => ({
    medicamento: texto(item.medicamento),
    dosis: texto(item.dosis),
    frecuencia: texto(item.frecuencia),
    duracion: texto(item.duracion),
    via: item.via,
    indicaciones: texto(item.indicaciones)
  }))
}

export function listarRecetas() {
  return leer(CLAVES.recetas)
}

// Una receta por consulta (RF7): crea la primera vez y actualiza las siguientes. El paciente,
// el médico y la fecha salen de la consulta, no del formulario ("Una receta siempre pertenece
// a una consulta existente").
export function guardarReceta(datos) {
  const error = primerErrorReceta(validarReceta(datos))
  if (error) throw new Error(error)

  const consulta = leer(CLAVES.consultas).find((c) => c.id === datos.consultaId)
  if (!consulta) throw new Error('La consulta no existe.')

  const recetas = leer(CLAVES.recetas)
  const indice = recetas.findIndex((r) => r.consultaId === consulta.id)

  const receta = {
    id: indice === -1 ? crypto.randomUUID() : recetas[indice].id,
    creadoEn: indice === -1 ? new Date().toISOString() : recetas[indice].creadoEn,
    consultaId: consulta.id,
    pacienteId: consulta.pacienteId,
    medicoId: consulta.medicoId,
    fecha: consulta.fecha,
    items: limpiarItems(datos.items),
    indicacionesGenerales: (datos.indicacionesGenerales ?? '').trim()
  }

  if (indice === -1) {
    guardar(CLAVES.recetas, [...recetas, receta])
  } else {
    recetas[indice] = receta
    guardar(CLAVES.recetas, recetas)
  }
  return { ...receta }
}
