<script setup>
import { computed, ref } from 'vue'
import { formatearFecha, nombreCompleto } from '@/utils/formato.js'

// Tarjeta de una consulta en la línea de tiempo de la Historia clínica (RF4 y RF5).
// Maqueta HistoriaClinica.dc.html, líneas 99-115 (expandida) y 142-152 (resumida).
const props = defineProps({
  consulta: { type: Object, required: true },
  medico: { type: Object, default: null },
  // Si arranca expandida, se muestra siempre así, sin botón "Ver detalle" (RF5).
  expandidaInicial: { type: Boolean, default: false }
})

const expandida = ref(props.expandidaInicial)

const medicoTexto = computed(() => props.medico
  ? `${nombreCompleto(props.medico)} · ${props.medico.especialidad}`
  : 'Médico desconocido')

const primerDiagnostico = computed(() => props.consulta.diagnosticos?.[0] ?? null)

const titulo = computed(() => primerDiagnostico.value?.descripcion || props.consulta.motivo)

// Línea de signos vitales: siempre las cinco, con "—" en los vacíos (RF4).
const signosVitales = computed(() => {
  const s = props.consulta.signosVitales ?? {}
  return [
    `PA ${s.presion || '—'}`,
    `FC ${s.frecuenciaCardiaca ? `${s.frecuenciaCardiaca} lpm` : '—'}`,
    `T ${s.temperatura ? `${s.temperatura} °C` : '—'}`,
    `Peso ${s.peso ? `${s.peso} kg` : '—'}`,
    `Talla ${s.talla ? `${s.talla} cm` : '—'}`
  ].join(' · ')
})

function alternar() {
  expandida.value = !expandida.value
}
</script>

<template>
  <article
    :aria-labelledby="`titulo-${consulta.id}`"
    class="tarjeta"
  >
    <template v-if="expandida">
      <div class="cabecera">
        <div class="titulos">
          <h3
            :id="`titulo-${consulta.id}`"
            class="titulo"
          >
            {{ titulo }}
          </h3>
          <p class="datos">
            <span class="tipo-dato">{{ formatearFecha(consulta.fecha) }}</span> · {{ medicoTexto }}
          </p>
        </div>
      </div>

      <p class="signos">
        {{ signosVitales }}
      </p>

      <dl class="detalle">
        <template v-if="consulta.motivo">
          <dt class="tipo-label">
            Motivo
          </dt>
          <dd>{{ consulta.motivo }}</dd>
        </template>
        <template v-if="consulta.examenFisico">
          <dt class="tipo-label">
            Examen
          </dt>
          <dd>{{ consulta.examenFisico }}</dd>
        </template>
        <template v-if="consulta.diagnosticos?.length">
          <dt class="tipo-label">
            Diagnóstico
          </dt>
          <dd>
            <template
              v-for="(d, i) in consulta.diagnosticos"
              :key="i"
            >
              <span
                v-if="d.codigo"
                class="tipo-dato"
              >{{ d.codigo }}</span>
              {{ d.descripcion }}
              <br v-if="i < consulta.diagnosticos.length - 1">
            </template>
          </dd>
        </template>
        <template v-if="consulta.plan">
          <dt class="tipo-label">
            Plan
          </dt>
          <dd>{{ consulta.plan }}</dd>
        </template>
      </dl>
    </template>

    <div
      v-else
      class="resumen"
    >
      <div class="titulos">
        <h3
          :id="`titulo-${consulta.id}`"
          class="titulo titulo-resumen"
        >
          {{ titulo }}
        </h3>
        <p class="datos">
          <span class="tipo-dato">{{ formatearFecha(consulta.fecha) }}</span> · {{ medicoTexto }}
          <template v-if="primerDiagnostico?.codigo">
            · <span class="tipo-dato">{{ primerDiagnostico.codigo }}</span>
          </template>
        </p>
      </div>
      <button
        type="button"
        class="ver-detalle"
        :aria-expanded="expandida"
        @click="alternar"
      >
        Ver detalle
        <svg
          class="icono"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.tarjeta { background: var(--color-papel); border-top: 8px solid var(--color-copia-amarilla); border-radius: 0 0 var(--radio-sm) var(--radio-sm); box-shadow: var(--sombra-hoja); padding: var(--espacio-lg) var(--espacio-xl) var(--espacio-xl); display: flex; flex-direction: column; gap: var(--espacio-lg); }
.titulos { display: flex; flex-direction: column; gap: var(--espacio-xs); }
.titulo { margin: 0; font-size: 20px; font-weight: 700; }
.datos { margin: 0; font-size: 14px; color: var(--color-texto-secundario); }
.signos { margin: 0; font-family: var(--fuente-dato); font-size: 14px; padding: 10px 14px; background: var(--color-campo); border-radius: var(--radio-sm); }
.detalle { margin: 0; display: grid; grid-template-columns: 128px minmax(0, 1fr); gap: var(--espacio-sm) var(--espacio-lg); font-size: 16px; line-height: 1.6; max-width: 72ch; }
.detalle dt { padding-top: 4px; color: var(--color-texto-secundario); }
.detalle dd { margin: 0; }

.resumen { display: flex; align-items: center; gap: var(--espacio-lg); }
.titulo-resumen { font-size: 18px; }
.ver-detalle { flex-shrink: 0; margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 var(--espacio-md); background: none; color: var(--color-tinta); border: none; border-radius: var(--radio-md); font-size: 14px; font-weight: 700; cursor: pointer; }
</style>
