import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Meses y días en español para todo formato de Day.js.
dayjs.locale('es')

// Formatea una fecha (Date, string ISO u objeto Day.js) como DD/MM/YYYY.
export function formatearFecha(fecha) {
  return dayjs(fecha).format('DD/MM/YYYY')
}

// Edad en años cumplidos a partir de la fecha de nacimiento (ISO).
export function calcularEdad(fechaNacimiento) {
  return dayjs().diff(dayjs(fechaNacimiento), 'year')
}

// Minúsculas y sin tildes, para comparar textos al buscar.
export function normalizarTexto(texto) {
  return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export const SEXOS = [
  { valor: 'F', etiqueta: 'Femenino' },
  { valor: 'M', etiqueta: 'Masculino' }
]

export const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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

// "Sábado": día de la semana con la primera letra en mayúscula.
export function nombreDia(fecha) {
  const dia = dayjs(fecha).format('dddd')
  return dia.charAt(0).toUpperCase() + dia.slice(1)
}

// "21 – 26 de septiembre de 2026"; con un solo día: "26 de septiembre de 2026".
export function formatearRango(inicio, fin) {
  const a = dayjs(inicio)
  const b = dayjs(fin)
  const completa = 'D [de] MMMM [de] YYYY'
  if (a.isSame(b, 'day')) return b.format(completa)
  if (a.isSame(b, 'month')) return `${a.format('D')} – ${b.format(completa)}`
  if (a.isSame(b, 'year')) return `${a.format('D [de] MMMM')} – ${b.format(completa)}`
  return `${a.format(completa)} – ${b.format(completa)}`
}
