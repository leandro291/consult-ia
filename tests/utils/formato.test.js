import { describe, expect, it } from 'vitest'
import { formatearFecha } from '@/utils/formato.js'

describe('formatearFecha', () => {
  it('formatea un string ISO como DD/MM/YYYY', () => {
    expect(formatearFecha('2026-09-26')).toBe('26/09/2026')
  })

  it('formatea un objeto Date como DD/MM/YYYY', () => {
    expect(formatearFecha(new Date(2026, 0, 5))).toBe('05/01/2026')
  })
})
