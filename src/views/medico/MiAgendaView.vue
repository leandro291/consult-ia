<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth.js'
import { useCitasStore } from '@/stores/citas.js'
import { useConsultasStore } from '@/stores/consultas.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import CalendarioCitas from '@/components/citas/CalendarioCitas.vue'
import { formatearFecha, nombreDia } from '@/utils/formato.js'

const auth = useAuthStore()
const citas = useCitasStore()
const medicos = useMedicosStore()
const pacientes = usePacientesStore()
const consultorios = useConsultoriosStore()
const consultas = useConsultasStore()
const router = useRouter()

const hoy = new Date()
const cargando = ref(true)
const errorCarga = ref(null)

function cargar() {
  cargando.value = true
  citas.cargar()
  medicos.cargar()
  pacientes.cargar()
  consultorios.cargar()
  consultas.cargar()
  errorCarga.value = citas.error ?? medicos.error ?? pacientes.error ?? consultorios.error ?? consultas.error
  cargando.value = false
}

onMounted(cargar)

// Todas las citas del médico logueado, en cualquier estado, con el id de su consulta
// registrada si la hay (habilita "Generar receta PDF" en una cita ya atendida, RF1 de spec 014).
const citasDelMedico = computed(() =>
  citas.lista
    .filter((c) => c.medicoId === auth.sesion?.medicoId)
    .map((c) => ({ ...c, consultaId: consultas.lista.find((con) => con.citaId === c.id)?.id ?? null }))
)

function atender(citaId) {
  router.push(`/medico/atencion/${citaId}`)
}

function verHistoria(pacienteId) {
  router.push(`/medico/historia/${pacienteId}`)
}

function generarReceta(consultaId) {
  router.push(`/medico/receta/${consultaId}`)
}
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <div class="titulos">
        <h1 class="tipo-headline">
          Mi agenda
        </h1>
        <p class="fecha">
          {{ nombreDia(hoy) }}, <span class="tipo-dato fecha-dato">{{ formatearFecha(hoy) }}</span>
        </p>
      </div>
    </header>

    <section
      aria-label="Calendario de mis citas"
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
        solo-lectura
        :citas="citasDelMedico"
        :pacientes="pacientes.lista"
        :medicos="medicos.lista"
        :consultorios="consultorios.lista"
        @atender="atender"
        @ver-historia="verHistoria"
        @generar-receta="generarReceta"
      />
    </section>
  </div>
</template>

<style scoped>
.cabecera { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); padding: 28px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); }
.titulos { display: flex; flex-direction: column; gap: var(--espacio-xs); }
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
