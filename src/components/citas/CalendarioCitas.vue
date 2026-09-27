<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { ESTADOS_MOVIBLES_CITA, ETIQUETAS_ESTADO_CITA, formatearRango, nombreCompleto } from '@/utils/formato.js'
import BarraCalendario from '@/components/citas/BarraCalendario.vue'
import DetalleCita from '@/components/citas/DetalleCita.vue'
import EventoCita from '@/components/citas/EventoCita.vue'
import FiltroMedico from '@/components/citas/FiltroMedico.vue'
import IconoAlergia from '@/components/citas/IconoAlergia.vue'
import LeyendaCitas from '@/components/citas/LeyendaCitas.vue'

const props = defineProps({
  // Citas ya filtradas por el padre.
  citas: { type: Array, required: true },
  pacientes: { type: Array, required: true },
  medicos: { type: Array, required: true },
  consultorios: { type: Array, required: true },
  // Agenda del médico: sin filtro de médico, sin arrastrar ni crear citas; abre en la vista Día.
  soloLectura: { type: Boolean, default: false }
})

// Médico elegido en el filtro (null = todos).
const medicoId = defineModel('medicoId', { type: String, default: null })

// Al soltar una cita se emite { id, fecha, hora, revertir }; el padre decide si revierte.
// nueva-cita: { fecha, hora } del hueco elegido (hora null si la vista no tiene horas). cancelar: la cita del detalle.
// atender y ver-historia: solo en modo de solo lectura.
const emit = defineEmits(['reprogramar', 'nueva-cita', 'cancelar', 'atender', 'ver-historia', 'generar-receta'])

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const calendario = ref(null)
const vista = ref(props.soloLectura ? 'timeGridDay' : 'timeGridWeek')
const titulo = ref('')
const detalle = ref(null)
const citaAbierta = ref(null)

const pacienteAbierto = computed(() => props.pacientes.find((p) => p.id === citaAbierta.value?.pacienteId) ?? null)
const medicoAbierto = computed(() => props.medicos.find((m) => m.id === citaAbierta.value?.medicoId) ?? null)
const consultorioAbierto = computed(() => props.consultorios.find((c) => c.id === citaAbierta.value?.consultorioId) ?? null)

const eventos = computed(() => props.citas.map((cita) => {
  const paciente = props.pacientes.find((p) => p.id === cita.pacienteId)
  const medico = props.medicos.find((m) => m.id === cita.medicoId)
  const inicio = dayjs(`${cita.fecha}T${cita.hora}`)
  return {
    id: cita.id,
    start: inicio.format('YYYY-MM-DDTHH:mm:ss'),
    end: inicio.add(cita.duracionMin, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
    startEditable: ESTADOS_MOVIBLES_CITA.includes(cita.estado),
    classNames: [`evento-${cita.estado}`],
    extendedProps: {
      hora: cita.hora,
      paciente: paciente ? nombreCompleto(paciente) : 'Paciente desconocido',
      pacienteId: cita.pacienteId,
      medico: medico ? nombreCompleto(medico) : 'Médico desconocido',
      motivo: cita.motivo,
      estado: (ETIQUETAS_ESTADO_CITA[cita.estado] ?? cita.estado).toLowerCase(),
      estadoCodigo: cita.estado,
      atendible: ESTADOS_MOVIBLES_CITA.includes(cita.estado),
      alergico: Boolean(paciente?.alergias?.length),
      // Id de la consulta ya registrada, si la hay (resuelto por el padre, RF1 de spec 014).
      consultaId: cita.consultaId ?? null
    }
  }
}))

// Título de la barra propia: semana lunes-sábado o un solo día.
function actualizarRango({ start, view }) {
  vista.value = view.type
  titulo.value = view.type === 'timeGridDay'
    ? formatearRango(start, start)
    : formatearRango(start, dayjs(start).add(5, 'day'))
}

const api = () => calendario.value.getApi()

const opciones = computed(() => ({
  plugins: [timeGridPlugin, interactionPlugin],
  locale: esLocale,
  initialView: props.soloLectura ? 'timeGridDay' : 'timeGridWeek',
  headerToolbar: false,
  allDaySlot: false,
  hiddenDays: [0],
  slotMinTime: '08:00:00',
  slotMaxTime: '14:00:00',
  slotDuration: '00:30:00',
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  height: 'auto',
  nowIndicator: true,
  editable: !props.soloLectura,
  eventDurationEditable: false,
  events: eventos.value,
  datesSet: actualizarRango,
  // FullCalendar no dispara eventClick al soltar un arrastre; con Enter sobre la cita sí.
  // En modo de solo lectura no hay detalle: la cita ya muestra motivo, estado y "Atender".
  eventClick: ({ event, el }) => {
    if (props.soloLectura) return
    citaAbierta.value = props.citas.find((c) => c.id === event.id) ?? null
    if (citaAbierta.value) detalle.value.abrir(el)
  },
  eventDrop: ({ event, revert }) => emit('reprogramar', {
    id: event.id,
    fecha: dayjs(event.start).format('YYYY-MM-DD'),
    hora: dayjs(event.start).format('HH:mm'),
    revertir: revert
  }),
  // Clic en un hueco libre del calendario (los eventos capturan su propio clic, así que este solo llega en huecos vacíos).
  dateClick: ({ date, view }) => {
    if (props.soloLectura) return
    emit('nueva-cita', {
      fecha: dayjs(date).format('YYYY-MM-DD'),
      hora: view.type.startsWith('timeGrid') ? dayjs(date).format('HH:mm') : null
    })
  }
}))

// El detalle solo emite; el calendario cierra el popover y reemite la cancelación hacia la vista.
function cancelarDesdeDetalle(cita) {
  detalle.value.cerrar()
  emit('cancelar', cita)
}

function etiquetaEvento({ hora, paciente, estado, medico, alergico }) {
  return `${hora} ${paciente}, ${estado}, ${medico}${alergico ? ', alérgico' : ''}`
}

// El padre la llama tras crear una cita: sin esto, una cita fuera de la semana visible
// se guarda bien pero no se ve hasta que alguien navegue hasta su fecha a mano.
function irAFecha(fecha) {
  api().gotoDate(fecha)
}

defineExpose({ irAFecha })
</script>

<template>
  <div class="calendario">
    <BarraCalendario
      :titulo="titulo"
      :vista="vista"
      @hoy="api().today()"
      @anterior="api().prev()"
      @siguiente="api().next()"
      @cambiar-vista="(v) => api().changeView(v)"
    >
      <FiltroMedico
        v-if="!soloLectura"
        v-model="medicoId"
        :medicos="medicos"
      />
    </BarraCalendario>

    <FullCalendar
      ref="calendario"
      :options="opciones"
    >
      <template #dayHeaderContent="{ date, isToday }">
        <span :class="['dia', { hoy: isToday }]">
          {{ DIAS_CORTOS[date.getDay()] }}
          <span class="dia-numero">{{ date.getDate() }}</span>
          <template v-if="isToday">Hoy</template>
        </span>
      </template>
      <template #eventContent="{ event }">
        <EventoCita
          v-if="soloLectura"
          :id="event.id"
          :hora="event.extendedProps.hora"
          :paciente="event.extendedProps.paciente"
          :paciente-id="event.extendedProps.pacienteId"
          :motivo="event.extendedProps.motivo"
          :estado-codigo="event.extendedProps.estadoCodigo"
          :alergico="event.extendedProps.alergico"
          :atendible="event.extendedProps.atendible"
          :consulta-id="event.extendedProps.consultaId"
          :mostrar-detalle="vista === 'timeGridDay'"
          @atender="(id) => emit('atender', id)"
          @ver-historia="(pacienteId) => emit('ver-historia', pacienteId)"
          @generar-receta="(consultaId) => emit('generar-receta', consultaId)"
        />
        <div
          v-else
          class="evento"
          role="group"
          :aria-label="etiquetaEvento(event.extendedProps)"
          :title="event.extendedProps.medico"
        >
          <IconoAlergia
            v-if="event.extendedProps.alergico"
            :tamano="13"
            class="evento-alergia"
          />
          <span>
            <span class="evento-hora">{{ event.extendedProps.hora }}</span>
            {{ event.extendedProps.paciente }}
          </span>
        </div>
      </template>
    </FullCalendar>

    <DetalleCita
      ref="detalle"
      :cita="citaAbierta"
      :paciente="pacienteAbierto"
      :medico="medicoAbierto"
      :consultorio="consultorioAbierto"
      @cancelar="cancelarDesdeDetalle"
    />

    <LeyendaCitas />
  </div>
</template>

<style scoped>
.calendario { font-family: var(--fuente-texto); color: var(--color-texto); }
.calendario :deep(.fc) {
  --fc-border-color: var(--color-renglon);
  --fc-today-bg-color: transparent;
  --fc-now-indicator-color: var(--color-tinta);
  --fc-page-bg-color: var(--color-papel);
}
.calendario :deep(.fc-scrollgrid) { border: 0; }
.calendario :deep(.fc-scrollgrid-section > td),
.calendario :deep(.fc-scrollgrid-section > th) { border: 0; }

/* Encabezado de días */
.calendario :deep(.fc-col-header-cell) { border-width: 0 0 1.5px 1px; border-color: var(--color-renglon) var(--color-renglon) var(--color-texto); text-align: left; font-weight: 600; }
.calendario :deep(.fc-col-header-cell-cushion) { display: block; padding: 0; }
.calendario :deep(.fc-timegrid-axis) { border-width: 0 0 1.5px; border-color: var(--color-texto); }
.dia { display: flex; align-items: center; gap: var(--espacio-xs); padding: 10px 10px 8px; font-size: 13px; font-weight: 600; color: var(--color-texto-secundario); }
.dia-numero { font-family: var(--fuente-dato); font-size: 15px; font-weight: 400; }
.dia.hoy { gap: var(--espacio-sm); padding: 8px 10px; background: var(--color-tinta-suave); color: var(--color-tinta); font-weight: 700; }
.dia.hoy .dia-numero { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--color-tinta); color: var(--color-papel); font-weight: 400; }

/* Grilla: 48 px por franja de 30 min, según la maqueta */
.calendario :deep(.fc-timegrid-slot) { height: 48px; }
.calendario :deep(.fc-timegrid-slot-lane) { border-top: 1px solid var(--color-renglon); }
.calendario :deep(.fc-timegrid-slot-lane.fc-timegrid-slot-minor) { border-top: 1px solid var(--color-apagado); }
.calendario :deep(.fc-timegrid-slot-label) { border-color: transparent var(--color-renglon) transparent transparent; vertical-align: top; }
.calendario :deep(.fc-timegrid-slot-label-cushion) { min-width: 64px; padding: 4px 10px 0 0; text-align: right; font-family: var(--fuente-dato); font-size: 12px; color: var(--color-texto-secundario); }
.calendario :deep(.fc-timegrid-col) { border-left: 1px solid var(--color-renglon); }
.calendario :deep(.fc-timegrid-col.fc-day-past) { background: var(--color-pasado); }
.calendario :deep(.fc-timegrid-col-events) { margin: 0; }

/* Indicador de "ahora": línea de 2 px y punto de 10 px */
.calendario :deep(.fc-timegrid-now-indicator-line) { border-top-width: 2px; }
.calendario :deep(.fc-timegrid-now-indicator-arrow) { left: auto; right: 0; width: 10px; height: 10px; border: 0; border-radius: 50%; background: var(--color-tinta); }

/* Citas: una línea compacta por estado */
.calendario :deep(.fc-timegrid-event) { margin: 3px 5px; border-radius: var(--radio-sm); box-shadow: none; overflow: hidden; }
.calendario :deep(.fc-timegrid-event .fc-event-main) { padding: 0; color: inherit; }
.calendario :deep(.fc-event-dragging) { opacity: 0.8; }
.evento { display: flex; align-items: flex-start; gap: var(--espacio-xs); padding: 4px 8px; overflow: hidden; font-size: 12px; line-height: 1.35; }
.evento-hora { font-family: var(--fuente-dato); font-weight: 700; }
.evento-alergia { flex-shrink: 0; margin-top: 1px; color: var(--color-alerta); }

.calendario :deep(.evento-programada) { background: var(--color-papel); border: 1.5px solid var(--color-tinta); color: var(--color-tinta); cursor: grab; }
.calendario :deep(.evento-confirmada) { background: var(--color-tinta); border: 0; color: var(--color-papel); cursor: grab; }
.calendario :deep(.evento-confirmada) .evento-alergia { color: var(--color-alerta-clara); }
.calendario :deep(.evento-atendida) { background: var(--color-sello-suave); border: 1px solid var(--color-sello); color: var(--color-sello-oscuro); }
.calendario :deep(.evento-cancelada) { background: var(--color-apagado); border: 0; color: var(--color-texto-secundario); text-decoration: line-through; }
.calendario :deep(.evento-no_asistio) { background: var(--color-papel); border: 1.5px dashed var(--color-texto-secundario); color: var(--color-texto-secundario); }
.calendario :deep(.evento-programada) .evento,
.calendario :deep(.evento-no_asistio) .evento { padding: 3px 7px; }
</style>
