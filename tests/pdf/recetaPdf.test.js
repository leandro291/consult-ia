import { describe, expect, it } from 'vitest'
import { documentoReceta, nombreArchivoReceta } from '@/pdf/recetaPdf.js'
import { membreteClinica } from '@/pdf/comunes.js'
import { calcularEdad, formatearFecha, nombreCompleto } from '@/utils/formato.js'

const paciente = {
  nombres: 'María',
  apellidos: 'Gómez Pérez',
  dni: '12345678',
  fechaNacimiento: '1990-05-10'
}

const medico = {
  nombres: 'Carlos',
  apellidos: 'Ruiz',
  especialidad: 'Medicina General',
  colegiatura: 'CMP 12345'
}

const receta = {
  id: 'abc-123',
  fecha: '2026-09-28',
  indicacionesGenerales: 'Reposo y abundantes líquidos.',
  items: [
    { medicamento: 'Amoxicilina', dosis: '500mg', frecuencia: 'cada 8h', duracion: '7 días', via: 'oral', indicaciones: 'Con alimentos' },
    { medicamento: 'Paracetamol', dosis: '500mg', frecuencia: 'cada 8h', duracion: 'si hay fiebre', via: 'oral', indicaciones: null }
  ]
}

describe('nombreArchivoReceta', () => {
  it('arma el nombre con el primer apellido en minúsculas y la fecha', () => {
    expect(nombreArchivoReceta({ apellidos: 'Gómez Pérez' }, '2026-09-28')).toBe('receta_gomez_2026-09-28.pdf')
  })

  it('quita tildes del apellido', () => {
    expect(nombreArchivoReceta({ apellidos: 'Núñez' }, '2026-01-01')).toBe('receta_nunez_2026-01-01.pdf')
  })

  it('toma solo el primer apellido cuando hay varios', () => {
    expect(nombreArchivoReceta({ apellidos: 'De La Cruz Soto' }, '2026-01-01')).toBe('receta_de_2026-01-01.pdf')
  })

  it('ignora espacios al inicio y al final del apellido', () => {
    expect(nombreArchivoReceta({ apellidos: '  Ruiz  ' }, '2026-01-01')).toBe('receta_ruiz_2026-01-01.pdf')
  })

  it('pasa el apellido a minúsculas aunque venga en mayúsculas', () => {
    expect(nombreArchivoReceta({ apellidos: 'RUIZ' }, '2026-01-01')).toBe('receta_ruiz_2026-01-01.pdf')
  })
})

describe('documentoReceta', () => {
  const doc = documentoReceta({ receta, paciente, medico })

  it('incluye el membrete y los datos del médico en el encabezado', () => {
    const encabezado = doc.content[0]

    expect(encabezado.columns[0]).toEqual(membreteClinica())
    expect(encabezado.columns[1]).toEqual({
      width: 'auto',
      alignment: 'right',
      stack: [
        { text: nombreCompleto(medico), bold: true },
        { text: medico.especialidad, fontSize: 9 },
        { text: medico.colegiatura, fontSize: 9 }
      ]
    })
  })

  it('incluye nombre, DNI, edad y fecha del paciente', () => {
    const datosPaciente = doc.content[2]

    expect(datosPaciente.columns[0].text).toEqual([
      { text: 'Paciente\n', style: 'etiqueta' },
      { text: nombreCompleto(paciente), bold: true }
    ])
    expect(datosPaciente.columns[1].text[1].text).toBe(`${paciente.dni} · ${calcularEdad(paciente.fechaNacimiento)}`)
    expect(datosPaciente.columns[2].text[1].text).toBe(formatearFecha(receta.fecha))
  })

  it('arma la tabla de medicamentos con cabecera y una fila por ítem', () => {
    const tabla = doc.content[4].table

    expect(tabla.body[0]).toEqual([
      { text: 'Medicamento', style: 'tablaCabecera' },
      { text: 'Dosis', style: 'tablaCabecera' },
      { text: 'Frecuencia', style: 'tablaCabecera' },
      { text: 'Duración', style: 'tablaCabecera' },
      { text: 'Vía', style: 'tablaCabecera' }
    ])
    expect(tabla.body).toHaveLength(3) // cabecera + 2 medicamentos
  })

  it('agrega las indicaciones del medicamento debajo de su nombre cuando las trae', () => {
    const [, filaConIndicaciones] = documentoReceta({ receta, paciente, medico }).content[4].table.body

    expect(filaConIndicaciones[0]).toEqual({
      text: ['Amoxicilina\n', { text: 'Con alimentos', fontSize: 8, color: '#4A5068' }]
    })
  })

  it('deja el nombre del medicamento como texto plano cuando no trae indicaciones propias', () => {
    const [, , filaSinIndicaciones] = doc.content[4].table.body

    expect(filaSinIndicaciones[0]).toBe('Paracetamol')
  })

  it('muestra las indicaciones generales de la receta', () => {
    expect(doc.content[6]).toEqual({
      text: 'Reposo y abundantes líquidos.',
      margin: [0, 2, 0, 28]
    })
  })

  it('muestra un texto por defecto cuando no hay indicaciones generales', () => {
    const sinIndicaciones = documentoReceta({ receta: { ...receta, indicacionesGenerales: '' }, paciente, medico })

    expect(sinIndicaciones.content[6].text).toBe('Sin indicaciones adicionales.')
  })

  it('incluye el QR y el id de la receta junto a la línea de firma', () => {
    const cierre = doc.content[7]

    expect(cierre.columns[0].columns[0]).toEqual({ qr: receta.id, fit: 64 })
    expect(cierre.columns[0].columns[1].text).toBe(`Receta\n${receta.id}`)
    expect(cierre.columns[2].stack[1]).toEqual({ text: 'Firma y sello del médico', style: 'pie', alignment: 'center', margin: [0, 4, 0, 0] })
  })

  it('arma un pie de página con el id de la receta', () => {
    expect(doc.footer(1, 1)).toEqual({
      columns: [
        { text: `Receta ${receta.id}`, style: 'pie' },
        { text: 'Página 1 de 1', style: 'pie', alignment: 'right' }
      ],
      margin: [40, 0, 40, 20]
    })
  })
})
