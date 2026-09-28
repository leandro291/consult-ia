import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { anonimizar } from '@/utils/anonimizar.js'

function paciente(datos) {
  return {
    dni: '12345678',
    nombres: 'Juana',
    apellidos: 'Pérez',
    telefono: '999888777',
    email: 'juana@correo.com',
    direccion: 'Av. Siempre Viva 123',
    fechaNacimiento: '1990-01-01',
    sexo: 'F',
    alergias: [],
    antecedentes: '',
    ...datos
  }
}

describe('anonimizar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-28'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('no incluye nombre, DNI, teléfono, email ni dirección aunque el paciente los tenga', () => {
    const contexto = anonimizar(paciente({}))

    expect(contexto).not.toHaveProperty('dni')
    expect(contexto).not.toHaveProperty('nombres')
    expect(contexto).not.toHaveProperty('apellidos')
    expect(contexto).not.toHaveProperty('telefono')
    expect(contexto).not.toHaveProperty('email')
    expect(contexto).not.toHaveProperty('direccion')
    expect(JSON.stringify(contexto)).not.toContain('Juana')
    expect(JSON.stringify(contexto)).not.toContain('12345678')
  })

  it('calcula la edad en años cumplidos a partir de la fecha de nacimiento', () => {
    const contexto = anonimizar(paciente({ fechaNacimiento: '1990-01-01' }))

    expect(contexto.edad).toBe(36)
  })

  it('devuelve un arreglo vacío cuando el paciente no tiene alergias', () => {
    const contexto = anonimizar(paciente({ alergias: [] }))

    expect(contexto.alergias).toEqual([])
  })

  it('copia las alergias del paciente cuando tiene', () => {
    const contexto = anonimizar(paciente({ alergias: ['penicilina', 'sulfas'] }))

    expect(contexto.alergias).toEqual(['penicilina', 'sulfas'])
  })

  it('no muta el arreglo de alergias original del paciente', () => {
    const original = ['penicilina']
    const contexto = anonimizar(paciente({ alergias: original }))
    contexto.alergias.push('sulfas')

    expect(original).toEqual(['penicilina'])
  })

  it('devuelve cadena vacía cuando los antecedentes son undefined', () => {
    const datos = paciente({})
    delete datos.antecedentes

    const contexto = anonimizar(datos)

    expect(contexto.antecedentes).toBe('')
  })

  it('devuelve cadena vacía cuando los antecedentes ya vienen vacíos', () => {
    const contexto = anonimizar(paciente({ antecedentes: '' }))

    expect(contexto.antecedentes).toBe('')
  })

  it('conserva los antecedentes cuando el paciente los tiene', () => {
    const contexto = anonimizar(paciente({ antecedentes: 'Hipertensión' }))

    expect(contexto.antecedentes).toBe('Hipertensión')
  })

  it('conserva el sexo del paciente', () => {
    const contexto = anonimizar(paciente({ sexo: 'M' }))

    expect(contexto.sexo).toBe('M')
  })
})
