<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { useCitasStore } from '@/stores/citas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { validarCita } from '@/utils/validaciones.js'
import { nombreCompleto } from '@/utils/formato.js'
import DialogoFormulario from '@/components/comunes/DialogoFormulario.vue'
import CampoError from '@/components/comunes/CampoError.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'
import AlertaAlergias from '@/components/comunes/AlertaAlergias.vue'

// Alta de cita desde la agenda de recepción (patrón de MedicoForm.vue sobre DialogoFormulario).
const props = defineProps({
  visible: { type: Boolean, required: true },
  // Médico, fecha y hora con las que abre el diálogo (filtro de médico u hueco elegido en el calendario).
  valoresIniciales: { type: Object, default: () => ({}) }
})

// La vista se encarga del Toast de éxito y de llevar el calendario a esa fecha al recibir "creada".
const emit = defineEmits(['update:visible', 'creada'])

const citas = useCitasStore()
const medicos = useMedicosStore()
const pacientes = usePacientesStore()

const dialogo = ref(null)
const errores = ref({})
const formulario = reactive(vacio())
const pacienteElegido = ref(null)
const sugerencias = ref([])

function vacio() {
  return { pacienteId: '', medicoId: '', fecha: '', hora: '', motivo: '' }
}

// Cada vez que se abre, el formulario parte de los valores iniciales (o vacío).
watch(() => props.visible, (abierto) => {
  if (!abierto) return
  Object.assign(formulario, vacio(), props.valoresIniciales)
  pacienteElegido.value = null
  errores.value = {}
  citas.error = null
})

// El paciente elegido fija el id del formulario; al borrarlo sin elegir, queda sin paciente.
watch(pacienteElegido, (paciente) => {
  formulario.pacienteId = paciente?.id ?? ''
})

const alergias = computed(() => pacienteElegido.value?.alergias ?? [])

function etiquetaPaciente(paciente) {
  return `${nombreCompleto(paciente)} · DNI ${paciente.dni}`
}

function buscarPacientes({ query }) {
  const texto = query.trim().toLowerCase()
  sugerencias.value = !texto
    ? pacientes.lista
    : pacientes.lista.filter((p) => p.dni.includes(texto) || nombreCompleto(p).toLowerCase().includes(texto))
}

function guardar() {
  errores.value = validarCita(formulario)
  if (Object.keys(errores.value).length) {
    dialogo.value.enfocarPrimerError()
    return
  }
  const creada = citas.crear(formulario)
  if (!creada) return
  emit('update:visible', false)
  emit('creada', { fecha: formulario.fecha })
}
</script>

<template>
  <DialogoFormulario
    ref="dialogo"
    :visible="visible"
    titulo="Nueva cita"
    etiqueta-guardar="Guardar cita"
    :error="citas.error"
    @update:visible="emit('update:visible', $event)"
    @guardar="guardar"
  >
    <div :class="['campo', 'columna-completa', { 'campo-con-error': errores.pacienteId }]">
      <label for="cita-paciente">Paciente</label>
      <AutoComplete
        v-model="pacienteElegido"
        input-id="cita-paciente"
        :suggestions="sugerencias"
        :option-label="etiquetaPaciente"
        data-key="id"
        dropdown
        placeholder="Buscar por DNI o nombre"
        :invalid="!!errores.pacienteId"
        :aria-describedby="errores.pacienteId ? 'cita-paciente-error' : undefined"
        fluid
        @complete="buscarPacientes"
      />
      <CampoError
        id="cita-paciente-error"
        :mensaje="errores.pacienteId"
      />
    </div>

    <AlertaAlergias
      class="columna-completa"
      :alergias="alergias"
    />

    <div :class="['campo', 'columna-completa', { 'campo-con-error': errores.medicoId }]">
      <label for="cita-medico">Médico</label>
      <select
        id="cita-medico"
        v-model="formulario.medicoId"
        :aria-invalid="errores.medicoId ? 'true' : undefined"
        :aria-describedby="errores.medicoId ? 'cita-medico-error' : undefined"
      >
        <option
          value=""
          disabled
        >
          Seleccione un médico
        </option>
        <option
          v-for="m in medicos.lista"
          :key="m.id"
          :value="m.id"
        >
          {{ nombreCompleto(m) }} · {{ m.especialidad }}
        </option>
      </select>
      <CampoError
        id="cita-medico-error"
        :mensaje="errores.medicoId"
      />
    </div>

    <CampoTexto
      id="cita-fecha"
      v-model="formulario.fecha"
      etiqueta="Fecha"
      type="date"
      dato
      :error="errores.fecha"
    />
    <CampoTexto
      id="cita-hora"
      v-model="formulario.hora"
      etiqueta="Hora"
      type="time"
      dato
      :error="errores.hora"
    />

    <CampoTexto
      id="cita-motivo"
      v-model="formulario.motivo"
      etiqueta="Motivo"
      opcional
      class="columna-completa"
    />
  </DialogoFormulario>
</template>

<style scoped>
/* El AutoComplete de PrimeVue no hereda el alto de los demás campos ni centra el botón
   del desplegable dentro de él: se iguala al resto de los inputs de este diálogo. */
.campo :deep(.p-autocomplete) {
  width: 100%;
}

.campo :deep(.p-autocomplete-dropdown) {
  height: 44px;
  background: var(--color-campo);
  border: none;
  border-bottom: 1.5px solid var(--color-texto);
  border-radius: 0;
}

/* El input del AutoComplete de Paciente siempre tiene botón dropdown pegado a su derecha:
   se aplana solo esa esquina para que encaje con el botón cuadrado, sin tocar las demás. */
.campo :deep(.p-autocomplete-input) {
  border-top-right-radius: 0;
}
</style>
