import pdfMake from 'pdfmake/build/pdfmake'
import vfsFonts from 'pdfmake/build/vfs_fonts'
import { calcularEdad, formatearFecha, nombreCompleto, normalizarTexto } from '@/utils/formato.js'
import { ESTILOS_PDF, lineaDivisoria, membreteClinica, piePagina } from '@/pdf/comunes.js'

pdfMake.addVirtualFileSystem(vfsFonts)

// Documento de la receta (RF8): membrete, médico, paciente, tabla de medicamentos, indicaciones
// generales, firma, pie con el id de la receta y QR (nodo nativo de pdfmake).
function documentoReceta({ receta, paciente, medico }) {
  return {
    content: [
      {
        columns: [
          membreteClinica(),
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: nombreCompleto(medico), bold: true },
              { text: medico.especialidad, fontSize: 9 },
              { text: medico.colegiatura, fontSize: 9 }
            ]
          }
        ],
        columnGap: 16,
        margin: [0, 0, 0, 12]
      },
      { ...lineaDivisoria(), margin: [0, 0, 0, 16] },
      {
        columns: [
          {
            width: '*',
            text: [{ text: 'Paciente\n', style: 'etiqueta' }, { text: nombreCompleto(paciente), bold: true }]
          },
          {
            width: 'auto',
            text: [
              { text: 'DNI · Edad\n', style: 'etiqueta' },
              { text: `${paciente.dni} · ${calcularEdad(paciente.fechaNacimiento)}` }
            ]
          },
          {
            width: 'auto',
            text: [{ text: 'Fecha\n', style: 'etiqueta' }, { text: formatearFecha(receta.fecha) }]
          }
        ],
        columnGap: 16,
        margin: [0, 0, 0, 16]
      },
      { text: 'Rp/', style: 'titulo' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 70, 80, 70, 60],
          body: [
            [
              { text: 'Medicamento', style: 'tablaCabecera' },
              { text: 'Dosis', style: 'tablaCabecera' },
              { text: 'Frecuencia', style: 'tablaCabecera' },
              { text: 'Duración', style: 'tablaCabecera' },
              { text: 'Vía', style: 'tablaCabecera' }
            ],
            ...receta.items.map((item) => [
              item.indicaciones
                ? { text: [`${item.medicamento}\n`, { text: item.indicaciones, fontSize: 8, color: '#4A5068' }] }
                : item.medicamento,
              item.dosis,
              item.frecuencia,
              item.duracion,
              item.via
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16]
      },
      { text: 'Indicaciones generales', style: 'etiqueta' },
      { text: receta.indicacionesGenerales || 'Sin indicaciones adicionales.', margin: [0, 2, 0, 28] },
      {
        columns: [
          {
            width: 'auto',
            columns: [
              { qr: receta.id, fit: 64 },
              { width: 'auto', text: `Receta\n${receta.id}`, style: 'pie', margin: [8, 0, 0, 0] }
            ]
          },
          { width: '*', text: '' },
          {
            width: 180,
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 1, lineColor: '#16192B' }] },
              { text: 'Firma y sello del médico', style: 'pie', alignment: 'center', margin: [0, 4, 0, 0] }
            ]
          }
        ]
      }
    ],
    styles: ESTILOS_PDF,
    footer: piePagina(receta.id, 'Receta'),
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 40, 40, 60]
  }
}

// receta_<primer apellido>_<YYYY-MM-DD>.pdf (RF7): apellido en minúsculas y sin tildes.
// Exportada porque la vista previa (spec 015) muestra el mismo nombre sin duplicar la lógica.
export function nombreArchivoReceta({ apellidos }, fecha) {
  const primerApellido = normalizarTexto(apellidos.trim().split(/\s+/)[0])
  return `receta_${primerApellido}_${fecha}.pdf`
}

export async function descargarRecetaPdf({ receta, paciente, medico }) {
  await pdfMake.createPdf(documentoReceta({ receta, paciente, medico })).download(nombreArchivoReceta(paciente, receta.fecha))
}

export async function imprimirRecetaPdf({ receta, paciente, medico }) {
  await pdfMake.createPdf(documentoReceta({ receta, paciente, medico })).open()
}
