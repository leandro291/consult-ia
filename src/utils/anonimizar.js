import { calcularEdad } from '@/utils/formato.js'

// Contexto anónimo para el servidor de IA (RF5 del spec 017): nunca nombre, DNI,
// teléfono, email ni dirección del paciente.
export function anonimizar(paciente) {
  return {
    edad: calcularEdad(paciente.fechaNacimiento),
    sexo: paciente.sexo,
    alergias: [...(paciente.alergias ?? [])],
    antecedentes: paciente.antecedentes ?? ''
  }
}
