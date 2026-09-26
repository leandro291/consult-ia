import { CLAVES, guardar, leer } from '@/services/storage.js'
import { primerError, validarMedico } from '@/utils/validaciones.js'
import { nombreCompleto } from '@/utils/formato.js'

// Deja solo los campos del médico: textos sin espacios al borde y días ordenados.
function limpiar(datos) {
  return {
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    especialidad: datos.especialidad.trim(),
    colegiatura: datos.colegiatura.trim(),
    telefono: (datos.telefono ?? '').trim(),
    consultorioId: datos.consultorioId,
    horario: {
      dias: [...new Set(datos.horario.dias)].sort((a, b) => a - b),
      inicio: datos.horario.inicio,
      fin: datos.horario.fin
    }
  }
}

function validar(datos, alta) {
  const error = primerError(validarMedico(datos, { alta }))
  if (error) throw new Error(error)
  // Solo lectura: el consultorio pertenece a su propio servicio.
  if (!leer(CLAVES.consultorios).some((c) => c.id === datos.consultorioId)) {
    throw new Error('El consultorio seleccionado no existe.')
  }
}

export function listarMedicos() {
  return leer(CLAVES.medicos)
}

// Crea el médico y su usuario de acceso (contraseña en texto plano: limitación académica).
export function crearMedico(datos) {
  validar(datos, true)
  const usuarios = leer(CLAVES.usuarios)
  const correo = datos.email.trim().toLowerCase()
  if (usuarios.some((u) => u.email.toLowerCase() === correo)) {
    throw new Error('El correo ya está registrado.')
  }

  const ahora = new Date().toISOString()
  const medico = { id: crypto.randomUUID(), creadoEn: ahora, ...limpiar(datos) }
  const usuario = {
    id: crypto.randomUUID(),
    creadoEn: ahora,
    email: datos.email.trim(),
    password: datos.password,
    nombre: nombreCompleto(medico),
    rol: 'medico',
    medicoId: medico.id
  }
  guardar(CLAVES.medicos, [...leer(CLAVES.medicos), medico])
  guardar(CLAVES.usuarios, [...usuarios, usuario])
  return { ...medico }
}

export function actualizarMedico(id, datos) {
  validar(datos, false)
  const medicos = leer(CLAVES.medicos)
  const indice = medicos.findIndex((m) => m.id === id)
  if (indice === -1) throw new Error('El médico no existe.')
  medicos[indice] = { ...medicos[indice], ...limpiar(datos) }
  guardar(CLAVES.medicos, medicos)
  return { ...medicos[indice] }
}
