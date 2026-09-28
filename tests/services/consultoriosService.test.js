import { beforeEach, describe, expect, it } from 'vitest'
import { actualizarConsultorio, crearConsultorio, listarConsultorios } from '@/services/consultoriosService.js'

function datosConsultorio(extra = {}) {
  return { nombre: 'Consultorio 1', piso: '2', descripcion: 'Piso 2, ala norte', ...extra }
}

describe('consultoriosService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('listarConsultorios', () => {
    it('devuelve un arreglo vacío si no hay consultorios guardados', () => {
      expect(listarConsultorios()).toEqual([])
    })

    it('devuelve los consultorios guardados', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      expect(listarConsultorios()).toEqual([consultorio])
    })
  })

  describe('crearConsultorio', () => {
    it('crea el consultorio con id y creadoEn', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      expect(consultorio.id).toEqual(expect.any(String))
      expect(consultorio.creadoEn).toBe(new Date(consultorio.creadoEn).toISOString())
      expect(consultorio).toMatchObject({ nombre: 'Consultorio 1', piso: '2', descripcion: 'Piso 2, ala norte' })
    })

    it('quita los espacios al borde del nombre, piso y descripción', () => {
      const consultorio = crearConsultorio(datosConsultorio({ nombre: '  Consultorio 1  ', piso: ' 2 ', descripcion: '  nota  ' }))
      expect(consultorio).toMatchObject({ nombre: 'Consultorio 1', piso: '2', descripcion: 'nota' })
    })

    it('rechaza un nombre vacío', () => {
      expect(() => crearConsultorio(datosConsultorio({ nombre: '' }))).toThrow('El nombre es obligatorio.')
    })

    it('rechaza un nombre con solo espacios', () => {
      expect(() => crearConsultorio(datosConsultorio({ nombre: '   ' }))).toThrow('El nombre es obligatorio.')
    })

    it('no guarda nada si la validación falla', () => {
      expect(() => crearConsultorio(datosConsultorio({ nombre: '' }))).toThrow()
      expect(listarConsultorios()).toEqual([])
    })
  })

  describe('actualizarConsultorio', () => {
    it('modifica los campos de un consultorio existente', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      const actualizado = actualizarConsultorio(consultorio.id, datosConsultorio({ nombre: 'Consultorio 2', piso: '3' }))
      expect(actualizado).toMatchObject({ id: consultorio.id, nombre: 'Consultorio 2', piso: '3' })
      expect(listarConsultorios()).toEqual([actualizado])
    })

    it('conserva el id y el creadoEn originales al actualizar', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      const actualizado = actualizarConsultorio(consultorio.id, datosConsultorio({ nombre: 'Consultorio 2' }))
      expect(actualizado.id).toBe(consultorio.id)
      expect(actualizado.creadoEn).toBe(consultorio.creadoEn)
    })

    it('lanza error si el consultorio no existe', () => {
      expect(() => actualizarConsultorio('no-existe', datosConsultorio())).toThrow('El consultorio no existe.')
    })

    it('rechaza un nombre vacío al actualizar', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      expect(() => actualizarConsultorio(consultorio.id, datosConsultorio({ nombre: '' }))).toThrow('El nombre es obligatorio.')
    })

    it('no cambia el consultorio si la validación falla', () => {
      const consultorio = crearConsultorio(datosConsultorio())
      expect(() => actualizarConsultorio(consultorio.id, datosConsultorio({ nombre: '' }))).toThrow()
      expect(listarConsultorios()).toEqual([consultorio])
    })
  })
})
