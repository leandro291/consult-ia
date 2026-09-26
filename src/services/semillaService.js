import { CLAVES, guardar, leer } from '@/services/storage.js'
import { generarDatosSemilla, VERSION_SEMILLA } from '@/data/seed.js'

// Escribe todas las colecciones de demo, pisando lo existente. No toca sesión ni config.
export function cargarSemilla() {
  const datos = generarDatosSemilla()
  for (const [coleccion, registros] of Object.entries(datos)) guardar(CLAVES[coleccion], registros)
  guardar(CLAVES.version, VERSION_SEMILLA)
}

// Carga la semilla solo la primera vez (cuando no existe clinica_version).
export function inicializarDatos() {
  if (leer(CLAVES.version, null) === null) cargarSemilla()
}
