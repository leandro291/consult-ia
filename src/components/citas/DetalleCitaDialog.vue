<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ChipEstadoCita from '@/components/citas/ChipEstadoCita.vue'
import IconoAlergia from '@/components/citas/IconoAlergia.vue'
import { ESTADOS_MOVIBLES_CITA, formatearHorarioCita, nombreCompleto } from '@/utils/formato.js'

// Detalle de una cita en un diálogo, para la vista Semana de la agenda del médico
// (en la vista Día ya se ve todo el detalle en la propia franja de EventoCita.vue).
const props = defineProps({
  visible: { type: Boolean, required: true },
  cita: { type: Object, default: null },
  paciente: { type: Object, default: null },
  medico: { type: Object, default: null },
  consultorio: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'atender', 'ver-historia', 'generar-receta'])

const titulo = computed(() => props.paciente ? nombreCompleto(props.paciente) : 'Paciente desconocido')
const medicoTexto = computed(() => props.medico ? nombreCompleto(props.medico) : 'Médico desconocido')
const consultorioTexto = computed(() =>
  props.consultorio ? `${props.consultorio.nombre} · Piso ${props.consultorio.piso}` : 'Consultorio desconocido'
)
const aviso = computed(() => {
  const alergias = props.paciente?.alergias ?? []
  if (!alergias.length) return ''
  return `${props.paciente.sexo === 'F' ? 'Alérgica' : 'Alérgico'} a ${alergias.join(', ').toLowerCase()}`
})

// Mismo criterio que "atendible" en EventoCita.vue (RF2).
const atendible = computed(() => ESTADOS_MOVIBLES_CITA.includes(props.cita?.estado))
const atendida = computed(() => props.cita?.estado === 'atendida')

// El diálogo solo emite; CalendarioCitas.vue reemite y se cierra (RF6).
function elegir(evento, valor) {
  emit(evento, valor)
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :header="titulo"
    class="detalle-cita-dialogo"
    :style="{ width: '420px' }"
    :breakpoints="{ '720px': '95vw' }"
    :pt="{ mask: { style: 'background: var(--velo-dialogo)' } }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div
      v-if="cita"
      class="detalle-cuerpo"
    >
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
          <ChipEstadoCita :estado="cita.estado" />
        </dd>
      </dl>
      <p
        v-if="atendida && !cita.consultaId"
        class="detalle-consulta-faltante"
      >
        No se encontró la consulta de esta cita.
      </p>
    </div>
    <template #footer>
      <Button
        type="button"
        label="Ver historia clínica"
        text
        @click="elegir('ver-historia', cita.pacienteId)"
      />
      <Button
        v-if="atendible"
        type="button"
        label="Atender cita"
        @click="elegir('atender', cita.id)"
      />
      <Button
        v-if="atendida"
        type="button"
        label="Generar receta PDF"
        :disabled="!cita.consultaId"
        @click="elegir('generar-receta', cita.consultaId)"
      />
      <Button
        type="button"
        label="Cerrar"
        text
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<style>
/* Sin scoped: el diálogo se monta en el body. */
.detalle-cita-dialogo { border: none; border-radius: var(--radio-md); background: var(--color-papel); box-shadow: var(--sombra-dialogo); }
.detalle-cita-dialogo .p-dialog-title { font: 800 18px/1.3 var(--fuente-texto); }
.detalle-cuerpo { display: flex; flex-direction: column; gap: var(--espacio-md); }
.detalle-alergia { display: flex; align-items: center; gap: var(--espacio-sm); padding: 10px 12px; background: var(--color-alerta-suave); border: 2px solid var(--color-alerta); border-radius: var(--radio-md); color: var(--color-alerta); font-size: 14px; font-weight: 800; }
.detalle-alergia-icono { flex-shrink: 0; }
.detalle-datos { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 6px 10px; margin: 0; font-size: 14px; }
.detalle-datos dt { color: var(--color-texto-secundario); }
.detalle-datos dd { margin: 0; }
.detalle-dato { font-family: var(--fuente-dato); font-size: 13px; font-weight: 700; white-space: nowrap; }
.detalle-consulta-faltante { margin: 0; color: var(--color-texto-secundario); font-size: 13px; }
</style>
