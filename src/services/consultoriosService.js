import { CLAVES, guardar, leer } from '@/services/storage.js'
import { primerError, validarConsultorio } from '@/utils/validaciones.js'

// Deja solo los campos del consultorio, sin espacios al borde.
function limpiar({ nombre, piso, descripcion }) {
  return {
    nombre: nombre.trim(),
    piso: (piso ?? '').toString().trim(),
    descripcion: (descripcion ?? '').trim()
  }
}

function validar(datos) {
  const error = primerError(validarConsultorio(datos))
  if (error) throw new Error(error)
}

export function listarConsultorios() {
  return leer(CLAVES.consultorios)
}

export function crearConsultorio(datos) {
  validar(datos)
  const consultorio = { id: crypto.randomUUID(), creadoEn: new Date().toISOString(), ...limpiar(datos) }
  guardar(CLAVES.consultorios, [...leer(CLAVES.consultorios), consultorio])
  return { ...consultorio }
}

export function actualizarConsultorio(id, datos) {
  validar(datos)
  const consultorios = leer(CLAVES.consultorios)
  const indice = consultorios.findIndex((c) => c.id === id)
  if (indice === -1) throw new Error('El consultorio no existe.')
  consultorios[indice] = { ...consultorios[indice], ...limpiar(datos) }
  guardar(CLAVES.consultorios, consultorios)
  return { ...consultorios[indice] }
}
