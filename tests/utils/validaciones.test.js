import { describe, expect, it } from 'vitest'
import { validarLogin } from '@/utils/validaciones.js'

describe('validarLogin', () => {
  it('exige correo y contraseña', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({
      email: 'El correo es obligatorio.',
      password: 'La contraseña es obligatoria.'
    })
  })

  it('rechaza un correo con formato inválido', () => {
    expect(validarLogin({ email: 'abc', password: 'x' }).email).toBe('Ingrese un correo válido.')
  })

  it('acepta datos válidos', () => {
    expect(validarLogin({ email: 'a@b.com', password: '123456' })).toEqual({})
  })
})
