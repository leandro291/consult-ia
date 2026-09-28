import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar, leer } from '@/services/storage.js'
import { actualizarMedico, crearMedico, listarMedicos } from '@/services/medicosService.js'

const CONSULTORIO = { id: 'consultorio-1', nombre: 'Consultorio 1' }

function datosMedico(extra = {}) {
  return {
    nombres: 'Ana',
    apellidos: 'Torres',
    especialidad: 'Pediatría',
    colegiatura: 'CMP-12345',
    telefono: '999888777',
    consultorioId: CONSULTORIO.id,
    horario: { dias: [1, 2, 3, 4, 5], inicio: '08:00', fin: '14:00' },
    email: 'ana.torres@clinica.com',
    password: '123456',
    ...extra
  }
}

describe('medicosService', () => {
  beforeEach(() => {
    localStorage.clear()
    guardar(CLAVES.consultorios, [CONSULTORIO])
  })

  describe('listarMedicos', () => {
    it('devuelve un arreglo vacío si no hay médicos guardados', () => {
      expect(listarMedicos()).toEqual([])
    })

    it('devuelve los médicos guardados', () => {
      const medico = crearMedico(datosMedico())
      expect(listarMedicos()).toEqual([medico])
    })
  })

  describe('crearMedico', () => {
    it('crea el médico con id, creadoEn y los datos ingresados', () => {
      const medico = crearMedico(datosMedico())
      expect(medico.id).toEqual(expect.any(String))
      expect(medico.creadoEn).toBe(new Date(medico.creadoEn).toISOString())
      expect(medico).toMatchObject({
        nombres: 'Ana',
        apellidos: 'Torres',
        especialidad: 'Pediatría',
        colegiatura: 'CMP-12345',
        consultorioId: CONSULTORIO.id
      })
    })

    it('crea también el usuario de acceso vinculado al médico', () => {
      const medico = crearMedico(datosMedico())
      const usuarios = leer(CLAVES.usuarios)
      expect(usuarios).toHaveLength(1)
      expect(usuarios[0]).toMatchObject({
        email: 'ana.torres@clinica.com',
        password: '123456',
        nombre: 'Ana Torres',
        rol: 'medico',
        medicoId: medico.id
      })
    })

    it('quita los espacios al borde de nombres, apellidos, especialidad, colegiatura y teléfono', () => {
      const medico = crearMedico(datosMedico({
        nombres: '  Ana  ',
        apellidos: '  Torres  ',
        especialidad: '  Pediatría  ',
        colegiatura: '  CMP-12345  ',
        telefono: '  999888777  '
      }))
      expect(medico).toMatchObject({
        nombres: 'Ana',
        apellidos: 'Torres',
        especialidad: 'Pediatría',
        colegiatura: 'CMP-12345',
        telefono: '999888777'
      })
    })

    it('ordena y quita duplicados de los días del horario', () => {
      const medico = crearMedico(datosMedico({ horario: { dias: [3, 1, 3, 2], inicio: '08:00', fin: '14:00' } }))
      expect(medico.horario.dias).toEqual([1, 2, 3])
    })

    it('rechaza nombres vacíos', () => {
      expect(() => crearMedico(datosMedico({ nombres: '' }))).toThrow('Los nombres son obligatorios.')
    })

    it('rechaza un horario sin días seleccionados', () => {
      expect(() => crearMedico(datosMedico({ horario: { dias: [], inicio: '08:00', fin: '14:00' } }))).toThrow(
        'Seleccione al menos un día.'
      )
    })

    it('rechaza una hora de fin anterior o igual a la de inicio (límite)', () => {
      expect(() => crearMedico(datosMedico({ horario: { dias: [1], inicio: '08:00', fin: '08:00' } }))).toThrow(
        'La hora de fin debe ser posterior a la de inicio.'
      )
    })

    it('rechaza un correo con formato inválido', () => {
      expect(() => crearMedico(datosMedico({ email: 'no-es-un-correo' }))).toThrow('Ingrese un correo válido.')
    })

    it('rechaza una contraseña más corta que el mínimo', () => {
      expect(() => crearMedico(datosMedico({ password: '123' }))).toThrow(
        'La contraseña debe tener al menos 6 caracteres.'
      )
    })

    it('rechaza un consultorio que no existe', () => {
      expect(() => crearMedico(datosMedico({ consultorioId: 'no-existe' }))).toThrow(
        'El consultorio seleccionado no existe.'
      )
    })

    it('rechaza un correo ya registrado, sin importar mayúsculas', () => {
      crearMedico(datosMedico({ email: 'ana.torres@clinica.com' }))
      expect(() => crearMedico(datosMedico({ email: 'ANA.TORRES@CLINICA.COM' }))).toThrow(
        'El correo ya está registrado.'
      )
    })

    it('no guarda ni el médico ni el usuario si la validación falla', () => {
      expect(() => crearMedico(datosMedico({ nombres: '' }))).toThrow()
      expect(listarMedicos()).toEqual([])
      expect(leer(CLAVES.usuarios)).toEqual([])
    })
  })

  describe('actualizarMedico', () => {
    it('modifica los campos de un médico existente', () => {
      const medico = crearMedico(datosMedico())
      const actualizado = actualizarMedico(medico.id, datosMedico({ especialidad: 'Cardiología' }))
      expect(actualizado).toMatchObject({ id: medico.id, especialidad: 'Cardiología' })
      expect(listarMedicos()).toEqual([actualizado])
    })

    it('conserva el id y el creadoEn originales al actualizar', () => {
      const medico = crearMedico(datosMedico())
      const actualizado = actualizarMedico(medico.id, datosMedico({ especialidad: 'Cardiología' }))
      expect(actualizado.id).toBe(medico.id)
      expect(actualizado.creadoEn).toBe(medico.creadoEn)
    })

    it('no exige correo ni contraseña al actualizar (no es alta)', () => {
      const medico = crearMedico(datosMedico())
      const datos = datosMedico()
      delete datos.email
      delete datos.password
      expect(() => actualizarMedico(medico.id, datos)).not.toThrow()
    })

    it('lanza error si el médico no existe', () => {
      expect(() => actualizarMedico('no-existe', datosMedico())).toThrow('El médico no existe.')
    })

    it('rechaza datos inválidos al actualizar', () => {
      const medico = crearMedico(datosMedico())
      expect(() => actualizarMedico(medico.id, datosMedico({ colegiatura: '' }))).toThrow(
        'La colegiatura es obligatoria.'
      )
    })

    it('rechaza un consultorio que no existe al actualizar', () => {
      const medico = crearMedico(datosMedico())
      expect(() => actualizarMedico(medico.id, datosMedico({ consultorioId: 'no-existe' }))).toThrow(
        'El consultorio seleccionado no existe.'
      )
    })

    it('no cambia el médico ni crea usuarios si la validación falla', () => {
      const medico = crearMedico(datosMedico())
      expect(() => actualizarMedico(medico.id, datosMedico({ colegiatura: '' }))).toThrow()
      expect(listarMedicos()).toEqual([medico])
      expect(leer(CLAVES.usuarios)).toHaveLength(1)
    })
  })
})
