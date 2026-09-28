import { describe, expect, it } from 'vitest'
import { membreteClinica, lineaDivisoria, piePagina, CLINICA } from '@/pdf/comunes.js'

describe('membreteClinica', () => {
  it('arma el bloque con nombre, dirección y teléfono de la clínica', () => {
    expect(membreteClinica()).toEqual({
      stack: [
        { text: CLINICA.nombre, style: 'clinica' },
        { text: `${CLINICA.direccion} · Tel. ${CLINICA.telefono}`, style: 'direccion' }
      ]
    })
  })
})

describe('lineaDivisoria', () => {
  it('arma una línea horizontal de separación', () => {
    expect(lineaDivisoria()).toEqual({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#C5CCDC' }]
    })
  })
})

describe('piePagina', () => {
  it('devuelve una función (la firma de footer que espera pdfmake)', () => {
    expect(typeof piePagina('abc-123', 'Receta')).toBe('function')
  })

  it('al invocarla con el número de página, arma el pie con el identificador y la numeración', () => {
    const pie = piePagina('abc-123', 'Receta')

    expect(pie(1, 3)).toEqual({
      columns: [
        { text: 'Receta abc-123', style: 'pie' },
        { text: 'Página 1 de 3', style: 'pie', alignment: 'right' }
      ],
      margin: [40, 0, 40, 20]
    })
  })

  it('refleja distinta página y total en cada invocación', () => {
    const pie = piePagina('xyz-789', 'Historia clínica')

    expect(pie(2, 5)).toEqual({
      columns: [
        { text: 'Historia clínica xyz-789', style: 'pie' },
        { text: 'Página 2 de 5', style: 'pie', alignment: 'right' }
      ],
      margin: [40, 0, 40, 20]
    })
  })
})
