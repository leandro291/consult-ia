<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useCitasStore } from '@/stores/citas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import CalendarioCitas from '@/components/citas/CalendarioCitas.vue'
import CitaForm from '@/components/citas/CitaForm.vue'
import { formatearFecha, nombreCompleto, nombreDia } from '@/utils/formato.js'

const citas = useCitasStore()
const medicos = useMedicosStore()
const pacientes = usePacientesStore()
const consultorios = useConsultoriosStore()
const toast = useToast()
const confirmar = useConfirm()

const calendario = ref(null)
const medicoId = ref(null)
const formularioVisible = ref(false)
const valoresIniciales = ref({})
const hoy = new Date()
const cargando = ref(true)
// Solo el error de la carga inicial; los de reprogramar se muestran en el Toast.
const errorCarga = ref(null)

function cargar() {
  cargando.value = true
  citas.cargar()
  medicos.cargar()
  pacientes.cargar()
  consultorios.cargar()
  errorCarga.value = citas.error ?? medicos.error ?? pacientes.error ?? consultorios.error
  cargando.value = false
}

onMounted(cargar)

const citasFiltradas = computed(() =>
  medicoId.value ? citas.lista.filter((c) => c.medicoId === medicoId.value) : citas.lista
)

function reprogramar({ id, fecha, hora, revertir }) {
  if (citas.reprogramar(id, { fecha, hora })) {
    toast.add({ severity: 'success', summary: 'Cita reprogramada.', life: 4000 })
    return
  }
  revertir()
  toast.add({ severity: 'error', summary: 'No se pudo reprogramar', detail: citas.error, life: 6000 })
}

// Botón de cabecera: llega con el médico del filtro preseleccionado, sin fecha ni hora.
function abrirNuevaCita() {
  valoresIniciales.value = { medicoId: medicoId.value ?? '' }
  formularioVisible.value = true
}

// Clic en un hueco libre del calendario: además del médico del filtro, llega con la fecha y la hora.
function nuevaCitaDesdeHueco({ fecha, hora }) {
  valoresIniciales.value = { medicoId: medicoId.value ?? '', fecha, hora: hora ?? '' }
  formularioVisible.value = true
}

// Sin esto, una cita creada fuera de la semana visible se guarda pero no se ve hasta navegar hasta su fecha.
function citaCreada({ fecha }) {
  calendario.value.irAFecha(fecha)
  toast.add({ severity: 'success', summary: 'Cita creada.', life: 4000 })
}

// Cancelación en dos pasos, igual que useEliminarPaciente.js: confirmar y solo entonces cancelar.
function pedirCancelar(cita) {
  const paciente = pacientes.lista.find((p) => p.id === cita.pacienteId)
  confirmar.require({
    header: `¿Cancelar la cita de ${paciente ? nombreCompleto(paciente) : 'este paciente'}?`,
    message: 'Esta acción no se puede deshacer.',
    rejectProps: { label: 'No cancelar', text: true },
    acceptProps: {
      label: 'Sí, cancelar cita',
      style: 'background: var(--color-alerta); border-color: var(--color-alerta); color: var(--color-papel)'
    },
    accept: () => cancelar(cita)
  })
}

function cancelar(cita) {
  if (citas.cancelar(cita.id)) {
    toast.add({ severity: 'success', summary: 'Cita cancelada.', life: 4000 })
  } else {
    toast.add({ severity: 'error', summary: citas.error, life: 6000 })
  }
}
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <div class="titulos">
        <h1 class="tipo-headline">
          Agenda
        </h1>
        <p class="fecha">
          {{ nombreDia(hoy) }}, <span class="tipo-dato fecha-dato">{{ formatearFecha(hoy) }}</span>
        </p>
      </div>
      <Button
        type="button"
        class="boton-nueva-cita"
        @click="abrirNuevaCita"
      >
        <svg
          class="icono"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva cita
      </Button>
    </header>

    <section
      aria-label="Calendario de citas"
      class="hoja"
    >
      <p
        v-if="cargando"
        class="estado"
        role="status"
      >
        Cargando agenda…
      </p>
      <div
        v-else-if="errorCarga"
        class="estado"
        role="alert"
      >
        <p class="estado-titulo">
          No se pudo cargar la agenda
        </p>
        <p>{{ errorCarga }} No se cambió ningún dato.</p>
        <Button
          type="button"
          label="Reintentar"
          @click="cargar"
        />
      </div>
      <CalendarioCitas
        v-else
        ref="calendario"
        v-model:medico-id="medicoId"
        :citas="citasFiltradas"
        :pacientes="pacientes.lista"
        :medicos="medicos.lista"
        :consultorios="consultorios.lista"
        @reprogramar="reprogramar"
        @nueva-cita="nuevaCitaDesdeHueco"
        @cancelar="pedirCancelar"
      />
    </section>

    <CitaForm
      v-model:visible="formularioVisible"
      :valores-iniciales="valoresIniciales"
      @creada="citaCreada"
    />
  </div>
</template>

<style scoped>
.cabecera { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); padding: 28px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); }
.titulos { display: flex; flex-direction: column; gap: var(--espacio-xs); }
.cabecera h1 { margin: 0; }
.fecha { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }
.fecha-dato { font-weight: 400; font-size: inherit; }
.boton-nueva-cita { height: 44px; gap: var(--espacio-sm); padding: 0 18px; font-size: 15px; box-shadow: var(--sombra-boton); }
.hoja { margin: 28px 48px 40px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 24px; text-align: center; color: var(--color-texto-secundario); }
.estado p { margin: 0; }
.estado-titulo { font-size: 17px; font-weight: 700; color: var(--color-texto); }

@media (max-width: 1023px) {
  .cabecera { padding-inline: 24px; }
  .hoja { margin-inline: 24px; }
}
</style>
