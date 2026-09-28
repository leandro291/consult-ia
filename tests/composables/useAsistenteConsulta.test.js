import { describe, expect, it } from 'vitest'
import { limpiarBorradorReceta, limpiarSugerencia } from '@/composables/useAsistenteConsulta.js'

describe('limpiarSugerencia', () => {
  it('arma la sugerencia con motivo, examen físico, plan, diagnósticos y signos vitales como texto', () => {
    const json = {
      motivo: 'Fiebre y dolor de garganta',
      examenFisico: 'Amígdalas inflamadas',
      plan: 'Reposo e hidratación',
      diagnosticos: [{ codigo: 'J02', descripcion: 'Faringitis aguda' }],
      signosVitales: { presion: '120/80', frecuenciaCardiaca: 92, temperatura: 38.5, peso: 70, talla: 170 }
    }

    expect(limpiarSugerencia(json)).toEqual({
      motivo: 'Fiebre y dolor de garganta',
      examenFisico: 'Amígdalas inflamadas',
      plan: 'Reposo e hidratación',
      diagnosticos: [{ codigo: 'J02', descripcion: 'Faringitis aguda' }],
      signosVitales: { presion: '120/80', frecuenciaCardiaca: '92', temperatura: '38.5', peso: '70', talla: '170' }
    })
  })

  it('devuelve un objeto vacío cuando el JSON no trae ningún dato', () => {
    expect(limpiarSugerencia({})).toEqual({})
  })

  it('no incluye motivo, examenFisico ni plan cuando vienen null', () => {
    const sugerencia = limpiarSugerencia({ motivo: null, examenFisico: null, plan: null })

    expect(sugerencia).toEqual({})
  })

  it('no incluye diagnosticos cuando el arreglo viene vacío', () => {
    expect(limpiarSugerencia({ diagnosticos: [] })).toEqual({})
  })

  it('conserva el código null de un diagnóstico sin código verificado', () => {
    const sugerencia = limpiarSugerencia({ diagnosticos: [{ codigo: null, descripcion: 'Resfrío común' }] })

    expect(sugerencia.diagnosticos).toEqual([{ codigo: null, descripcion: 'Resfrío común' }])
  })

  it('no incluye signosVitales cuando todos sus valores son null', () => {
    const sugerencia = limpiarSugerencia({
      signosVitales: { presion: null, frecuenciaCardiaca: null, temperatura: null, peso: null, talla: null }
    })

    expect(sugerencia).toEqual({})
  })

  it('no incluye signosVitales cuando el JSON no trae esa clave', () => {
    expect(limpiarSugerencia({ motivo: 'Control' })).toEqual({ motivo: 'Control' })
  })

  it('incluye solo los signos vitales presentes, sin arrastrar los ausentes', () => {
    const sugerencia = limpiarSugerencia({ signosVitales: { temperatura: 37.2 } })

    expect(sugerencia.signosVitales).toEqual({ temperatura: '37.2' })
  })

  it('incluye un signo vital en cero, porque cero es un valor válido', () => {
    const sugerencia = limpiarSugerencia({ signosVitales: { frecuenciaCardiaca: 0 } })

    expect(sugerencia.signosVitales).toEqual({ frecuenciaCardiaca: '0' })
  })
})

describe('limpiarBorradorReceta', () => {
  it('arma el borrador con los medicamentos y sus campos, completando los ausentes con texto vacío', () => {
    const borrador = limpiarBorradorReceta({
      receta: [{ medicamento: 'Amoxicilina 500mg', dosis: null, frecuencia: null, duracion: null, via: null, indicaciones: null }],
      indicacionesPaciente: null
    })

    expect(borrador).toEqual({
      items: [{ medicamento: 'Amoxicilina 500mg', dosis: '', frecuencia: '', duracion: '', via: '', indicaciones: '' }],
      indicacionesGenerales: ''
    })
  })

  it('conserva la vía cuando es una de las vías válidas de receta', () => {
    const borrador = limpiarBorradorReceta({
      receta: [{ medicamento: 'Paracetamol', via: 'oral' }]
    })

    expect(borrador.items[0].via).toBe('oral')
  })

  it('descarta la vía sugerida cuando no es una vía válida de receta', () => {
    const borrador = limpiarBorradorReceta({
      receta: [{ medicamento: 'Paracetamol', via: 'nasal' }]
    })

    expect(borrador.items[0].via).toBe('')
  })

  it('devuelve null cuando no hay medicamentos ni indicaciones para el paciente', () => {
    expect(limpiarBorradorReceta({ receta: [], indicacionesPaciente: null })).toBeNull()
  })

  it('devuelve null cuando el JSON no trae la clave receta', () => {
    expect(limpiarBorradorReceta({})).toBeNull()
  })

  it('arma un borrador solo con indicaciones generales cuando no hay medicamentos', () => {
    const borrador = limpiarBorradorReceta({ receta: [], indicacionesPaciente: 'Tomar abundante líquido' })

    expect(borrador).toEqual({ items: [], indicacionesGenerales: 'Tomar abundante líquido' })
  })
})
