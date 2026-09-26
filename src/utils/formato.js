import dayjs from 'dayjs'

// Formatea una fecha (Date, string ISO u objeto Day.js) como DD/MM/YYYY.
export function formatearFecha(fecha) {
  return dayjs(fecha).format('DD/MM/YYYY')
}
