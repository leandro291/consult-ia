import { atenderCita } from '@/services/citasService.js'
import { CLAVES, guardar, leer } from '@/services/storage.js'
import { primerError, validarConsulta } from '@/utils/validaciones.js'

export function listarConsultas() {
  return leer(CLAVES.consultas)
}

// Registra la consulta de una cita programada o confirmada y la pasa a atendida.
// Si la validación o `atenderCita` fallan, no se guarda nada ni cambia la cita.
export function registrarConsulta(datos) {
  const error = primerError(validarConsulta(datos))
  if (error) throw new Error(error)

  const cita = atenderCita(datos.citaId)

  const consulta = {
    id: crypto.randomUUID(),
    creadoEn: new Date().toISOString(),
    citaId: cita.id,
    pacienteId: cita.pacienteId,
    medicoId: cita.medicoId,
    fecha: cita.fecha,
    motivo: datos.motivo.trim(),
    signosVitales: { ...datos.signosVitales },
    examenFisico: datos.examenFisico ?? '',
    diagnosticos: datos.diagnosticos.map((d) => ({ ...d })),
    plan: datos.plan ?? '',
    observaciones: datos.observaciones ?? ''
  }
  guardar(CLAVES.consultas, [...leer(CLAVES.consultas), consulta])
  return { ...consulta }
}
