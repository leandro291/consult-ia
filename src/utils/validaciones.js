import dayjs from 'dayjs'

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

// La unicidad del DNI la valida el servicio, no esta función.
export function validarPaciente(datos) {
  const errores = {}
  if (!/^\d{8}$/.test((datos.dni ?? '').trim())) errores.dni = 'El DNI debe tener 8 dígitos.'
  if (vacio(datos.nombres)) errores.nombres = 'Los nombres son obligatorios.'
  if (vacio(datos.apellidos)) errores.apellidos = 'Los apellidos son obligatorios.'
  if (vacio(datos.fechaNacimiento)) errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.'
  // Las fechas ISO "YYYY-MM-DD" se comparan bien como texto.
  else if (datos.fechaNacimiento > dayjs().format('YYYY-MM-DD')) {
    errores.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.'
  }
  if (vacio(datos.sexo)) errores.sexo = 'Seleccione el sexo.'
  if (!vacio(datos.email) && !FORMATO_EMAIL.test(datos.email.trim())) errores.email = 'Ingrese un correo válido.'
  return errores
}

// Campos obligatorios de una cita y que su inicio no sea anterior al momento actual. El motivo es opcional.
export function validarCita(datos) {
  const errores = {}
  if (vacio(datos.pacienteId)) errores.pacienteId = 'Seleccione un paciente.'
  if (vacio(datos.medicoId)) errores.medicoId = 'Seleccione un médico.'
  if (vacio(datos.fecha)) errores.fecha = 'La fecha es obligatoria.'
  if (vacio(datos.hora)) errores.hora = 'La hora es obligatoria.'
  if (!errores.fecha && !errores.hora && dayjs(`${datos.fecha}T${datos.hora}`).isBefore(dayjs())) {
    errores.fecha = 'La cita no puede empezar en el pasado.'
  }
  return errores
}

const FORMATO_PRESION = /^\d{1,3}\/\d{1,3}$/

// Un signo vital numérico es válido si viene vacío (null/undefined/'') o es un número mayor que 0.
function errorSignoNumerico(valor, etiqueta) {
  if (valor === null || valor === undefined || valor === '') return null
  return Number(valor) > 0 ? null : `${etiqueta} debe ser un número mayor que 0.`
}

// Motivo obligatorio, al menos un diagnóstico con descripción; los signos vitales son opcionales,
// pero si vienen deben tener un formato o valor válido.
export function validarConsulta(datos) {
  const errores = {}
  if (vacio(datos.motivo)) errores.motivo = 'El motivo es obligatorio.'
  if (!datos.diagnosticos?.some((d) => !vacio(d.descripcion))) {
    errores.diagnosticos = 'Ingrese al menos un diagnóstico.'
  }

  const { presion, frecuenciaCardiaca, temperatura, peso, talla } = datos.signosVitales ?? {}
  if (!vacio(presion) && !FORMATO_PRESION.test(presion.trim())) {
    errores.presion = 'La presión debe tener el formato sistólica/diastólica (ej. 120/80).'
  }
  const errFrecuencia = errorSignoNumerico(frecuenciaCardiaca, 'La frecuencia cardiaca')
  if (errFrecuencia) errores.frecuenciaCardiaca = errFrecuencia
  const errTemperatura = errorSignoNumerico(temperatura, 'La temperatura')
  if (errTemperatura) errores.temperatura = errTemperatura
  const errPeso = errorSignoNumerico(peso, 'El peso')
  if (errPeso) errores.peso = errPeso
  const errTalla = errorSignoNumerico(talla, 'La talla')
  if (errTalla) errores.talla = errTalla

  return errores
}

// "HH:mm" -> minutos desde las 00:00.
function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Dos citas se solapan si son de la misma fecha y sus intervalos [hora, hora + duracionMin) se cruzan.
export function citasSeSolapan(a, b) {
  if (a.fecha !== b.fecha) return false
  const inicioA = aMinutos(a.hora)
  const inicioB = aMinutos(b.hora)
  return inicioA < inicioB + b.duracionMin && inicioB < inicioA + a.duracionMin
}

// La cita cae en un día de atención del médico y cabe entre `inicio` y `fin` de su horario.
export function citaDentroDelHorario({ fecha, hora, duracionMin }, horario) {
  if (!horario.dias.includes(dayjs(fecha).day())) return false
  const inicio = aMinutos(hora)
  return inicio >= aMinutos(horario.inicio) && inicio + duracionMin <= aMinutos(horario.fin)
}
