import { CLAVES, guardar, leer } from '@/services/storage.js'
import { primerError, validarPaciente } from '@/utils/validaciones.js'
import { nombreCompleto } from '@/utils/formato.js'

// Deja solo los campos del paciente: textos sin espacios al borde y alergias sin vacíos ni repetidas.
function limpiar(datos) {
  const texto = (valor) => (valor ?? '').trim()
  return {
    dni: texto(datos.dni),
    nombres: texto(datos.nombres),
    apellidos: texto(datos.apellidos),
    fechaNacimiento: datos.fechaNacimiento,
    sexo: datos.sexo,
    telefono: texto(datos.telefono),
    email: texto(datos.email),
    direccion: texto(datos.direccion),
    grupoSanguineo: datos.grupoSanguineo ?? '',
    alergias: [...new Set((datos.alergias ?? []).map(texto).filter(Boolean))],
    antecedentes: texto(datos.antecedentes)
  }
}

function validar(datos, idActual = null) {
  const error = primerError(validarPaciente(datos))
  if (error) throw new Error(error)
  const dni = datos.dni.trim()
  const repetido = leer(CLAVES.pacientes).find((p) => p.dni === dni && p.id !== idActual)
  if (repetido) throw new Error(`Ya existe un paciente con este DNI (${nombreCompleto(repetido)}).`)
}

// Lista ordenada por apellido, con `totalConsultas` y `ultimaConsulta` derivados (no se guardan).
export function listarPacientes() {
  const consultas = leer(CLAVES.consultas) // Solo lectura: las consultas son de otro dominio.
  return leer(CLAVES.pacientes)
    .map((paciente) => {
      const suyas = consultas.filter((c) => c.pacienteId === paciente.id)
      const ultima = suyas.map((c) => c.fecha).sort().at(-1) ?? null
      return { ...paciente, totalConsultas: suyas.length, ultimaConsulta: ultima }
    })
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es') || a.nombres.localeCompare(b.nombres, 'es'))
}

export function obtenerPaciente(id) {
  const paciente = listarPacientes().find((p) => p.id === id)
  if (!paciente) throw new Error('El paciente no existe.')
  return paciente
}

export function crearPaciente(datos) {
  validar(datos)
  const paciente = { id: crypto.randomUUID(), creadoEn: new Date().toISOString(), ...limpiar(datos) }
  guardar(CLAVES.pacientes, [...leer(CLAVES.pacientes), paciente])
  return { ...paciente }
}

export function actualizarPaciente(id, datos) {
  validar(datos, id)
  const pacientes = leer(CLAVES.pacientes)
  const indice = pacientes.findIndex((p) => p.id === id)
  if (indice === -1) throw new Error('El paciente no existe.')
  pacientes[indice] = { ...pacientes[indice], ...limpiar(datos) }
  guardar(CLAVES.pacientes, pacientes)
  return { ...pacientes[indice] }
}

export function eliminarPaciente(id) {
  const paciente = obtenerPaciente(id)
  if (paciente.totalConsultas > 0) {
    throw new Error(
      `No se puede eliminar a ${nombreCompleto(paciente)}: tiene ${paciente.totalConsultas} consultas registradas.`
    )
  }
  guardar(CLAVES.pacientes, leer(CLAVES.pacientes).filter((p) => p.id !== id))
}
