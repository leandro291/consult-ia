import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, leer } from '@/services/storage.js'
import { cargarSemilla } from '@/services/semillaService.js'
import { login, logout, sesionActual } from '@/services/authService.js'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    cargarSemilla()
  })

  it('inicia sesión y la persiste', () => {
    const sesion = login('recepcion@clinica.com', '123456')
    expect(sesion).toEqual({ usuarioId: expect.any(String), rol: 'recepcion', nombre: expect.any(String) })
    expect(sesionActual()).toEqual(sesion)
  })

  it('ignora mayúsculas y espacios en el correo', () => {
    expect(login('  Medico1@Clinica.com ', '123456').rol).toBe('medico')
  })

  it('rechaza credenciales incorrectas sin guardar sesión', () => {
    const mensaje = 'Correo o contraseña incorrectos.'
    expect(() => login('recepcion@clinica.com', 'mala')).toThrow(mensaje)
    expect(() => login('nadie@clinica.com', '123456')).toThrow(mensaje)
    expect(sesionActual()).toBeNull()
    expect(leer(CLAVES.sesion, null)).toBeNull()
  })

  it('cierra la sesión', () => {
    login('recepcion@clinica.com', '123456')
    logout()
    expect(sesionActual()).toBeNull()
  })

  it('devuelve copias de la sesión', () => {
    login('recepcion@clinica.com', '123456')
    sesionActual().rol = 'hacker'
    expect(sesionActual().rol).toBe('recepcion')
  })
})
