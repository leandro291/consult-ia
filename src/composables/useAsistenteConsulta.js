import { ref } from 'vue'
import { asistenteActivo, generarSugerencias } from '@/services/iaService.js'
import { anonimizar } from '@/utils/anonimizar.js'
import { VIAS_RECETA } from '@/utils/formato.js'

const CLAVES_SIGNOS = ['presion', 'frecuenciaCardiaca', 'temperatura', 'peso', 'talla']

// Da forma a la respuesta de la IA como la espera ConsultaForm (RF6): signos vitales como
// texto y sin claves null ni arrays vacíos, para no pisar lo que ya tiene el formulario.
function limpiarSugerencia(json) {
  const sugerencia = {}
  if (json.motivo) sugerencia.motivo = json.motivo
  if (json.examenFisico) sugerencia.examenFisico = json.examenFisico
  if (json.plan) sugerencia.plan = json.plan
  if (json.diagnosticos?.length) {
    sugerencia.diagnosticos = json.diagnosticos.map((d) => ({ codigo: d.codigo ?? null, descripcion: d.descripcion }))
  }

  const signos = {}
  CLAVES_SIGNOS.forEach((clave) => {
    const valor = json.signosVitales?.[clave]
    if (valor !== null && valor !== undefined && valor !== '') signos[clave] = String(valor)
  })
  if (Object.keys(signos).length) sugerencia.signosVitales = signos

  return sugerencia
}

// Arma el borrador de receta (RF1 del spec 018) con la forma de fila de RecetaForm.vue: el
// composable no puede importar componentes (tabla de capas de SETUP.md), así que arma la fila él
// mismo. Sin medicamentos ni indicaciones para el paciente, no hay borrador (RF1, CA4).
function limpiarBorradorReceta(json) {
  const items = (json.receta ?? []).map((item) => ({
    medicamento: item.medicamento,
    dosis: item.dosis ?? '',
    frecuencia: item.frecuencia ?? '',
    duracion: item.duracion ?? '',
    via: VIAS_RECETA.includes(item.via) ? item.via : '',
    indicaciones: item.indicaciones ?? ''
  }))
  const indicacionesGenerales = json.indicacionesPaciente ?? ''
  if (!items.length && !indicacionesGenerales) return null
  return { items, indicacionesGenerales }
}

// Orquesta dictado -> IA -> formulario en "Atender cita" (RF1-RF10 del spec 017, RF1 del spec 018).
export function useAsistenteConsulta() {
  const activo = asistenteActivo()

  const transcripcion = ref('')
  const cargando = ref(false)
  const error = ref(null)
  const advertencias = ref([])
  const sugerencia = ref(null)
  const borradorReceta = ref(null)
  const generado = ref(false)
  const transcripcionEnviada = ref('')

  // Si falla, la transcripción y la última sugerencia quedan intactas para reintentar (RF9).
  async function generar(paciente) {
    cargando.value = true
    error.value = null
    try {
      const texto = transcripcion.value
      const json = await generarSugerencias(texto, anonimizar(paciente))
      sugerencia.value = limpiarSugerencia(json)
      borradorReceta.value = limpiarBorradorReceta(json)
      advertencias.value = json.advertencias ?? []
      transcripcionEnviada.value = texto
      generado.value = true
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  // El texto de ejemplo lo trae quien llama (PanelAsistente, que sí puede importar data/):
  // el composable no conoce `data/seed.js`, solo aplica el texto recibido (tabla de capas de SETUP.md).
  function usarEjemplo(texto) {
    transcripcion.value = texto
  }

  return {
    activo, transcripcion, cargando, error, advertencias, sugerencia, borradorReceta, generado, transcripcionEnviada,
    generar, usarEjemplo
  }
}
