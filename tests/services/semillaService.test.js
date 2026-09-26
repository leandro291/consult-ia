import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar, leer } from '@/services/storage.js'
import { cargarSemilla, inicializarDatos } from '@/services/semillaService.js'

const COLECCIONES = ['usuarios', 'pacientes', 'medicos', 'consultorios', 'citas', 'consultas', 'recetas']

describe('semillaService', () => {
  beforeEach(() => localStorage.clear())

  it('carga las 7 colecciones y la versión en un localStorage vacío', () => {
    inicializarDatos()
    COLECCIONES.forEach((c) => expect(leer(CLAVES[c]).length).toBeGreaterThan(0))
    expect(leer(CLAVES.version, null)).toBe(1)
  })

  it('no pisa datos si la versión ya existe', () => {
    inicializarDatos()
    guardar(CLAVES.pacientes, [{ id: 'x' }])
    const antes = { ...localStorage }
    inicializarDatos()
    expect({ ...localStorage }).toEqual(antes)
  })

  it('cargarSemilla no cambia la sesión', () => {
    const sesion = { usuarioId: 'u1', rol: 'medico', nombre: 'Dr. X' }
    guardar(CLAVES.sesion, sesion)
    cargarSemilla()
    expect(leer(CLAVES.sesion, null)).toEqual(sesion)
  })
})
