import dayjs from 'dayjs'
import { DURACION_CITA_MIN } from '@/data/seed.js'
import { CLAVES, guardar, leer } from '@/services/storage.js'
import {
  citaDentroDelHorario,
  citasSeSolapan,
  primerError,
  validarCita
} from '@/utils/validaciones.js'

const ESTADOS_ACTIVOS = ['programada', 'confirmada']

// Aplica las reglas de horario y solapamiento. `idIgnorado` evita comparar la cita consigo misma al reprogramar.
function validarAgenda(medico, cita, idIgnorado = null) {
  if (!citaDentroDelHorario(cita, medico.horario)) {
    const { inicio, fin } = medico.horario
    const ultima = dayjs(`2000-01-01T${fin}`).subtract(cita.duracionMin, 'minute').format('HH:mm')
    throw new Error(
      `La cita está fuera del horario de atención del médico (${inicio}–${fin}; la última cita puede empezar a las ${ultima}).`
    )
  }
  const choca = leer(CLAVES.citas).some(
    (c) => c.id !== idIgnorado && c.medicoId === medico.id && c.estado !== 'cancelada' && citasSeSolapan(c, cita)
  )
  if (choca) throw new Error('El médico ya tiene una cita que se solapa con ese horario.')
}

function buscarActiva(citas, id, accion) {
  const indice = citas.findIndex((c) => c.id === id)
  if (indice === -1) throw new Error('La cita no existe.')
  if (!ESTADOS_ACTIVOS.includes(citas[indice].estado)) {
    throw new Error(`Solo se puede ${accion} una cita programada o confirmada.`)
  }
  return indice
}

export function listarCitas() {
  return leer(CLAVES.citas)
}

export function crearCita(datos) {
  const error = primerError(validarCita(datos))
  if (error) throw new Error(error)
  // Solo lectura: paciente y médico pertenecen a sus propios servicios.
  if (!leer(CLAVES.pacientes).some((p) => p.id === datos.pacienteId)) {
    throw new Error('El paciente seleccionado no existe.')
  }
  const medico = leer(CLAVES.medicos).find((m) => m.id === datos.medicoId)
  if (!medico) throw new Error('El médico seleccionado no existe.')

  const cita = {
    id: crypto.randomUUID(),
    creadoEn: new Date().toISOString(),
    pacienteId: datos.pacienteId,
    medicoId: medico.id,
    consultorioId: medico.consultorioId,
    fecha: datos.fecha,
    hora: datos.hora,
    duracionMin: DURACION_CITA_MIN,
    motivo: (datos.motivo ?? '').trim(),
    estado: 'programada'
  }
  validarAgenda(medico, cita)
  guardar(CLAVES.citas, [...leer(CLAVES.citas), cita])
  return { ...cita }
}

export function reprogramarCita(id, { fecha, hora }) {
  const citas = leer(CLAVES.citas)
  const indice = buscarActiva(citas, id, 'reprogramar')
  const actual = citas[indice]
  const error = primerError(validarCita({ ...actual, fecha, hora }))
  if (error) throw new Error(error)
  const medico = leer(CLAVES.medicos).find((m) => m.id === actual.medicoId)
  if (!medico) throw new Error('El médico de la cita no existe.')

  citas[indice] = { ...actual, fecha, hora }
  validarAgenda(medico, citas[indice], id)
  guardar(CLAVES.citas, citas)
  return { ...citas[indice] }
}

export function cancelarCita(id) {
  const citas = leer(CLAVES.citas)
  const indice = buscarActiva(citas, id, 'cancelar')
  citas[indice] = { ...citas[indice], estado: 'cancelada' }
  guardar(CLAVES.citas, citas)
  return { ...citas[indice] }
}

export function atenderCita(id) {
  const citas = leer(CLAVES.citas)
  const indice = buscarActiva(citas, id, 'atender')
  citas[indice] = { ...citas[indice], estado: 'atendida' }
  guardar(CLAVES.citas, citas)
  return { ...citas[indice] }
}
