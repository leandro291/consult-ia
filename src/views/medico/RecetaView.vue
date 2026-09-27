<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth.js'
import { useConsultasStore } from '@/stores/consultas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useRecetasStore } from '@/stores/recetas.js'
import FranjaAlergias from '@/components/comunes/FranjaAlergias.vue'
import RecetaForm, { medicamentoVacio } from '@/components/recetas/RecetaForm.vue'
import VistaPreviaReceta from '@/components/recetas/VistaPreviaReceta.vue'
import { useAlertasAlergias } from '@/composables/useAlertasAlergias.js'
import { CLINICA } from '@/pdf/comunes.js'
import { descargarRecetaPdf, imprimirRecetaPdf, nombreArchivoReceta } from '@/pdf/recetaPdf.js'
import { formatearFecha, formatearFechaHora, nombreCompleto } from '@/utils/formato.js'
import { validarReceta } from '@/utils/validaciones.js'

const ETIQUETAS_CAMPO = { dosis: 'la dosis', frecuencia: 'la frecuencia', duracion: 'la duración', via: 'la vía' }

const route = useRoute()
const toast = useToast()

const auth = useAuthStore()
const consultas = useConsultasStore()
const pacientes = usePacientesStore()
const medicos = useMedicosStore()
const recetas = useRecetasStore()

const cargando = ref(true)
const errorCarga = ref(null)

const formulario = reactive({ items: [], indicacionesGenerales: '' })
let formularioListo = false

// Solo cuenta si es una cita del médico logueado (RF2).
const consulta = computed(() =>
  consultas.lista.find((c) => c.id === route.params.consultaId && c.medicoId === auth.sesion?.medicoId) ?? null
)
const paciente = computed(() => (consulta.value ? pacientes.lista.find((p) => p.id === consulta.value.pacienteId) : null))
const medico = computed(() => (consulta.value ? medicos.lista.find((m) => m.id === consulta.value.medicoId) : null))
const recetaExistente = computed(() =>
  consulta.value ? recetas.lista.find((r) => r.consultaId === consulta.value.id) ?? null : null
)
const primerDiagnostico = computed(() => consulta.value?.diagnosticos?.[0] ?? null)

// El formulario arranca con la receta ya guardada, o si no hay, con el borrador de la IA que
// dejó Atender cita o una fila vacía (RF6 del spec 018); solo una vez por carga.
function inicializarFormulario() {
  const existente = recetaExistente.value
  if (existente) {
    formulario.items = existente.items.map((item) => ({ ...item }))
    formulario.indicacionesGenerales = existente.indicacionesGenerales
  } else {
    const borrador = recetas.tomarBorrador(consulta.value.citaId)
    formulario.items = borrador ? borrador.items.map((item) => ({ ...item })) : [medicamentoVacio()]
    formulario.indicacionesGenerales = borrador?.indicacionesGenerales ?? ''
  }
  formularioListo = true
}

// Cruce de los medicamentos con las alergias del paciente (RF4, RF6 del spec 018): las alertas
// resueltas en Atender cita se vuelven a pedir acá.
const {
  pendientes: alergiasPendientes, mantener: mantenerAlergia, aviso: avisoAlergias
} = useAlertasAlergias(
  computed(() => formulario.items),
  computed(() => paciente.value?.alergias ?? [])
)

function cargar() {
  cargando.value = true
  consultas.cargar()
  pacientes.cargar()
  medicos.cargar()
  recetas.cargar()
  errorCarga.value = consultas.error ?? pacientes.error ?? medicos.error ?? recetas.error
  cargando.value = false
  if (!errorCarga.value && consulta.value && !formularioListo) inicializarFormulario()
}

onMounted(cargar)

const errores = computed(() => validarReceta(formulario))
const valido = computed(() => !Object.keys(errores.value).length)

// Primer dato faltante, para el aviso debajo de los botones (RF6, CA4).
const avisoValidacion = computed(() => {
  const errItems = errores.value.items
  if (typeof errItems === 'string') return errItems
  if (!Array.isArray(errItems)) return null
  for (let i = 0; i < errItems.length; i++) {
    const campo = Object.keys(errItems[i])[0]
    if (!campo) continue
    if (campo === 'medicamento') return `Indique el nombre del medicamento ${i + 1} para generar el PDF.`
    const sujeto = formulario.items[i].medicamento?.trim() || `medicamento ${i + 1}`
    return `Complete ${ETIQUETAS_CAMPO[campo]} del ${sujeto} para generar el PDF.`
  }
  return null
})

// "Descargar" e "Imprimir" también se bloquean con alertas de alergia sin resolver (RF5 del spec 018).
const bloqueadoPdf = computed(() => !valido.value || Boolean(avisoAlergias.value))
const avisoPdf = computed(() => avisoValidacion.value ?? avisoAlergias.value)

// "Descargar" e "Imprimir" guardan la receta primero (RF7); si falla, no se genera el PDF.
async function generarPdf(accion) {
  const guardada = recetas.guardar({
    consultaId: consulta.value.id,
    items: formulario.items,
    indicacionesGenerales: formulario.indicacionesGenerales
  })
  if (!guardada) {
    toast.add({ severity: 'error', summary: recetas.error, life: 6000 })
    return
  }

  const receta = recetas.lista.find((r) => r.consultaId === consulta.value.id)
  const datos = { receta, paciente: paciente.value, medico: medico.value }
  try {
    if (accion === 'descargar') await descargarRecetaPdf(datos)
    else await imprimirRecetaPdf(datos)
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo generar el PDF.', life: 6000 })
  }
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
        No se pudo cargar la receta
      </p>
      <p>{{ errorCarga }} No se cambió ningún dato.</p>
      <Button
        type="button"
        label="Reintentar"
        @click="cargar"
      />
    </div>

    <template v-else-if="!consulta">
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
        La consulta no existe o no pertenece a su agenda.
      </p>
    </template>

    <template v-else>
      <header class="cabecera">
        <div class="titulos">
          <RouterLink
            :to="`/medico/atencion/${consulta.citaId}`"
            class="volver"
          >
            <svg
              class="icono"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><path d="M15 6l-6 6 6 6" /></svg>
            Atender cita
          </RouterLink>
          <h1 class="tipo-headline">
            Emitir receta
          </h1>
          <p class="subtitulo">
            {{ nombreCompleto(paciente) }} · Consulta del <span class="tipo-dato">{{ formatearFecha(consulta.fecha) }}</span>
            <template v-if="primerDiagnostico">
              · <span class="tipo-dato">{{ primerDiagnostico.codigo }}</span> {{ primerDiagnostico.descripcion }}
            </template>
          </p>
        </div>
        <div class="sello">
          <span class="sello-titulo">Consulta guardada</span>
          <span class="sello-fecha tipo-dato">{{ formatearFechaHora(consulta.creadoEn) }}</span>
        </div>
      </header>

      <FranjaAlergias
        :alergias="paciente.alergias"
        :antecedentes="paciente.antecedentes"
        :sexo="paciente.sexo"
      />

      <main class="contenido">
        <RecetaForm
          v-model:items="formulario.items"
          v-model:indicaciones-generales="formulario.indicacionesGenerales"
          :errores="errores"
          :pendientes="alergiasPendientes"
          @mantener="mantenerAlergia"
        />

        <div class="columna-vista-previa">
          <VistaPreviaReceta
            :items="formulario.items"
            :indicaciones-generales="formulario.indicacionesGenerales"
            :paciente="paciente"
            :medico="medico"
            :fecha="consulta.fecha"
            :receta-id="recetaExistente?.id ?? null"
            :clinica="CLINICA"
            :nombre-archivo="nombreArchivoReceta(paciente, consulta.fecha)"
          />

          <div class="botones">
            <Button
              type="button"
              :disabled="bloqueadoPdf"
              :aria-describedby="bloqueadoPdf ? 'pdf-bloqueo' : undefined"
              class="boton-pdf"
              @click="generarPdf('descargar')"
            >
              <svg
                class="icono"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
              Descargar
            </Button>
            <Button
              type="button"
              :disabled="bloqueadoPdf"
              :aria-describedby="bloqueadoPdf ? 'pdf-bloqueo' : undefined"
              class="boton-pdf"
              @click="generarPdf('imprimir')"
            >
              <svg
                class="icono"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" /></svg>
              Imprimir
            </Button>
            <p
              v-if="bloqueadoPdf"
              id="pdf-bloqueo"
              class="aviso-bloqueo"
              role="alert"
            >
              <svg
                class="icono"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><circle
                cx="12"
                cy="12"
                r="9"
              /><path d="M12 8v5M12 16v.01" /></svg>
              {{ avisoPdf }}
            </p>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.pagina { display: flex; flex-direction: column; min-height: 100%; }
.cabecera-simple { padding: 20px 48px 0; }
.volver { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; font-size: 14px; font-weight: 600; text-decoration: none; }
.cabecera { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); padding: 20px 48px 18px; flex-wrap: wrap; }
.titulos { display: flex; flex-direction: column; gap: 6px; }
.cabecera h1 { margin: 0; }
.subtitulo { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }

.sello { display: inline-flex; flex-direction: column; align-items: center; padding: 6px 14px; border: 3px double var(--color-sello); border-radius: var(--radio-md); color: var(--color-sello); transform: rotate(-3deg); }
.sello-titulo { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.sello-fecha { font-size: 12px; font-weight: 700; }

.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 28px 48px 40px; padding: 36px 24px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); text-align: center; color: var(--color-texto-secundario); }
.estado p { margin: 0; }
.estado-titulo { font-size: 17px; font-weight: 700; color: var(--color-texto); }

.contenido { flex-grow: 1; padding: 28px 48px 40px; display: grid; grid-template-columns: minmax(0, 1fr) 500px; align-items: start; gap: var(--espacio-2xl); border-top: 2px dotted var(--color-perforacion); }
.columna-vista-previa { display: flex; flex-direction: column; gap: var(--espacio-lg); min-width: 0; }
.botones { display: flex; flex-direction: column; gap: var(--espacio-sm); }
.boton-pdf { justify-content: center; gap: 8px; height: 44px; font-size: 15px; font-weight: 700; }
.aviso-bloqueo { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13px; font-weight: 600; color: var(--color-alerta); }

@media (max-width: 1023px) {
  .cabecera-simple, .cabecera, .contenido { padding-inline: 24px; }
  .contenido { grid-template-columns: 1fr; }
}
</style>
