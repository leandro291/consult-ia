import { computed, reactive } from 'vue'
import { buscarConflictos } from '@/utils/alergias.js'
import { normalizarTexto } from '@/utils/formato.js'

// Cruza medicamentos con alergias y maneja la confirmación de RF4-RF5 del spec 018.
// `items` y `alergias` son refs o computed reactivos (arrays planos). La confirmación se liga
// al nombre normalizado del medicamento: cambiarlo vuelve a exigirla, editar otros campos no.
export function useAlertasAlergias(items, alergias) {
  const resueltos = reactive(new Set())

  const conflictos = computed(() => buscarConflictos(items.value, alergias.value))
  const pendientes = computed(() =>
    conflictos.value.filter((c) => !resueltos.has(normalizarTexto(c.medicamento)))
  )

  function mantener(medicamento) {
    resueltos.add(normalizarTexto(medicamento))
  }

  // "N alerta(s) de alergia sin resolver" (RF5): bloquea "Guardar consulta" o "Descargar"/"Imprimir".
  const aviso = computed(() => {
    const n = pendientes.value.length
    if (!n) return null
    return `${n} alerta${n === 1 ? '' : 's'} de alergia sin resolver`
  })

  return { conflictos, pendientes, mantener, aviso }
}
