import dayjs from 'dayjs'

// Cuenta las citas por día (lunes a sábado) y por estado. "Programadas" suma programada y confirmada.
// `lunes` en formato YYYY-MM-DD; las citas fuera de esos 6 días se ignoran.
export function citasPorDiaYEstado(citas, lunes) {
  const inicio = dayjs(lunes)
  const claves = { programada: 'programadas', confirmada: 'programadas', atendida: 'atendidas', cancelada: 'canceladas', no_asistio: 'noAsistio' }
  const conteo = { programadas: [], atendidas: [], canceladas: [], noAsistio: [] }
  for (const serie of Object.values(conteo)) serie.push(0, 0, 0, 0, 0, 0)

  for (const cita of citas) {
    const indice = dayjs(cita.fecha).diff(inicio, 'day')
    const serie = claves[cita.estado]
    if (indice >= 0 && indice <= 5 && serie) conteo[serie][indice]++
  }
  return conteo
}

// Citas por médico sin contar las canceladas, de mayor a menor carga; incluye a los médicos con 0.
// `citas` ya viene limitada a la semana. Las citas de médicos que no están en la lista se ignoran.
export function citasPorMedico(citas, medicos) {
  const filas = medicos.map((m) => ({
    medicoId: m.id,
    etiqueta: `Dr. ${m.apellidos.split(' ')[0]} · ${m.especialidad}`,
    total: citas.filter((c) => c.medicoId === m.id && c.estado !== 'cancelada').length
  }))
  return filas.sort((a, b) => b.total - a.total)
}
