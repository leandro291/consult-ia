// Único punto de acceso a localStorage de toda la aplicación.

export const CLAVES = {
  usuarios: 'clinica_usuarios',
  pacientes: 'clinica_pacientes',
  medicos: 'clinica_medicos',
  consultorios: 'clinica_consultorios',
  citas: 'clinica_citas',
  consultas: 'clinica_consultas',
  recetas: 'clinica_recetas',
  sesion: 'clinica_sesion',
  version: 'clinica_version'
}

// Devuelve el JSON guardado, o `porDefecto` si no existe, es null o está corrupto.
export function leer(clave, porDefecto = []) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

export function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos))
}
