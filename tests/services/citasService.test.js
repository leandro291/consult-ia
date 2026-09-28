import dayjs from 'dayjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar } from '@/services/storage.js'
import { atenderCita, cancelarCita, crearCita, listarCitas, reprogramarCita } from '@/services/citasService.js'

// Médico que atiende de lunes a sábado, de 08:00 a 14:00.
const MEDICO = { id: 'medico-1', consultorioId: 'consultorio-1', horario: { dias: [1, 2, 3, 4, 5, 6], inicio: '08:00', fin: '14:00' } }
const PACIENTE = { id: 'paciente-1' }

// Próxima fecha (a `diasDesdeHoy` o más) que cae en un día de atención del médico, para no depender de qué día es hoy.
function fechaValida(diasDesdeHoy = 30) {
  let fecha = dayjs().add(diasDesdeHoy, 'day')
  while (!MEDICO.horario.dias.includes(fecha.day())) fecha = fecha.add(1, 'day')
  return fecha.format('YYYY-MM-DD')
}

function datosCita(extra = {}) {
  return { pacienteId: PACIENTE.id, medicoId: MEDICO.id, fecha: fechaValida(), hora: '09:00', motivo: 'Control', ...extra }
}

describe('citasService', () => {
  beforeEach(() => {
    localStorage.clear()
    guardar(CLAVES.medicos, [MEDICO])
    guardar(CLAVES.pacientes, [PACIENTE])
  })

  describe('listarCitas', () => {
    it('devuelve un arreglo vacío si no hay citas guardadas', () => {
      expect(listarCitas()).toEqual([])
    })

    it('devuelve las citas guardadas', () => {
      const cita = crearCita(datosCita())
      expect(listarCitas()).toEqual([cita])
    })
  })

  describe('crearCita', () => {
    it('crea una cita programada con los datos del paciente y médico', () => {
      const cita = crearCita(datosCita())
      expect(cita).toMatchObject({
        pacienteId: PACIENTE.id,
        medicoId: MEDICO.id,
        consultorioId: MEDICO.consultorioId,
        duracionMin: 30,
        motivo: 'Control',
        estado: 'programada'
      })
      expect(cita.id).toEqual(expect.any(String))
    })

    it('recorta espacios del motivo y lo deja vacío si no se envía', () => {
      expect(crearCita(datosCita({ hora: '09:00', motivo: '  Control  ' })).motivo).toBe('Control')
      expect(crearCita(datosCita({ hora: '10:00', motivo: undefined })).motivo).toBe('')
    })

    it('rechaza datos incompletos antes de validar horario o solapamiento', () => {
      expect(() => crearCita(datosCita({ pacienteId: '' }))).toThrow('Seleccione un paciente.')
    })

    it('rechaza un paciente que no existe', () => {
      expect(() => crearCita(datosCita({ pacienteId: 'no-existe' }))).toThrow('El paciente seleccionado no existe.')
    })

    it('rechaza un médico que no existe', () => {
      expect(() => crearCita(datosCita({ medicoId: 'no-existe' }))).toThrow('El médico seleccionado no existe.')
    })

    it('rechaza una cita en una fecha pasada', () => {
      expect(() => crearCita(datosCita({ fecha: '2000-01-01' }))).toThrow('La cita no puede empezar en el pasado.')
    })

    it('rechaza una hora fuera del horario de atención del médico', () => {
      expect(() => crearCita(datosCita({ hora: '07:00' }))).toThrow('La cita está fuera del horario de atención del médico.')
    })

    it('acepta una cita que termina justo al cierre del horario (límite)', () => {
      expect(() => crearCita(datosCita({ hora: '13:30' }))).not.toThrow()
    })

    it('rechaza una cita que se pasa un minuto del cierre del horario (límite)', () => {
      expect(() => crearCita(datosCita({ hora: '13:31' }))).toThrow('La cita está fuera del horario de atención del médico.')
    })

    it('rechaza dos citas del mismo médico que se solapan', () => {
      crearCita(datosCita({ hora: '09:00' }))
      expect(() => crearCita(datosCita({ hora: '09:15' }))).toThrow('El médico ya tiene una cita que se solapa con ese horario.')
    })

    it('permite dos citas consecutivas del mismo médico sin solaparse (límite)', () => {
      crearCita(datosCita({ hora: '09:00' }))
      expect(() => crearCita(datosCita({ hora: '09:30' }))).not.toThrow()
    })

    it('ignora las citas canceladas al validar el solapamiento', () => {
      const cita = crearCita(datosCita({ hora: '09:00' }))
      cancelarCita(cita.id)
      expect(() => crearCita(datosCita({ hora: '09:00' }))).not.toThrow()
    })
  })

  describe('reprogramarCita', () => {
    it('cambia la fecha y hora de una cita activa', () => {
      const cita = crearCita(datosCita({ hora: '09:00' }))
      const nuevaFecha = fechaValida(31)
      const actualizada = reprogramarCita(cita.id, { fecha: nuevaFecha, hora: '10:00' })
      expect(actualizada).toMatchObject({ id: cita.id, fecha: nuevaFecha, hora: '10:00' })
    })

    it('permite reprogramar una cita al mismo horario que ya tenía (se ignora a sí misma)', () => {
      const datos = datosCita({ hora: '09:00' })
      const cita = crearCita(datos)
      expect(() => reprogramarCita(cita.id, { fecha: datos.fecha, hora: datos.hora })).not.toThrow()
    })

    it('rechaza reprogramar a un horario que choca con otra cita del mismo médico', () => {
      const cita1 = crearCita(datosCita({ hora: '09:00' }))
      crearCita(datosCita({ hora: '11:00' }))
      expect(() => reprogramarCita(cita1.id, { fecha: cita1.fecha, hora: '11:15' })).toThrow(
        'El médico ya tiene una cita que se solapa con ese horario.'
      )
    })

    it('rechaza reprogramar fuera del horario de atención', () => {
      const cita = crearCita(datosCita({ hora: '09:00' }))
      expect(() => reprogramarCita(cita.id, { fecha: cita.fecha, hora: '23:00' })).toThrow(
        'La cita está fuera del horario de atención del médico.'
      )
    })

    it('rechaza reprogramar a una fecha pasada', () => {
      const cita = crearCita(datosCita({ hora: '09:00' }))
      expect(() => reprogramarCita(cita.id, { fecha: '2000-01-01', hora: '09:00' })).toThrow(
        'La cita no puede empezar en el pasado.'
      )
    })

    it('rechaza reprogramar una cita cancelada', () => {
      const cita = crearCita(datosCita({ hora: '09:00' }))
      cancelarCita(cita.id)
      expect(() => reprogramarCita(cita.id, { fecha: fechaValida(31), hora: '10:00' })).toThrow(
        'Solo se puede reprogramar una cita programada o confirmada.'
      )
    })

    it('rechaza reprogramar una cita que no existe', () => {
      expect(() => reprogramarCita('no-existe', { fecha: fechaValida(), hora: '09:00' })).toThrow('La cita no existe.')
    })
  })

  describe('cancelarCita', () => {
    it('pasa una cita activa a estado cancelada', () => {
      const cita = crearCita(datosCita())
      expect(cancelarCita(cita.id).estado).toBe('cancelada')
    })

    it('rechaza cancelar una cita ya cancelada', () => {
      const cita = crearCita(datosCita())
      cancelarCita(cita.id)
      expect(() => cancelarCita(cita.id)).toThrow('Solo se puede cancelar una cita programada o confirmada.')
    })

    it('rechaza cancelar una cita ya atendida', () => {
      const cita = crearCita(datosCita())
      atenderCita(cita.id)
      expect(() => cancelarCita(cita.id)).toThrow('Solo se puede cancelar una cita programada o confirmada.')
    })

    it('rechaza cancelar una cita que no existe', () => {
      expect(() => cancelarCita('no-existe')).toThrow('La cita no existe.')
    })
  })

  describe('atenderCita', () => {
    it('pasa una cita activa a estado atendida', () => {
      const cita = crearCita(datosCita())
      expect(atenderCita(cita.id).estado).toBe('atendida')
    })

    it('rechaza atender una cita cancelada', () => {
      const cita = crearCita(datosCita())
      cancelarCita(cita.id)
      expect(() => atenderCita(cita.id)).toThrow('Solo se puede atender una cita programada o confirmada.')
    })

    it('rechaza atender una cita ya atendida', () => {
      const cita = crearCita(datosCita())
      atenderCita(cita.id)
      expect(() => atenderCita(cita.id)).toThrow('Solo se puede atender una cita programada o confirmada.')
    })

    it('rechaza atender una cita que no existe', () => {
      expect(() => atenderCita('no-existe')).toThrow('La cita no existe.')
    })
  })
})
