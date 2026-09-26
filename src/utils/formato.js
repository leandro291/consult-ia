import dayjs from 'dayjs'

// Formatea una fecha (Date, string ISO u objeto Day.js) como DD/MM/YYYY.
export function formatearFecha(fecha) {
  return dayjs(fecha).format('DD/MM/YYYY')
}

export const DIAS_SEMANA = [
  { numero: 1, abreviatura: 'Lu', nombre: 'lunes' },
  { numero: 2, abreviatura: 'Ma', nombre: 'martes' },
  { numero: 3, abreviatura: 'Mi', nombre: 'miércoles' },
  { numero: 4, abreviatura: 'Ju', nombre: 'jueves' },
  { numero: 5, abreviatura: 'Vi', nombre: 'viernes' },
  { numero: 6, abreviatura: 'Sá', nombre: 'sábado' }
]

export function nombreCompleto({ nombres, apellidos }) {
  return `${nombres} ${apellidos}`
}

// [1, 3, 5, 6] -> "Lunes, miércoles, viernes y sábado"
export function listarDias(dias) {
  const nombres = DIAS_SEMANA.filter((d) => dias.includes(d.numero)).map((d) => d.nombre)
  const texto = nombres.length > 1
    ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
    : nombres[0] ?? ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
