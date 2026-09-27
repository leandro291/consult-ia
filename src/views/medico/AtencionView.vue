<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth.js'
import { useCitasStore } from '@/stores/citas.js'
import { useConsultasStore } from '@/stores/consultas.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import CabeceraAtencion from '@/components/consultas/CabeceraAtencion.vue'
import FranjaAlergias from '@/components/comunes/FranjaAlergias.vue'
import UltimaConsulta from '@/components/consultas/UltimaConsulta.vue'
import ConsultaForm from '@/components/consultas/ConsultaForm.vue'
import { ETIQUETAS_ESTADO_CITA } from '@/utils/formato.js'

const ESTADOS_EDITABLES = ['programada', 'confirmada']

const route = useRoute()
const router = useRouter()
const toast = useToast()

const auth = useAuthStore()
const citas = useCitasStore()
const pacientes = usePacientesStore()
const medicos = useMedicosStore()
const consultorios = useConsultoriosStore()
const consultas = useConsultasStore()

const cargando = ref(true)
const errorCarga = ref(null)

function cargar() {
  cargando.value = true
  citas.cargar()
  pacientes.cargar()
  medicos.cargar()
  consultorios.cargar()
  consultas.cargar()
  errorCarga.value = citas.error ?? pacientes.error ?? medicos.error ?? consultorios.error ?? consultas.error
  cargando.value = false
}

onMounted(cargar)

// Solo cuenta si es una cita del médico logueado (RF7).
const cita = computed(() =>
  citas.lista.find((c) => c.id === route.params.citaId && c.medicoId === auth.sesion?.medicoId) ?? null
)
const paciente = computed(() => (cita.value ? pacientes.lista.find((p) => p.id === cita.value.pacienteId) : null))
const consultorio = computed(() =>
  cita.value ? consultorios.lista.find((c) => c.id === cita.value.consultorioId) : null
)
const editable = computed(() => ESTADOS_EDITABLES.includes(cita.value?.estado))

// Consulta más reciente del paciente, de cualquier médico (RF3).
const ultimaConsulta = computed(() => {
  if (!paciente.value) return null
  const propias = consultas.lista.filter((c) => c.pacienteId === paciente.value.id)
  if (!propias.length) return null
  return [...propias].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
})
const medicoUltimaConsulta = computed(() =>
  ultimaConsulta.value ? medicos.lista.find((m) => m.id === ultimaConsulta.value.medicoId) ?? null : null
)

function guardar(datos) {
  const guardada = consultas.registrar({ ...datos, citaId: cita.value.id })
  if (!guardada) {
    toast.add({ severity: 'error', summary: consultas.error, life: 6000 })
    return
  }
  citas.cargar()
  toast.add({ severity: 'success', summary: 'Consulta registrada.', life: 4000 })
  router.push('/medico/agenda')
}
</script>

<template>
  <div class="pagina">
    <p
      v-if="cargando"
      class="estado"
      role="status"
    >
      Cargando…
    </p>

    <div
      v-else-if="errorCarga"
      class="estado"
      role="alert"
    >
      <p class="estado-titulo">
        No se pudo cargar la atención
      </p>
      <p>{{ errorCarga }} No se cambió ningún dato.</p>
      <Button
        type="button"
        label="Reintentar"
        @click="cargar"
      />
    </div>

    <template v-else-if="!cita">
      <header class="cabecera-simple">
        <RouterLink
          to="/medico/agenda"
          class="volver"
        >
          <svg
            class="icono"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path d="M15 6l-6 6 6 6" /></svg>
          Mi agenda
        </RouterLink>
      </header>
      <p
        class="estado"
        role="alert"
      >
        La cita no existe o no pertenece a su agenda.
      </p>
    </template>

    <template v-else>
      <CabeceraAtencion
        :paciente="paciente"
        :cita="cita"
        :consultorio="consultorio"
      />
      <FranjaAlergias
        :alergias="paciente.alergias"
        :antecedentes="paciente.antecedentes"
        :sexo="paciente.sexo"
      />

      <div class="contenido">
        <UltimaConsulta
          :consulta="ultimaConsulta"
          :medico="medicoUltimaConsulta"
          :paciente-id="paciente.id"
        />
        <ConsultaForm
          v-if="editable"
          :cita="cita"
          @guardar="guardar"
        />
        <p
          v-else
          class="estado aviso-estado"
        >
          Esta cita está {{ ETIQUETAS_ESTADO_CITA[cita.estado]?.toLowerCase() ?? cita.estado }};
          no se puede registrar una consulta.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pagina { display: flex; flex-direction: column; min-height: 100%; }
.cabecera-simple { padding: 20px 48px 0; }
.volver { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; text-decoration: none; }
.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 28px 48px 40px; padding: 36px 24px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); text-align: center; color: var(--color-texto-secundario); }
.estado p { margin: 0; }
.estado-titulo { font-size: 17px; font-weight: 700; color: var(--color-texto); }
.contenido { flex-grow: 1; display: grid; grid-template-columns: 392px minmax(0, 1fr); align-items: start; gap: var(--espacio-2xl); padding: 28px 48px 40px; border-top: 2px dotted var(--color-perforacion); }
.aviso-estado { margin: 0; }

@media (max-width: 1023px) {
  .cabecera-simple, .contenido { padding-inline: 24px; }
  .contenido { grid-template-columns: 1fr; }
}
</style>
