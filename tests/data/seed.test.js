import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { generarDatosSemilla, TRANSCRIPCION_DEMO, VERSION_SEMILLA } from '@/data/seed.js'

// Lunes, miércoles, sábado y domingo
const HOYS = ['2026-09-21', '2026-09-23', '2026-09-26', '2026-09-27']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const aMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5))

describe.each(HOYS)('generarDatosSemilla con hoy = %s', (fechaHoy) => {
  const hoy = dayjs(fechaHoy)
  const fechaTexto = hoy.format('YYYY-MM-DD')
  const datos = generarDatosSemilla(hoy)
  const { consultorios, medicos, usuarios, pacientes, citas, consultas, recetas } = datos

  it('CA14: cantidades y relaciones básicas', () => {
    expect(consultorios).toHaveLength(3)
    expect(medicos.map((m) => m.especialidad).sort()).toEqual(['Cardiología', 'Medicina General', 'Pediatría'])
    expect(usuarios).toHaveLength(4)
    expect(usuarios.filter((u) => u.rol === 'recepcion')).toHaveLength(1)
    const usuariosMedico = usuarios.filter((u) => u.rol === 'medico')
    expect(usuariosMedico).toHaveLength(3)
    usuariosMedico.forEach((u) => expect(medicos.some((m) => m.id === u.medicoId)).toBe(true))
    expect(pacientes).toHaveLength(10)
  })

  it('CA15: ids UUID únicos y creadoEn válido', () => {
    for (const coleccion of Object.values(datos)) {
      const ids = coleccion.map((r) => r.id)
      ids.forEach((id) => expect(id).toMatch(UUID))
      expect(new Set(ids).size).toBe(ids.length)
      coleccion.forEach((r) => expect(Number.isNaN(Date.parse(r.creadoEn))).toBe(false))
    }
  })

  it('CA16: DNI válidos y únicos, alergia a penicilina sin recetas conflictivas', () => {
    pacientes.forEach((p) => expect(p.dni).toMatch(/^\d{8}$/))
    expect(new Set(pacientes.map((p) => p.dni)).size).toBe(10)
    const alergicos = pacientes.filter((p) => p.alergias.includes('Penicilina'))
    expect(alergicos.length).toBeGreaterThanOrEqual(1)
    const ids = alergicos.map((p) => p.id)
    recetas.filter((r) => ids.includes(r.pacienteId)).forEach((r) =>
      r.items.forEach((i) => expect(i.medicamento).not.toMatch(/amoxicilina|ampicilina|penicilina/i))
    )
  })

  it('CA17: citas dentro de la ventana y con referencias válidas', () => {
    expect(citas.length).toBeGreaterThanOrEqual(12)
    expect(citas.length).toBeLessThanOrEqual(18)
    const desde = hoy.subtract(3, 'day').format('YYYY-MM-DD')
    const hasta = hoy.add(3, 'day').format('YYYY-MM-DD')
    for (const c of citas) {
      expect(c.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(c.fecha >= desde && c.fecha <= hasta).toBe(true)
      expect(c.hora).toMatch(/^\d{2}:\d{2}$/)
      expect(c.duracionMin).toBe(30)
      expect(pacientes.some((p) => p.id === c.pacienteId)).toBe(true)
      const medico = medicos.find((m) => m.id === c.medicoId)
      expect(medico).toBeDefined()
      expect(c.consultorioId).toBe(medico.consultorioId)
    }
  })

  it('CA18: horario del médico y sin solapamientos', () => {
    for (const c of citas) {
      const { horario } = medicos.find((m) => m.id === c.medicoId)
      expect(horario.dias).toContain(dayjs(c.fecha).day())
      expect(aMinutos(c.hora)).toBeGreaterThanOrEqual(aMinutos(horario.inicio))
      expect(aMinutos(c.hora) + 30).toBeLessThanOrEqual(aMinutos(horario.fin))
    }
    const activas = citas.filter((c) => c.estado !== 'cancelada')
    for (const a of activas) {
      for (const b of activas) {
        if (a === b || a.medicoId !== b.medicoId || a.fecha !== b.fecha) continue
        const inicioA = aMinutos(a.hora)
        const inicioB = aMinutos(b.hora)
        expect(inicioA < inicioB + 30 && inicioB < inicioA + 30).toBe(false)
      }
    }
  })

  it('CA19: estados coherentes con la fecha', () => {
    for (const c of citas) {
      const esperados = c.fecha < fechaTexto
        ? ['atendida', 'no_asistio', 'cancelada']
        : ['programada', 'confirmada', 'cancelada']
      expect(esperados).toContain(c.estado)
    }
    expect(new Set(citas.map((c) => c.estado)).size).toBeGreaterThanOrEqual(4)
    if (hoy.day() !== 0) expect(citas.some((c) => c.fecha === fechaTexto)).toBe(true)
  })

  it('CA20: una consulta por cita atendida', () => {
    const atendidas = citas.filter((c) => c.estado === 'atendida')
    expect(consultas.length).toBeGreaterThanOrEqual(2)
    expect(consultas).toHaveLength(atendidas.length)
    for (const a of atendidas) expect(consultas.filter((c) => c.citaId === a.id)).toHaveLength(1)
    for (const consulta of consultas) {
      const cita = atendidas.find((c) => c.id === consulta.citaId)
      expect(cita).toBeDefined()
      expect(consulta.pacienteId).toBe(cita.pacienteId)
      expect(consulta.medicoId).toBe(cita.medicoId)
      expect(consulta.fecha).toBe(cita.fecha)
    }
  })

  it('CA21: recetas ligadas a consultas existentes', () => {
    expect(recetas.length).toBeGreaterThanOrEqual(1)
    for (const r of recetas) {
      const consulta = consultas.find((c) => c.id === r.consultaId)
      expect(consulta).toBeDefined()
      expect(r.pacienteId).toBe(consulta.pacienteId)
      expect(r.medicoId).toBe(consulta.medicoId)
      expect(r.items.length).toBeGreaterThan(0)
      r.items.forEach((item) =>
        expect(Object.keys(item).sort()).toEqual(['dosis', 'duracion', 'frecuencia', 'indicaciones', 'medicamento', 'via'])
      )
    }
  })
})

describe('constantes de la semilla', () => {
  it('CA22: la transcripción de demo es la de CLAUDE.md', () => {
    expect(TRANSCRIPCION_DEMO).toBe(
      'Paciente refiere fiebre desde hace tres días y dolor de garganta al tragar. Temperatura 38.5, presión 120 sobre 80, frecuencia cardiaca 92. Amígdalas inflamadas con placas blanquecinas, sin tos. Impresión diagnóstica faringitis bacteriana. Indico amoxicilina 500 miligramos cada 8 horas por 7 días y paracetamol 500 miligramos cada 8 horas si hay fiebre. Control en una semana.'
    )
  })

  it('la versión de la semilla es 1', () => {
    expect(VERSION_SEMILLA).toBe(1)
  })
})
