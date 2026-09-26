const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LARGO_MIN_PASSWORD = 6

const vacio = (valor) => !(valor ?? '').toString().trim()

function errorCorreo(email) {
  const correo = (email ?? '').trim()
  if (!correo) return 'El correo es obligatorio.'
  if (!FORMATO_EMAIL.test(correo)) return 'Ingrese un correo válido.'
  return null
}

// Primer mensaje de un objeto de errores (el de los servicios), o null si no hay.
export function primerError(errores) {
  return Object.values(errores)[0] ?? null
}

// Devuelve un mensaje por campo inválido, o {} si todo es válido.
export function validarLogin({ email, password }) {
  const errores = {}
  const errEmail = errorCorreo(email)
  if (errEmail) errores.email = errEmail
  if (!password) errores.password = 'La contraseña es obligatoria.'
  return errores
}

export function validarConsultorio({ nombre }) {
  const errores = {}
  if (vacio(nombre)) errores.nombre = 'El nombre es obligatorio.'
  return errores
}

// En el alta (`alta: true`) también se validan el correo y la contraseña del usuario de acceso.
export function validarMedico(datos, { alta = false } = {}) {
  const errores = {}
  if (vacio(datos.nombres)) errores.nombres = 'Los nombres son obligatorios.'
  if (vacio(datos.apellidos)) errores.apellidos = 'Los apellidos son obligatorios.'
  if (vacio(datos.especialidad)) errores.especialidad = 'La especialidad es obligatoria.'
  if (vacio(datos.colegiatura)) errores.colegiatura = 'La colegiatura es obligatoria.'
  if (vacio(datos.consultorioId)) errores.consultorioId = 'Seleccione un consultorio.'

  const { dias, inicio, fin } = datos.horario ?? {}
  if (!dias?.length) errores.dias = 'Seleccione al menos un día.'
  if (!inicio) errores.inicio = 'La hora de inicio es obligatoria.'
  if (!fin) errores.fin = 'La hora de fin es obligatoria.'
  // Las horas "HH:mm" se comparan bien como texto.
  else if (inicio && fin <= inicio) errores.fin = 'La hora de fin debe ser posterior a la de inicio.'

  if (alta) {
    const errEmail = errorCorreo(datos.email)
    if (errEmail) errores.email = errEmail
    if (!datos.password) errores.password = 'La contraseña es obligatoria.'
    else if (datos.password.length < LARGO_MIN_PASSWORD) {
      errores.password = `La contraseña debe tener al menos ${LARGO_MIN_PASSWORD} caracteres.`
    }
  }
  return errores
}
