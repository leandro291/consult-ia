import { CLAVES, guardar, leer } from '@/services/storage.js'

// Autenticación SIMULADA: las contraseñas están en texto plano en clinica_usuarios.
// Es solo para el proyecto académico; no es apta para datos médicos reales.

export function login(email, password) {
  const correo = (email ?? '').trim().toLowerCase()
  const usuario = leer(CLAVES.usuarios).find(
    (u) => u.email.toLowerCase() === correo && u.password === password
  )
  if (!usuario) throw new Error('Correo o contraseña incorrectos.')
  const sesion = { usuarioId: usuario.id, rol: usuario.rol, nombre: usuario.nombre }
  // Solo los médicos tienen medicoId en clinica_usuarios; la sesión de recepción no lo incluye.
  if (usuario.medicoId) sesion.medicoId = usuario.medicoId
  guardar(CLAVES.sesion, sesion)
  return { ...sesion }
}

export function logout() {
  guardar(CLAVES.sesion, null)
}

export function sesionActual() {
  const sesion = leer(CLAVES.sesion, null)
  return sesion ? { ...sesion } : null
}
