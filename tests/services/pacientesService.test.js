import { beforeEach, describe, expect, it } from 'vitest'
import { CLAVES, guardar, leer } from '@/services/storage.js'
import {
  actualizarPaciente,
  crearPaciente,
  eliminarPaciente,
  listarPacientes,
  obtenerPaciente
} from '@/services/pacientesService.js'

function datosPaciente(extra = {}) {
  return {
    dni: '12345678',
    nombres: 'Ana',
    apellidos: 'Torres',
    fechaNacimiento: '1990-01-01',
    sexo: 'F',
    telefono: '999888777',
    email: 'ana.torres@correo.com',
    direccion: 'Av. Siempre Viva 123',
    grupoSanguineo: 'O+',
    alergias: [],
    antecedentes: '',
    ...extra
  }
}

function consulta(pacienteId, fecha) {
  return { id: crypto.randomUUID(), citaId: crypto.randomUUID(), pacienteId, medicoId: 'medico-1', fecha }
}

describe('pacientesService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('listarPacientes', () => {
    it('devuelve un arreglo vacío si no hay pacientes guardados', () => {
      expect(listarPacientes()).toEqual([])
    })

    it('ordena los pacientes por apellido y luego por nombres', () => {
      crearPaciente(datosPaciente({ dni: '11111111', nombres: 'Beto', apellidos: 'Zeta' }))
      crearPaciente(datosPaciente({ dni: '22222222', nombres: 'Beto', apellidos: 'Alfa' }))
      crearPaciente(datosPaciente({ dni: '33333333', nombres: 'Ana', apellidos: 'Alfa' }))
      expect(listarPacientes().map((p) => `${p.apellidos} ${p.nombres}`)).toEqual([
        'Alfa Ana',
        'Alfa Beto',
        'Zeta Beto'
      ])
    })

    it('agrega totalConsultas en 0 y ultimaConsulta en null cuando el paciente no tiene consultas', () => {
      const paciente = crearPaciente(datosPaciente())
      expect(listarPacientes()[0]).toMatchObject({ id: paciente.id, totalConsultas: 0, ultimaConsulta: null })
    })

    it('calcula totalConsultas y ultimaConsulta a partir de las consultas del paciente', () => {
      const paciente = crearPaciente(datosPaciente())
      guardar(CLAVES.consultas, [
        consulta(paciente.id, '2024-01-10'),
        consulta(paciente.id, '2024-03-05'),
        consulta('otro-paciente', '2024-06-01')
      ])
      expect(listarPacientes()[0]).toMatchObject({ totalConsultas: 2, ultimaConsulta: '2024-03-05' })
    })
  })

  describe('obtenerPaciente', () => {
    it('devuelve el paciente con totalConsultas y ultimaConsulta', () => {
      const paciente = crearPaciente(datosPaciente())
      expect(obtenerPaciente(paciente.id)).toMatchObject({ id: paciente.id, totalConsultas: 0 })
    })

    it('lanza error si el paciente no existe', () => {
      expect(() => obtenerPaciente('no-existe')).toThrow('El paciente no existe.')
    })
  })

  describe('crearPaciente', () => {
    it('crea el paciente con id, creadoEn y los datos ingresados', () => {
      const paciente = crearPaciente(datosPaciente())
      expect(paciente.id).toEqual(expect.any(String))
      expect(paciente.creadoEn).toBe(new Date(paciente.creadoEn).toISOString())
      expect(paciente).toMatchObject({ dni: '12345678', nombres: 'Ana', apellidos: 'Torres' })
    })

    it('quita los espacios al borde de los campos de texto', () => {
      const paciente = crearPaciente(datosPaciente({ nombres: '  Ana  ', apellidos: '  Torres  ' }))
      expect(paciente).toMatchObject({ nombres: 'Ana', apellidos: 'Torres' })
    })

    it('quita alergias vacías y duplicadas', () => {
      const paciente = crearPaciente(datosPaciente({ alergias: ['Penicilina', '  ', 'Penicilina', ''] }))
      expect(paciente.alergias).toEqual(['Penicilina'])
    })

    it('rechaza un DNI con menos de 8 dígitos (formato)', () => {
      expect(() => crearPaciente(datosPaciente({ dni: '1234567' }))).toThrow('El DNI debe tener 8 dígitos.')
    })

    it('rechaza un DNI con caracteres no numéricos', () => {
      expect(() => crearPaciente(datosPaciente({ dni: '1234567a' }))).toThrow('El DNI debe tener 8 dígitos.')
    })

    it('rechaza un DNI ya registrado por otro paciente', () => {
      crearPaciente(datosPaciente({ dni: '12345678' }))
      expect(() => crearPaciente(datosPaciente({ dni: '12345678', nombres: 'Otra' }))).toThrow(
        'Ya existe un paciente con este DNI (Ana Torres).'
      )
    })

    it('rechaza nombres vacíos', () => {
      expect(() => crearPaciente(datosPaciente({ nombres: '' }))).toThrow('Los nombres son obligatorios.')
    })

    it('rechaza una fecha de nacimiento futura', () => {
      expect(() => crearPaciente(datosPaciente({ fechaNacimiento: '2999-01-01' }))).toThrow(
        'La fecha de nacimiento no puede ser futura.'
      )
    })

    it('no guarda el paciente si la validación falla', () => {
      expect(() => crearPaciente(datosPaciente({ nombres: '' }))).toThrow()
      expect(listarPacientes()).toEqual([])
    })
  })

  describe('actualizarPaciente', () => {
    it('modifica los campos de un paciente existente', () => {
      const paciente = crearPaciente(datosPaciente())
      const actualizado = actualizarPaciente(paciente.id, datosPaciente({ direccion: 'Nueva dirección' }))
      expect(actualizado).toMatchObject({ id: paciente.id, direccion: 'Nueva dirección' })
    })

    it('conserva el id y el creadoEn originales al actualizar', () => {
      const paciente = crearPaciente(datosPaciente())
      const actualizado = actualizarPaciente(paciente.id, datosPaciente({ direccion: 'Nueva dirección' }))
      expect(actualizado.id).toBe(paciente.id)
      expect(actualizado.creadoEn).toBe(paciente.creadoEn)
    })

    it('permite conservar el mismo DNI del propio paciente', () => {
      const paciente = crearPaciente(datosPaciente({ dni: '12345678' }))
      expect(() => actualizarPaciente(paciente.id, datosPaciente({ dni: '12345678' }))).not.toThrow()
    })

    it('lanza error si el paciente no existe', () => {
      expect(() => actualizarPaciente('no-existe', datosPaciente())).toThrow('El paciente no existe.')
    })

    it('rechaza un DNI con formato inválido al actualizar', () => {
      const paciente = crearPaciente(datosPaciente())
      expect(() => actualizarPaciente(paciente.id, datosPaciente({ dni: '123' }))).toThrow(
        'El DNI debe tener 8 dígitos.'
      )
    })

    it('rechaza un DNI ya registrado por otro paciente al actualizar', () => {
      crearPaciente(datosPaciente({ dni: '11111111', nombres: 'Beto' }))
      const paciente = crearPaciente(datosPaciente({ dni: '22222222' }))
      expect(() => actualizarPaciente(paciente.id, datosPaciente({ dni: '11111111' }))).toThrow(
        'Ya existe un paciente con este DNI (Beto Torres).'
      )
    })

    it('no cambia el paciente si la validación falla', () => {
      const paciente = crearPaciente(datosPaciente())
      expect(() => actualizarPaciente(paciente.id, datosPaciente({ nombres: '' }))).toThrow()
      expect(obtenerPaciente(paciente.id)).toMatchObject({ nombres: 'Ana' })
    })
  })

  describe('eliminarPaciente', () => {
    it('elimina al paciente si no tiene consultas registradas', () => {
      const paciente = crearPaciente(datosPaciente())
      eliminarPaciente(paciente.id)
      expect(listarPacientes()).toEqual([])
    })

    it('no elimina al paciente si tiene consultas registradas y explica el motivo', () => {
      const paciente = crearPaciente(datosPaciente())
      guardar(CLAVES.consultas, [consulta(paciente.id, '2024-01-10')])
      expect(() => eliminarPaciente(paciente.id)).toThrow(
        'No se puede eliminar a Ana Torres: tiene 1 consultas registradas.'
      )
      expect(listarPacientes()).toHaveLength(1)
      expect(leer(CLAVES.pacientes)).toHaveLength(1)
    })

    it('lanza error si el paciente no existe', () => {
      expect(() => eliminarPaciente('no-existe')).toThrow('El paciente no existe.')
    })
  })
})
