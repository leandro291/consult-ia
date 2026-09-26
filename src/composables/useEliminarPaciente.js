import { ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { usePacientesStore } from '@/stores/pacientes.js'
import { nombreCompleto } from '@/utils/formato.js'

// Eliminación en dos pasos: sin consultas se confirma; con consultas solo se avisa el motivo.
export function useEliminarPaciente() {
  const pacientes = usePacientesStore()
  const confirmar = useConfirm()
  const toast = useToast()

  const avisoVisible = ref(false)
  const pacienteConConsultas = ref(null)

  function pedirEliminar(paciente) {
    if (paciente.totalConsultas > 0) {
      pacienteConConsultas.value = paciente
      avisoVisible.value = true
      return
    }
    confirmar.require({
      header: `¿Eliminar a ${nombreCompleto(paciente)}?`,
      message: 'Esta acción no se puede deshacer.',
      rejectProps: { label: 'Cancelar', text: true },
      acceptProps: {
        label: 'Sí, eliminar',
        style: 'background: var(--color-alerta); border-color: var(--color-alerta); color: var(--color-papel)'
      },
      accept: () => eliminar(paciente)
    })
  }

  function eliminar(paciente) {
    if (pacientes.eliminar(paciente.id)) {
      toast.add({ severity: 'success', summary: 'Paciente eliminado.', life: 4000 })
    } else {
      toast.add({ severity: 'error', summary: pacientes.error, life: 6000 })
    }
  }

  return { avisoVisible, pacienteConConsultas, pedirEliminar }
}
