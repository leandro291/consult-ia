import { ref } from 'vue'

const CtorReconocimiento = typeof window !== 'undefined'
  ? window.SpeechRecognition ?? window.webkitSpeechRecognition
  : null

// Envoltura de Web Speech API para el dictado de "Atender cita" (RF3 del spec 017).
// `texto` es un ref recibido por referencia: lo dictado se agrega al final, sin borrar
// lo ya escrito o editado a mano. Sin soporte del navegador, `soporte` queda en false y
// el resto del área de texto sigue usable de forma manual.
export function useDictado(texto) {
  const soporte = Boolean(CtorReconocimiento)
  const estado = ref('inactivo') // inactivo | dictando | pausado | detenido
  const error = ref(null)

  let reconocimiento = null

  function crearReconocimiento() {
    const instancia = new CtorReconocimiento()
    instancia.lang = 'es-PE'
    instancia.continuous = true
    instancia.interimResults = true

    instancia.onresult = (evento) => {
      let agregado = ''
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i]
        if (resultado.isFinal) agregado += resultado[0].transcript
      }
      agregado = agregado.trim()
      if (agregado) texto.value = texto.value ? `${texto.value} ${agregado}` : agregado
    }
    instancia.onerror = (evento) => {
      error.value = evento.error === 'not-allowed' || evento.error === 'service-not-allowed'
        ? 'No se pudo acceder al micrófono. Revise los permisos del navegador.'
        : 'Ocurrió un error con el dictado. Puede seguir escribiendo directamente en el texto.'
      estado.value = 'detenido'
    }
    // El navegador puede terminar el reconocimiento solo (ej. silencio prolongado).
    instancia.onend = () => {
      if (estado.value === 'dictando') estado.value = 'detenido'
    }
    return instancia
  }

  function escuchar() {
    error.value = null
    reconocimiento = reconocimiento ?? crearReconocimiento()
    try {
      reconocimiento.start()
      estado.value = 'dictando'
    } catch {
      error.value = 'No se pudo iniciar el dictado. Puede escribir directamente en el texto.'
    }
  }

  function pausar() {
    reconocimiento?.stop()
    estado.value = 'pausado'
  }

  function detener() {
    reconocimiento?.stop()
    estado.value = 'detenido'
  }

  function limpiar() {
    reconocimiento?.stop()
    texto.value = ''
    estado.value = 'inactivo'
    error.value = null
  }

  return { soporte, estado, error, iniciar: escuchar, pausar, reanudar: escuchar, detener, limpiar }
}
