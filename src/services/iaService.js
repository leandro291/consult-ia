// POST al servidor de IA (URL de `VITE_IA_SERVIDOR_URL`) y validación de su respuesta.

const TIMEOUT_MS = 30000

const CLAVES_CONTRATO = ['motivo', 'signosVitales', 'examenFisico', 'diagnosticos', 'plan', 'receta', 'indicacionesPaciente', 'advertencias']
const CLAVES_SIGNOS_VITALES = ['presion', 'frecuenciaCardiaca', 'temperatura', 'peso', 'talla']

// Quita los bloques ```json``` si vienen y toma desde la primera "{" hasta la última "}" (RF4).
function extraerJson(texto) {
  const sinBloques = texto.replace(/```json/gi, '').replace(/```/g, '')
  const inicio = sinBloques.indexOf('{')
  const fin = sinBloques.lastIndexOf('}')
  if (inicio === -1 || fin === -1 || fin < inicio) throw new Error('sin json')
  return JSON.parse(sinBloques.slice(inicio, fin + 1))
}

const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim().length > 0

// Validación mínima de estructura (RF5): no revisa los tipos de signosVitales ni de los demás textos.
function respuestaValida(json) {
  if (!json || typeof json !== 'object') return false
  if (!CLAVES_CONTRATO.every((clave) => clave in json)) return false
  const signos = json.signosVitales
  if (!signos || typeof signos !== 'object' || !CLAVES_SIGNOS_VITALES.every((clave) => clave in signos)) return false
  if (!Array.isArray(json.diagnosticos) || !Array.isArray(json.receta) || !Array.isArray(json.advertencias)) return false
  if (!json.diagnosticos.every((d) => esTextoNoVacio(d?.descripcion))) return false
  if (!json.receta.every((item) => esTextoNoVacio(item?.medicamento))) return false
  return true
}

function mensajeErrorHttp(status) {
  if (status === 429) return 'Se alcanzó el límite de uso del servidor de IA. Espere un momento y reintente.'
  if (status >= 500) return 'El servidor de IA tuvo un error. Intente de nuevo en unos minutos.'
  return `El servidor de IA respondió con un error (código ${status}).`
}

// Envía la transcripción y el contexto anonimizado al servidor de IA y valida la respuesta (RF2-RF5).
// La URL sale de VITE_IA_SERVIDOR_URL (variable de build de Vite), no de un parámetro ni de localStorage.
export async function generarSugerencias(transcripcion, contexto) {
  const destino = (import.meta.env.VITE_IA_SERVIDOR_URL ?? '').trim()
  if (!destino) throw new Error('El asistente de IA no está configurado en esta instalación.')

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS)

  let respuesta
  try {
    respuesta = await fetch(destino, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcripcion, contexto }),
      signal: controlador.signal
    })
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('El servidor de IA tardó más de 30 segundos en responder.', { cause: e })
    throw new Error('No se pudo conectar con el servidor de IA. Revise su conexión o intente más tarde.', { cause: e })
  } finally {
    clearTimeout(temporizador)
  }

  if (!respuesta.ok) throw new Error(mensajeErrorHttp(respuesta.status))

  let json
  try {
    json = extraerJson(await respuesta.text())
  } catch {
    throw new Error('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
  }
  if (!respuestaValida(json)) throw new Error('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
  return json
}
