import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar } from '@/services/storage.js'
import { guardarReceta, listarRecetas } from '@/services/recetasService.js'

// La receta solo necesita que exista la consulta a la que pertenece (no la cadena completa
// cita → paciente → médico), igual que hace consultasService.test.js con MEDICO/PACIENTE.
const CONSULTA = { id: 'consulta-1', pacienteId: 'paciente-1', medicoId: 'medico-1', fecha: '2024-01-15' }

function datosReceta(extra = {}) {
  return {
    consultaId: CONSULTA.id,
    items: [{ medicamento: 'Amoxicilina', dosis: '500mg', frecuencia: 'Cada 8 horas', duracion: '7 días', via: 'oral', indicaciones: '' }],
    indicacionesGenerales: 'Reposo relativo',
    ...extra
  }
}

describe('recetasService', () => {
  beforeEach(() => {
    localStorage.clear()
    guardar(CLAVES.consultas, [CONSULTA])
  })

  describe('listarRecetas', () => {
    it('devuelve un arreglo vacío si no hay recetas guardadas', () => {
      expect(listarRecetas()).toEqual([])
    })

    it('devuelve las recetas guardadas', () => {
      const receta = guardarReceta(datosReceta())
      expect(listarRecetas()).toEqual([receta])
    })
  })

  describe('guardarReceta', () => {
    it('crea la receta con los datos de la consulta y un id y creadoEn generados', () => {
      const receta = guardarReceta(datosReceta())
      expect(receta).toMatchObject({
        consultaId: CONSULTA.id,
        pacienteId: CONSULTA.pacienteId,
        medicoId: CONSULTA.medicoId,
        fecha: CONSULTA.fecha,
        indicacionesGenerales: 'Reposo relativo'
      })
      expect(receta.id).toEqual(expect.any(String))
      expect(receta.creadoEn).toBe(new Date(receta.creadoEn).toISOString())
    })

    it('recorta los espacios de los campos de texto de cada medicamento', () => {
      const receta = guardarReceta(
        datosReceta({ items: [{ medicamento: '  Amoxicilina  ', dosis: ' 500mg ', frecuencia: ' Cada 8 horas ', duracion: ' 7 días ', via: 'oral', indicaciones: ' ' }] })
      )
      expect(receta.items[0]).toMatchObject({ medicamento: 'Amoxicilina', dosis: '500mg', frecuencia: 'Cada 8 horas', duracion: '7 días', indicaciones: '' })
    })

    it('rechaza guardar una receta para una consulta que no existe', () => {
      expect(() => guardarReceta(datosReceta({ consultaId: 'no-existe' }))).toThrow('La consulta no existe.')
      expect(listarRecetas()).toEqual([])
    })

    it('rechaza una receta sin medicamentos', () => {
      expect(() => guardarReceta(datosReceta({ items: [] }))).toThrow('Agregue al menos un medicamento.')
      expect(listarRecetas()).toEqual([])
    })

    it('rechaza un medicamento sin dosis', () => {
      expect(() =>
        guardarReceta(datosReceta({ items: [{ medicamento: 'Amoxicilina', dosis: '', frecuencia: 'Cada 8 horas', duracion: '7 días', via: 'oral' }] }))
      ).toThrow('La dosis es obligatoria.')
      expect(listarRecetas()).toEqual([])
    })

    it('actualiza la receta existente en vez de crear una segunda para la misma consulta', () => {
      const primera = guardarReceta(datosReceta())
      const actualizada = guardarReceta(datosReceta({ items: [{ ...datosReceta().items[0], dosis: '1g' }] }))

      expect(actualizada.id).toBe(primera.id)
      expect(actualizada.creadoEn).toBe(primera.creadoEn)
      expect(actualizada.items[0].dosis).toBe('1g')
      expect(listarRecetas()).toHaveLength(1)
    })
  })
})
