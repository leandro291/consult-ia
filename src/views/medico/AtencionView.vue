<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth.js'
import { useCitasStore } from '@/stores/citas.js'
import { useConsultasStore } from '@/stores/consultas.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useRecetasStore } from '@/stores/recetas.js'
import CabeceraAtencion from '@/components/consultas/CabeceraAtencion.vue'
import FranjaAlergias from '@/components/comunes/FranjaAlergias.vue'
import UltimaConsulta from '@/components/consultas/UltimaConsulta.vue'
import ConsultaForm from '@/components/consultas/ConsultaForm.vue'
import PanelAsistente from '@/components/asistente/PanelAsistente.vue'
import RecetaForm from '@/components/recetas/RecetaForm.vue'
import { useAsistenteConsulta } from '@/composables/useAsistenteConsulta.js'
import { useAlertasAlergias } from '@/composables/useAlertasAlergias.js'
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
const recetas = useRecetasStore()
const {
  activo: iaActiva, transcripcion: iaTranscripcion, cargando: iaCargando, error: iaError,
  advertencias: iaAdvertencias, sugerencia: iaSugerencia, borradorReceta, generado: iaGenerado, transcripcionEnviada,
  generar: generarSugerenciasIA, usarEjemplo: usarEjemploIA
} = useAsistenteConsulta()

// Copia editable del borrador de receta que sugiere la IA (RF1, RF6 del spec 018): RecetaForm
// muta esto vía v-model; se re-arma cada vez que `borradorReceta` trae un objeto nuevo ("Volver a
// generar" lo reemplaza), y RecetaForm se remonta con :key para volver a marcar todo "Sugerido por IA".
const borrador = reactive({ items: [], indicacionesGenerales: '' })
watch(borradorReceta, (nuevo) => {
  if (!nuevo) return
  borrador.items = nuevo.items.map((item) => ({ ...item }))
  borrador.indicacionesGenerales = nuevo.indicacionesGenerales
}, { immediate: true })

// Cruce de los medicamentos del borrador con las alergias del paciente (RF3-RF5 del spec 018).
const {
  pendientes: alergiasPendientes, mantener: mantenerAlergia, aviso: avisoAlergias
} = useAlertasAlergias(
  computed(() => borrador.items),
  computed(() => paciente.value?.alergias ?? [])
)

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

// Consulta registrada para esta cita, si la hay (RF1): habilita "Generar receta PDF".
const consultaDeLaCita = computed(() =>
  cita.value ? consultas.lista.find((c) => c.citaId === cita.value.id) ?? null : null
)

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

// Al guardar, la pantalla se queda en la atención (RF1): la cita pasa a atendida y aparece
// "Generar receta PDF", en vez de navegar a Mi agenda.
// Si hubo al menos una generación correcta de la IA, se guarda además `generadaConIA` y la
// transcripción de esa última generación (RF10 del spec 017).
function guardar(datos) {
  const extraIA = iaGenerado.value
    ? { generadaConIA: true, transcripcion: transcripcionEnviada.value }
    : {}
  const guardada = consultas.registrar({ ...datos, ...extraIA, citaId: cita.value.id })
  if (!guardada) {
    toast.add({ severity: 'error', summary: consultas.error, life: 6000 })
    return
  }
  // El borrador de receta, si lo hay, pasa a Emitir receta en memoria (RF6 del spec 018).
  if (borradorReceta.value) {
    recetas.fijarBorrador(cita.value.id, {
      items: borrador.items.map((item) => ({ ...item })),
      indicacionesGenerales: borrador.indicacionesGenerales
    })
  }
  citas.cargar()
  toast.add({ severity: 'success', summary: 'Consulta registrada.', life: 4000 })
}

function generarConIA() {
  generarSugerenciasIA(paciente.value)
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
        <div class="columna-izquierda">
          <PanelAsistente
            v-if="editable"
            v-model="iaTranscripcion"
            :activo="iaActiva"
            :cargando="iaCargando"
            :error="iaError"
            :advertencias="iaAdvertencias"
            :generado="iaGenerado"
            @generar="generarConIA"
            @usar-ejemplo="usarEjemploIA"
          />
          <UltimaConsulta
            :consulta="ultimaConsulta"
            :medico="medicoUltimaConsulta"
            :paciente-id="paciente.id"
          />
        </div>
        <div
          v-if="editable"
          class="columna-derecha"
        >
          <ConsultaForm
            :cita="cita"
            :sugerencia="iaSugerencia"
            :aviso-bloqueo="avisoAlergias"
            @guardar="guardar"
          />
          <RecetaForm
            v-if="borradorReceta"
            :key="borradorReceta"
            v-model:items="borrador.items"
            v-model:indicaciones-generales="borrador.indicacionesGenerales"
            titulo="Borrador de receta"
            etiqueta-indicaciones="Indicaciones para el paciente"
            ayuda-indicaciones="Se imprime en la receta, en lenguaje sencillo."
            sugerido
            :pendientes="alergiasPendientes"
            @mantener="mantenerAlergia"
          />
        </div>
        <div
          v-else
          class="aviso-estado-wrap"
        >
          <p class="estado aviso-estado">
            Esta cita está {{ ETIQUETAS_ESTADO_CITA[cita.estado]?.toLowerCase() ?? cita.estado }};
            no se puede registrar una consulta.
          </p>
          <Button
            v-if="consultaDeLaCita"
            type="button"
            label="Generar receta PDF"
            @click="router.push(`/medico/receta/${consultaDeLaCita.id}`)"
          />
        </div>
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
.columna-izquierda { display: flex; flex-direction: column; gap: var(--espacio-xl); min-width: 0; }
.columna-derecha { display: flex; flex-direction: column; gap: var(--espacio-xl); min-width: 0; }
.aviso-estado-wrap { display: flex; flex-direction: column; align-items: center; gap: var(--espacio-lg); }
.aviso-estado { margin: 0; }

@media (max-width: 1023px) {
  .cabecera-simple, .contenido { padding-inline: 24px; }
  .contenido { grid-template-columns: 1fr; }
}
</style>
