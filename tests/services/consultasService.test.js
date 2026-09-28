import dayjs from 'dayjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar } from '@/services/storage.js'
import { cancelarCita, crearCita } from '@/services/citasService.js'
import { listarConsultas, registrarConsulta } from '@/services/consultasService.js'

// Médico que atiende de lunes a sábado, de 08:00 a 14:00 (igual que citasService.test.js).
const MEDICO = { id: 'medico-1', consultorioId: 'consultorio-1', horario: { dias: [1, 2, 3, 4, 5, 6], inicio: '08:00', fin: '14:00' } }
const PACIENTE = { id: 'paciente-1' }

function fechaValida(diasDesdeHoy = 30) {
  let fecha = dayjs().add(diasDesdeHoy, 'day')
  while (!MEDICO.horario.dias.includes(fecha.day())) fecha = fecha.add(1, 'day')
  return fecha.format('YYYY-MM-DD')
}

function crearCitaDePrueba(extra = {}) {
  return crearCita({ pacienteId: PACIENTE.id, medicoId: MEDICO.id, fecha: fechaValida(), hora: '09:00', motivo: 'Control', ...extra })
}

function datosConsulta(citaId, extra = {}) {
  return {
    citaId,
    motivo: 'Dolor de cabeza',
    signosVitales: { presion: '120/80', frecuenciaCardiaca: 80, temperatura: 36.5, peso: 70, talla: 170 },
    examenFisico: 'Sin hallazgos',
    diagnosticos: [{ codigo: null, descripcion: 'Cefalea' }],
    plan: 'Reposo',
    observaciones: '',
    ...extra
  }
}

describe('consultasService', () => {
  beforeEach(() => {
    localStorage.clear()
    guardar(CLAVES.medicos, [MEDICO])
    guardar(CLAVES.pacientes, [PACIENTE])
  })

  describe('listarConsultas', () => {
    it('devuelve un arreglo vacío si no hay consultas guardadas', () => {
      expect(listarConsultas()).toEqual([])
    })

    it('devuelve las consultas guardadas', () => {
      const cita = crearCitaDePrueba()
      const consulta = registrarConsulta(datosConsulta(cita.id))
      expect(listarConsultas()).toEqual([consulta])
    })
  })

  describe('registrarConsulta', () => {
    it('registra la consulta con los datos de la cita y la marca creadoEn como ISO', () => {
      const cita = crearCitaDePrueba()
      const consulta = registrarConsulta(datosConsulta(cita.id))
      expect(consulta).toMatchObject({
        citaId: cita.id,
        pacienteId: cita.pacienteId,
        medicoId: cita.medicoId,
        fecha: cita.fecha,
        motivo: 'Dolor de cabeza'
      })
      expect(consulta.id).toEqual(expect.any(String))
      expect(consulta.creadoEn).toBe(new Date(consulta.creadoEn).toISOString())
    })

    it('guarda la consulta en localStorage', () => {
      const cita = crearCitaDePrueba()
      const consulta = registrarConsulta(datosConsulta(cita.id))
      expect(listarConsultas()).toEqual([consulta])
    })

    it('pasa la cita asociada a estado atendida', () => {
      const cita = crearCitaDePrueba()
      registrarConsulta(datosConsulta(cita.id))
      const citasGuardadas = JSON.parse(localStorage.getItem(CLAVES.citas))
      expect(citasGuardadas.find((c) => c.id === cita.id).estado).toBe('atendida')
    })

    it('rechaza registrar una consulta de una cita cancelada', () => {
      const cita = crearCitaDePrueba()
      cancelarCita(cita.id)
      expect(() => registrarConsulta(datosConsulta(cita.id))).toThrow('Solo se puede atender una cita programada o confirmada.')
    })

    it('rechaza registrar una consulta de una cita ya atendida', () => {
      const cita = crearCitaDePrueba()
      registrarConsulta(datosConsulta(cita.id))
      expect(() => registrarConsulta(datosConsulta(cita.id))).toThrow('Solo se puede atender una cita programada o confirmada.')
    })

    it('rechaza registrar una consulta de una cita que no existe', () => {
      expect(() => registrarConsulta(datosConsulta('no-existe'))).toThrow('La cita no existe.')
    })

    it('no guarda nada ni cambia la cita si la validación falla', () => {
      const cita = crearCitaDePrueba()
      expect(() => registrarConsulta(datosConsulta(cita.id, { motivo: '' }))).toThrow('El motivo es obligatorio.')
      expect(listarConsultas()).toEqual([])
      const citasGuardadas = JSON.parse(localStorage.getItem(CLAVES.citas))
      expect(citasGuardadas.find((c) => c.id === cita.id).estado).toBe('programada')
    })

    it('guarda generadaConIA y transcripcion cuando la consulta se generó con el asistente', () => {
      const cita = crearCitaDePrueba()
      const consulta = registrarConsulta(datosConsulta(cita.id, { generadaConIA: true, transcripcion: 'texto dictado' }))
      expect(consulta.generadaConIA).toBe(true)
      expect(consulta.transcripcion).toBe('texto dictado')
    })

    it('no agrega generadaConIA ni transcripcion cuando la consulta no se generó con IA', () => {
      const cita = crearCitaDePrueba()
      const consulta = registrarConsulta(datosConsulta(cita.id))
      expect(consulta).not.toHaveProperty('generadaConIA')
      expect(consulta).not.toHaveProperty('transcripcion')
    })
  })
})
