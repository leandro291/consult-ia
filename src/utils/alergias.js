import { normalizarTexto } from '@/utils/formato.js'

// Tabla simplificada de familias de medicamentos de "Asistente de consulta por voz (IA)" en
// CLAUDE.md. No reemplaza una base farmacológica real (limitación documentada en el README).
export const FAMILIAS_ALERGIAS = {
  penicilina: ['amoxicilina', 'ampicilina'],
  aines: ['ibuprofeno', 'naproxeno', 'diclofenaco'],
  sulfas: ['sulfametoxazol']
}

// Cruza cada medicamento con las alergias del paciente (RF3 del spec 018): lógica local, sin IA.
// Hay conflicto si el nombre del medicamento contiene, sin tildes ni mayúsculas, el nombre de una
// alergia del paciente o el de un integrante de la familia que se llama como esa alergia.
export function buscarConflictos(items, alergias) {
  const conflictos = []
  items.forEach((item, indice) => {
    const nombre = normalizarTexto(item.medicamento)
    if (!nombre) return

    const alergiaEnConflicto = (alergias ?? []).find((alergia) => {
      const alergiaNormalizada = normalizarTexto(alergia)
      if (nombre.includes(alergiaNormalizada)) return true
      const familia = FAMILIAS_ALERGIAS[alergiaNormalizada]
      return familia?.some((miembro) => nombre.includes(miembro)) ?? false
    })

    if (alergiaEnConflicto) conflictos.push({ indice, medicamento: item.medicamento, alergia: alergiaEnConflicto })
  })
  return conflictos
}
