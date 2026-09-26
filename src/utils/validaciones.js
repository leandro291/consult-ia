const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Devuelve un mensaje por campo inválido, o {} si todo es válido.
export function validarLogin({ email, password }) {
  const errores = {}
  const correo = (email ?? '').trim()
  if (!correo) errores.email = 'El correo es obligatorio.'
  else if (!FORMATO_EMAIL.test(correo)) errores.email = 'Ingrese un correo válido.'
  if (!password) errores.password = 'La contraseña es obligatoria.'
  return errores
}
