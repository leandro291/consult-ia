import { describe, expect, it } from 'vitest'
import { citasPorDiaYEstado, citasPorMedico } from '@/utils/estadisticas.js'

// 2026-09-21 es lunes.
const LUNES = '2026-09-21'

function cita(fecha, estado, medicoId = 'm1') {
  return { fecha, estado, medicoId }
}

describe('citasPorDiaYEstado', () => {
  it('suma programada y confirmada en "programadas" del día correspondiente', () => {
    const r = citasPorDiaYEstado([cita('2026-09-23', 'programada'), cita('2026-09-23', 'confirmada')], LUNES)

    expect(r.programadas).toEqual([0, 0, 2, 0, 0, 0])
  })

  it('cuenta cada estado en su serie', () => {
    const r = citasPorDiaYEstado([
      cita('2026-09-21', 'atendida'),
      cita('2026-09-26', 'cancelada'),
      cita('2026-09-24', 'no_asistio')
    ], LUNES)

    expect(r.atendidas).toEqual([1, 0, 0, 0, 0, 0])
    expect(r.canceladas).toEqual([0, 0, 0, 0, 0, 1])
    expect(r.noAsistio).toEqual([0, 0, 0, 1, 0, 0])
  })

  it('ignora domingo, la semana anterior y la siguiente', () => {
    const r = citasPorDiaYEstado([
      cita('2026-09-27', 'programada'),
      cita('2026-09-20', 'programada'),
      cita('2026-09-28', 'atendida')
    ], LUNES)

    expect(r.programadas).toEqual([0, 0, 0, 0, 0, 0])
    expect(r.atendidas).toEqual([0, 0, 0, 0, 0, 0])
  })
})

describe('citasPorMedico', () => {
  const medicos = [
    { id: 'm1', apellidos: 'Salas Quispe', especialidad: 'Medicina General' },
    { id: 'm2', apellidos: 'Paredes', especialidad: 'Pediatría' },
    { id: 'm3', apellidos: 'Montoya', especialidad: 'Cardiología' }
  ]

  it('no cuenta las canceladas y arma la etiqueta con el primer apellido', () => {
    const r = citasPorMedico([cita('2026-09-22', 'programada'), cita('2026-09-22', 'atendida'), cita('2026-09-23', 'cancelada')], medicos)

    expect(r[0]).toEqual({ medicoId: 'm1', etiqueta: 'Dr. Salas · Medicina General', total: 2 })
  })

  it('incluye al médico sin citas con 0 y ordena de mayor a menor', () => {
    const r = citasPorMedico([cita('2026-09-22', 'programada', 'm3'), cita('2026-09-22', 'programada', 'm3'), cita('2026-09-22', 'programada', 'm2')], medicos)

    expect(r.map((f) => [f.medicoId, f.total])).toEqual([['m3', 2], ['m2', 1], ['m1', 0]])
  })

  it('ignora las citas de un médico que no está en la lista', () => {
    const r = citasPorMedico([cita('2026-09-22', 'programada', 'otro')], medicos)

    expect(r.every((f) => f.total === 0)).toBe(true)
    expect(r).toHaveLength(3)
  })
})
