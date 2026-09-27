// Membrete, estilos y pie compartidos por los documentos de pdfmake (receta e historia clínica).

export const CLINICA = {
  nombre: 'Clínica Demo',
  direccion: '[Dirección de demo]',
  telefono: '[000 000 000]'
}

export const ESTILOS_PDF = {
  clinica: { fontSize: 14, bold: true },
  direccion: { fontSize: 8, color: '#4A5068' },
  etiqueta: { fontSize: 8, bold: true, color: '#4A5068' },
  titulo: { fontSize: 16, bold: true, margin: [0, 4, 0, 8] },
  tablaCabecera: { fontSize: 9, bold: true, fillColor: '#F4F6FA' },
  pie: { fontSize: 8, color: '#4A5068' }
}

// Encabezado con el nombre, la dirección y el teléfono de la clínica (RF8). Va al inicio de cada PDF.
export function membreteClinica() {
  return {
    stack: [
      { text: CLINICA.nombre, style: 'clinica' },
      { text: `${CLINICA.direccion} · Tel. ${CLINICA.telefono}`, style: 'direccion' }
    ]
  }
}

// Línea horizontal simple, para separar secciones sin depender de bordes de tabla.
export function lineaDivisoria() {
  return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#C5CCDC' }] }
}

// Pie de página con un identificador del documento (id de receta o de historia) y la numeración.
export function piePagina(identificador, etiqueta) {
  return (paginaActual, totalPaginas) => ({
    columns: [
      { text: `${etiqueta} ${identificador}`, style: 'pie' },
      { text: `Página ${paginaActual} de ${totalPaginas}`, style: 'pie', alignment: 'right' }
    ],
    margin: [40, 0, 40, 20]
  })
}
