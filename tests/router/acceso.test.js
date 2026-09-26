import { describe, expect, it } from 'vitest'
import { resolverAcceso } from '@/router/acceso.js'
import { INICIO_POR_ROL } from '@/utils/roles.js'

const privado = { meta: {} }
const login = { meta: { publica: true } }

describe('resolverAcceso', () => {
  it('manda a /login si no hay sesión válida en una ruta privada', () => {
    expect(resolverAcceso(privado, null)).toBe('/login')
    expect(resolverAcceso(privado, { rol: 'otro' })).toBe('/login')
  })

  it('deja ver /login sin sesión', () => {
    expect(resolverAcceso(login, null)).toBe(true)
  })

  it('manda al inicio del rol si ya hay sesión en /login', () => {
    expect(resolverAcceso(login, { rol: 'medico' })).toBe(INICIO_POR_ROL.medico)
  })

  it('redirige si el rol no corresponde a la ruta', () => {
    expect(resolverAcceso({ meta: { rol: 'medico' } }, { rol: 'recepcion' })).toBe(INICIO_POR_ROL.recepcion)
  })

  it('permite el acceso con el rol correcto', () => {
    expect(resolverAcceso({ meta: { rol: 'medico' } }, { rol: 'medico' })).toBe(true)
  })
})
