import { describe, expect, it } from 'vitest'
import { buscarConflictos } from '@/utils/alergias.js'

function item(medicamento) {
  return { medicamento }
}

describe('buscarConflictos', () => {
  it('detecta coincidencia directa entre el medicamento y una alergia registrada', () => {
    const conflictos = buscarConflictos([item('Paracetamol')], ['paracetamol'])

    expect(conflictos).toEqual([{ indice: 0, medicamento: 'Paracetamol', alergia: 'paracetamol' }])
  })

  it('detecta coincidencia por familia (amoxicilina cuando la alergia es a la penicilina)', () => {
    const conflictos = buscarConflictos([item('Amoxicilina 500mg')], ['penicilina'])

    expect(conflictos).toEqual([{ indice: 0, medicamento: 'Amoxicilina 500mg', alergia: 'penicilina' }])
  })

  it('detecta cada medicamento de la familia de AINEs', () => {
    const items = [item('Ibuprofeno'), item('Naproxeno'), item('Diclofenaco')]

    const conflictos = buscarConflictos(items, ['AINEs'])

    expect(conflictos.map((c) => c.indice)).toEqual([0, 1, 2])
  })

  it('detecta coincidencia por familia (sulfametoxazol cuando la alergia es a las sulfas)', () => {
    const conflictos = buscarConflictos([item('Sulfametoxazol')], ['sulfas'])

    expect(conflictos).toEqual([{ indice: 0, medicamento: 'Sulfametoxazol', alergia: 'sulfas' }])
  })

  it('no reporta conflictos cuando el paciente no tiene alergias registradas', () => {
    expect(buscarConflictos([item('Amoxicilina')], [])).toEqual([])
  })

  it('no reporta conflictos cuando la lista de alergias es undefined', () => {
    expect(buscarConflictos([item('Amoxicilina')], undefined)).toEqual([])
  })

  it('devuelve un arreglo vacío cuando no hay medicamentos', () => {
    expect(buscarConflictos([], ['penicilina'])).toEqual([])
  })

  it('no reporta conflicto cuando el medicamento no coincide con ninguna alergia', () => {
    expect(buscarConflictos([item('Paracetamol')], ['penicilina', 'sulfas'])).toEqual([])
  })

  it('ignora mayúsculas y tildes al comparar medicamento y alergia', () => {
    const conflictos = buscarConflictos([item('AMOXICILINA')], ['Penicilína'])

    expect(conflictos).toEqual([{ indice: 0, medicamento: 'AMOXICILINA', alergia: 'Penicilína' }])
  })

  it('conserva el índice original del medicamento dentro de la lista', () => {
    const items = [item('Paracetamol'), item('Amoxicilina'), item('Ibuprofeno')]

    const conflictos = buscarConflictos(items, ['penicilina'])

    expect(conflictos).toEqual([{ indice: 1, medicamento: 'Amoxicilina', alergia: 'penicilina' }])
  })

  it('ignora los medicamentos sin nombre', () => {
    expect(buscarConflictos([item('')], ['penicilina'])).toEqual([])
  })
})
