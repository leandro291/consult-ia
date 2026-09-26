import { beforeEach, describe, expect, it } from 'vitest'
import { guardar, leer } from '@/services/storage.js'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('devuelve [] o el valor por defecto si la clave no existe', () => {
    expect(leer('clinica_x')).toEqual([])
    expect(leer('clinica_x', null)).toBeNull()
  })

  it('devuelve [] si el valor no es JSON', () => {
    localStorage.setItem('clinica_x', '{roto')
    expect(leer('clinica_x')).toEqual([])
  })

  it('guarda y lee el mismo valor', () => {
    const datos = [{ id: 1, nombre: 'Ana' }]
    guardar('clinica_x', datos)
    expect(leer('clinica_x')).toEqual(datos)
    guardar('clinica_x', null)
    expect(leer('clinica_x', null)).toBeNull()
  })
})
