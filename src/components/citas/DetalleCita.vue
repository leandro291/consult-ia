<script setup>
import { computed, nextTick, ref } from 'vue'
import Popover from 'primevue/popover'
import IconoAlergia from '@/components/citas/IconoAlergia.vue'
import { ESTADOS_MOVIBLES_CITA, ETIQUETAS_ESTADO_CITA, formatearHorarioCita, nombreCompleto } from '@/utils/formato.js'

const props = defineProps({
  cita: { type: Object, default: null },
  // Paciente, médico y consultorio ya resueltos; null si no existen.
  paciente: { type: Object, default: null },
  medico: { type: Object, default: null },
  consultorio: { type: Object, default: null }
})

const popover = ref(null)
// Elemento de la cita al que se ancla el detalle; recibe el foco al cerrar.
const ancla = ref(null)

const titulo = computed(() => props.paciente ? nombreCompleto(props.paciente) : 'Paciente desconocido')
const aviso = computed(() => {
  const alergias = props.paciente?.alergias ?? []
  if (!alergias.length) return ''
  return `${props.paciente.sexo === 'F' ? 'Alérgica' : 'Alérgico'} a ${alergias.join(', ').toLowerCase()}`
})
const medicoTexto = computed(() => props.medico ? nombreCompleto(props.medico) : 'Médico desconocido')
const consultorioTexto = computed(() =>
  props.consultorio ? `${props.consultorio.nombre} · Piso ${props.consultorio.piso}` : 'Consultorio desconocido'
)
const movible = computed(() => ESTADOS_MOVIBLES_CITA.includes(props.cita?.estado))

// Si ya hay uno abierto se cierra primero, para que el nuevo se alinee con su cita.
async function abrir(elemento) {
  if (popover.value.visible) {
    popover.value.hide()
    await nextTick()
  }
  ancla.value = elemento
  popover.value.show({ currentTarget: elemento }, elemento)
}

function cerrar() {
  popover.value.hide()
  ancla.value?.focus()
}

defineExpose({ abrir })
</script>

<template>
  <Popover
    ref="popover"
    class="detalle-cita"
    aria-labelledby="detalle-cita-titulo"
  >
    <div
      v-if="cita"
      class="detalle-cuerpo"
    >
      <div class="detalle-cabecera">
        <h3 id="detalle-cita-titulo">
          {{ titulo }}
        </h3>
        <button
          type="button"
          class="detalle-cerrar"
          aria-label="Cerrar"
          autofocus
          @click="cerrar"
        >
          <svg
            class="icono"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div
        v-if="aviso"
        class="detalle-alergia"
      >
        <IconoAlergia
          :tamano="18"
          class="detalle-alergia-icono"
        />{{ aviso }}
      </div>
      <dl class="detalle-datos">
        <dt>Horario</dt>
        <dd class="detalle-dato">
          {{ formatearHorarioCita(cita) }}
        </dd>
        <dt>Médico</dt>
        <dd>{{ medicoTexto }}</dd>
        <dt>Consultorio</dt>
        <dd>{{ consultorioTexto }}</dd>
        <dt>Motivo</dt>
        <dd>{{ cita.motivo || 'Sin motivo' }}</dd>
        <dt>Estado</dt>
        <dd>
          <span :class="['detalle-estado', `estado-${cita.estado}`]">{{ ETIQUETAS_ESTADO_CITA[cita.estado] ?? cita.estado }}</span>
        </dd>
      </dl>
      <p
        v-if="movible"
        class="detalle-nota"
      >
        También puede arrastrarla a otro horario libre.
      </p>
    </div>
  </Popover>
</template>

<!-- Sin scoped: el Popover se dibuja fuera de este componente (en el body). -->
<style>
.detalle-cita { width: 312px; background: var(--color-papel); border: 1px solid var(--color-linea); border-radius: var(--radio-md); box-shadow: 0 16px 40px rgba(22, 25, 43, 0.22); font-family: var(--fuente-texto); color: var(--color-texto); }
.detalle-cita::before, .detalle-cita::after { display: none; }
.detalle-cita .p-popover-content { padding: 18px; }
.detalle-cuerpo { display: flex; flex-direction: column; gap: var(--espacio-md); }
.detalle-cabecera { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--espacio-sm); }
.detalle-cabecera h3 { margin: 0; font-size: 17px; font-weight: 800; }
.detalle-cerrar { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin: -6px -6px 0 0; padding: 0; background: none; border: 0; border-radius: var(--radio-md); color: var(--color-texto-secundario); cursor: pointer; }
.detalle-alergia { display: flex; align-items: center; gap: var(--espacio-sm); padding: 10px 12px; background: var(--color-alerta-suave); border: 2px solid var(--color-alerta); border-radius: var(--radio-md); color: var(--color-alerta); font-size: 14px; font-weight: 800; }
.detalle-alergia-icono { flex-shrink: 0; }
.detalle-datos { display: grid; grid-template-columns: 80px minmax(0, 1fr); gap: 6px 10px; margin: 0; font-size: 14px; }
.detalle-datos dt { color: var(--color-texto-secundario); }
.detalle-datos dd { margin: 0; }
.detalle-dato { font-family: var(--fuente-dato); font-size: 13px; font-weight: 700; white-space: nowrap; }
.detalle-estado { display: inline-block; padding: 3px 8px; border-radius: var(--radio-sm); font-size: 12px; font-weight: 700; }
.detalle-estado.estado-programada { background: var(--color-papel); border: 1.5px solid var(--color-tinta); color: var(--color-tinta); padding: 1.5px 6.5px; }
.detalle-estado.estado-confirmada { background: var(--color-tinta); color: var(--color-papel); }
.detalle-estado.estado-atendida { background: var(--color-sello-suave); border: 1px solid var(--color-sello); color: var(--color-sello-oscuro); padding: 2px 7px; }
.detalle-estado.estado-cancelada { background: var(--color-apagado); color: var(--color-texto-secundario); text-decoration: line-through; }
.detalle-estado.estado-no_asistio { background: var(--color-papel); border: 1.5px dashed var(--color-texto-secundario); color: var(--color-texto-secundario); padding: 1.5px 6.5px; }
.detalle-nota { margin: 0; font-size: 13px; color: var(--color-texto-secundario); }
</style>
