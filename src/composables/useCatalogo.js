import { ref } from 'vue'

// Estado y ejecución comunes de los stores de catálogo (pacientes, médicos, consultorios) y de citas.
// `listar` es la función del servicio que devuelve la lista actualizada.
export function useCatalogo(listar) {
  const lista = ref([])
  const cargando = ref(false)
  const error = ref(null)

  // Ejecuta una acción del servicio y refresca la lista. Devuelve true si salió bien.
  function ejecutar(accion) {
    cargando.value = true
    error.value = null
    try {
      accion()
      lista.value = listar()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      cargando.value = false
    }
  }

  return { lista, cargando, error, ejecutar }
}
