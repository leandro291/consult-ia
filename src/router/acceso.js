import { INICIO_POR_ROL } from '@/utils/roles.js'

// Decide si se permite el acceso (true) o a qué ruta redirigir.
export function resolverAcceso(destino, sesion) {
  const sesionValida = Boolean(sesion) && sesion.rol in INICIO_POR_ROL
  if (destino.meta.publica) return sesionValida ? INICIO_POR_ROL[sesion.rol] : true
  if (!sesionValida) return '/login'
  if (destino.meta.rol && destino.meta.rol !== sesion.rol) return INICIO_POR_ROL[sesion.rol]
  return true
}
