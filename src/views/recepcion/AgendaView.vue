<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useCitasStore } from '@/stores/citas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import CalendarioCitas from '@/components/citas/CalendarioCitas.vue'
import { formatearFecha, nombreDia } from '@/utils/formato.js'

const citas = useCitasStore()
const medicos = useMedicosStore()
const pacientes = usePacientesStore()
const consultorios = useConsultoriosStore()
const toast = useToast()

const medicoId = ref(null)
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
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <h1 class="tipo-headline">
        Agenda
      </h1>
      <p class="fecha">
        {{ nombreDia(hoy) }}, <span class="tipo-dato fecha-dato">{{ formatearFecha(hoy) }}</span>
      </p>
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
        v-model:medico-id="medicoId"
        :citas="citasFiltradas"
        :pacientes="pacientes.lista"
        :medicos="medicos.lista"
        :consultorios="consultorios.lista"
        @reprogramar="reprogramar"
      />
    </section>
  </div>
</template>

<style scoped>
.cabecera { display: flex; flex-direction: column; gap: var(--espacio-xs); padding: 28px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); }
.cabecera h1 { margin: 0; }
.fecha { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }
.fecha-dato { font-weight: 400; font-size: inherit; }
.hoja { margin: 28px 48px 40px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 24px; text-align: center; color: var(--color-texto-secundario); }
.estado p { margin: 0; }
.estado-titulo { font-size: 17px; font-weight: 700; color: var(--color-texto); }

@media (max-width: 1023px) {
  .cabecera { padding-inline: 24px; }
  .hoja { margin-inline: 24px; }
}
</style>
