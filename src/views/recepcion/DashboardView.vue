<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { useCitasStore } from '@/stores/citas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { formatearFecha, nombreCompleto, nombreDia } from '@/utils/formato.js'
import PaginaListado from '@/components/comunes/PaginaListado.vue'
import ChipAlergia from '@/components/comunes/ChipAlergia.vue'
import ChipEstadoCita from '@/components/citas/ChipEstadoCita.vue'
import FiltroEstadosCita from '@/components/citas/FiltroEstadosCita.vue'
import CitaForm from '@/components/citas/CitaForm.vue'
import ResumenSemana from '@/components/citas/ResumenSemana.vue'

const citas = useCitasStore()
const medicos = useMedicosStore()
const pacientes = usePacientesStore()
const consultorios = useConsultoriosStore()
const toast = useToast()

const hoy = new Date()
const fechaHoy = dayjs(hoy).format('YYYY-MM-DD')
const filtroActivo = ref('todas')
const formularioVisible = ref(false)

onMounted(() => {
  citas.cargar()
  medicos.cargar()
  pacientes.cargar()
  consultorios.cargar()
})

const citasHoy = computed(() =>
  citas.lista.filter((c) => c.fecha === fechaHoy).slice().sort((a, b) => a.hora.localeCompare(b.hora))
)

// "Programadas" suma programada y confirmada (RF3); las demás pestañas son un estado a uno.
const conteos = computed(() => {
  const c = { todas: citasHoy.value.length, programada: 0, atendida: 0, cancelada: 0, no_asistio: 0 }
  for (const cita of citasHoy.value) {
    if (cita.estado === 'programada' || cita.estado === 'confirmada') c.programada++
    else c[cita.estado]++
  }
  return c
})

const opciones = computed(() => [
  { valor: 'todas', etiqueta: 'Todas', numero: conteos.value.todas },
  { valor: 'programada', etiqueta: 'Programadas', numero: conteos.value.programada },
  { valor: 'atendida', etiqueta: 'Atendidas', numero: conteos.value.atendida },
  { valor: 'cancelada', etiqueta: 'Canceladas', numero: conteos.value.cancelada },
  { valor: 'no_asistio', etiqueta: 'No asistió', numero: conteos.value.no_asistio }
])

const citasFiltradas = computed(() => {
  if (filtroActivo.value === 'todas') return citasHoy.value
  if (filtroActivo.value === 'programada') {
    return citasHoy.value.filter((c) => c.estado === 'programada' || c.estado === 'confirmada')
  }
  return citasHoy.value.filter((c) => c.estado === filtroActivo.value)
})

function paciente(cita) {
  return pacientes.lista.find((p) => p.id === cita.pacienteId)
}
function medico(cita) {
  return medicos.lista.find((m) => m.id === cita.medicoId)
}
function consultorio(cita) {
  return consultorios.lista.find((c) => c.id === cita.consultorioId)
}

function abrirNuevaCita() {
  formularioVisible.value = true
}

function citaCreada() {
  toast.add({ severity: 'success', summary: 'Cita creada.', life: 4000 })
}
</script>

<template>
  <PaginaListado
    titulo="Panel del día"
    :subtitulo="`${nombreDia(hoy)}, ${formatearFecha(hoy)}`"
    etiqueta="Citas del día por estado"
    :valores="citasFiltradas"
    etiqueta-nuevo="Nueva cita"
    titulo-vacio="No hay citas para hoy"
    texto-vacio="Cree una cita para verla en este panel."
    @nuevo="abrirNuevaCita"
  >
    <template #herramientas>
      <FiltroEstadosCita
        v-model="filtroActivo"
        :opciones="opciones"
      />
    </template>

    <Column header="Hora">
      <template #body="{ data }">
        <span class="tipo-dato">{{ data.hora }}</span>
      </template>
    </Column>
    <Column header="Paciente">
      <template #body="{ data }">
        <strong>{{ nombreCompleto(paciente(data) ?? { nombres: 'Paciente', apellidos: 'desconocido' }) }}</strong>
        <ChipAlergia
          v-for="alergia in paciente(data)?.alergias ?? []"
          :key="alergia"
          :texto="alergia"
          class="chip-fila"
        />
      </template>
    </Column>
    <Column header="Médico">
      <template #body="{ data }">
        {{ medico(data) ? nombreCompleto(medico(data)) : 'Médico desconocido' }}
        <br>
        <span class="secundario">{{ medico(data)?.especialidad }}</span>
      </template>
    </Column>
    <Column header="Consultorio">
      <template #body="{ data }">
        <span class="secundario">
          {{ consultorio(data) ? `${consultorio(data).nombre} · Piso ${consultorio(data).piso}` : 'Consultorio desconocido' }}
        </span>
      </template>
    </Column>
    <Column header="Estado">
      <template #body="{ data }">
        <ChipEstadoCita :estado="data.estado" />
      </template>
    </Column>

    <template #pie>
      <div class="pie-tabla">
        <span class="secundario">Mostrando {{ citasFiltradas.length }} de {{ citasHoy.length }} citas</span>
        <RouterLink to="/recepcion/agenda">
          Ver agenda completa
        </RouterLink>
      </div>
    </template>
  </PaginaListado>

  <ResumenSemana
    :citas="citas.lista"
    :medicos="medicos.lista"
  />

  <CitaForm
    v-model:visible="formularioVisible"
    :valores-iniciales="{ fecha: fechaHoy }"
    @creada="citaCreada"
  />
</template>

<style scoped>
.secundario { color: var(--color-texto-secundario); }
.chip-fila { margin-left: 6px; }
.pie-tabla { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-top: 4px; border-top: 2px dotted var(--color-perforacion); font-size: 14px; }
.pie-tabla a { font-weight: 600; }
</style>
