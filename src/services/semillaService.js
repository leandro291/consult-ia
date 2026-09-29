import { CLAVES, guardar, leer } from '@/services/storage.js'
import { generarDatosSemilla, VERSION_SEMILLA } from '@/data/seed.js'

// Escribe todas las colecciones de demo, pisando lo existente. No toca sesión ni config.
export function cargarSemilla() {
  const datos = generarDatosSemilla()
  for (const [coleccion, registros] of Object.entries(datos)) guardar(CLAVES[coleccion], registros)
  guardar(CLAVES.version, VERSION_SEMILLA)
}

// Carga la semilla si no hay versión guardada o si es distinta de la actual.
// Al recargar por cambio de versión se limpia la sesión: la semilla regenera los ids.
export function inicializarDatos() {
  const version = leer(CLAVES.version, null)
  if (version === VERSION_SEMILLA) return
  if (version !== null) guardar(CLAVES.sesion, null)
  cargarSemilla()
}
