<script setup>
import { reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Textarea from 'primevue/textarea'
import { usePacientesStore } from '@/stores/pacientes.js'
import { validarPaciente } from '@/utils/validaciones.js'
import { GRUPOS_SANGUINEOS, SEXOS } from '@/utils/formato.js'
import DialogoFormulario from '@/components/comunes/DialogoFormulario.vue'
import CampoError from '@/components/comunes/CampoError.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'
import AlergiasField from '@/components/pacientes/AlergiasField.vue'

// Alta (paciente = null) o edición de un paciente.
const props = defineProps({
  visible: { type: Boolean, required: true },
  paciente: { type: Object, default: null }
})

const emit = defineEmits(['update:visible'])

const pacientes = usePacientesStore()
const toast = useToast()

const dialogo = ref(null)
const errores = ref({})
const formulario = reactive(vacio())

function vacio() {
  return {
    dni: '', nombres: '', apellidos: '', fechaNacimiento: '', sexo: '', telefono: '',
    email: '', direccion: '', grupoSanguineo: '', alergias: [], antecedentes: ''
  }
}

// Cada vez que se abre, el formulario parte del paciente a editar (o vacío).
watch(() => props.visible, (abierto) => {
  if (!abierto) return
  const datos = vacio()
  for (const clave of Object.keys(datos)) datos[clave] = props.paciente?.[clave] ?? datos[clave]
  datos.alergias = [...datos.alergias]
  Object.assign(formulario, datos)
  errores.value = {}
  pacientes.error = null
})

function guardar() {
  errores.value = validarPaciente(formulario)
  if (!Object.keys(errores.value).length) {
    const guardado = props.paciente
      ? pacientes.actualizar(props.paciente.id, formulario)
      : pacientes.crear(formulario)
    if (guardado) {
      emit('update:visible', false)
      toast.add({ severity: 'success', summary: 'Paciente guardado.', life: 4000 })
      return
    }
    // El único error de negocio del formulario es el DNI repetido: va bajo el campo.
    errores.value = { dni: pacientes.error }
    pacientes.error = null
  }
  dialogo.value.enfocarPrimerError()
}
</script>

<template>
  <DialogoFormulario
    ref="dialogo"
    :visible="visible"
    :titulo="paciente ? 'Editar paciente' : 'Nuevo paciente'"
    etiqueta-guardar="Guardar paciente"
    :error="pacientes.error"
    @update:visible="emit('update:visible', $event)"
    @guardar="guardar"
  >
    <CampoTexto
      id="paciente-dni"
      v-model="formulario.dni"
      etiqueta="DNI"
      dato
      :error="errores.dni"
    />
    <CampoTexto
      id="paciente-nacimiento"
      v-model="formulario.fechaNacimiento"
      etiqueta="Fecha de nacimiento"
      type="date"
      :error="errores.fechaNacimiento"
    />
    <CampoTexto
      id="paciente-nombres"
      v-model="formulario.nombres"
      etiqueta="Nombres"
      :error="errores.nombres"
    />
    <CampoTexto
      id="paciente-apellidos"
      v-model="formulario.apellidos"
      etiqueta="Apellidos"
      :error="errores.apellidos"
    />

    <fieldset :class="['campo', 'sexo', { 'campo-con-error': errores.sexo }]">
      <legend>Sexo</legend>
      <div class="opciones">
        <label
          v-for="opcion in SEXOS"
          :key="opcion.valor"
          :class="['opcion', { 'opcion-activa': formulario.sexo === opcion.valor }]"
        >
          <input
            v-model="formulario.sexo"
            type="radio"
            name="sexo"
            :value="opcion.valor"
            :aria-invalid="errores.sexo ? 'true' : undefined"
            :aria-describedby="errores.sexo ? 'paciente-sexo-error' : undefined"
          >{{ opcion.etiqueta }}
        </label>
      </div>
      <CampoError
        id="paciente-sexo-error"
        :mensaje="errores.sexo"
      />
    </fieldset>
    <div class="campo">
      <label for="paciente-grupo">Grupo sanguíneo<span class="opcional"> (opcional)</span></label>
      <select
        id="paciente-grupo"
        v-model="formulario.grupoSanguineo"
      >
        <option value="">
          Sin especificar
        </option>
        <option
          v-for="grupo in GRUPOS_SANGUINEOS"
          :key="grupo"
          :value="grupo"
        >
          {{ grupo }}
        </option>
      </select>
    </div>

    <CampoTexto
      id="paciente-telefono"
      v-model="formulario.telefono"
      etiqueta="Teléfono"
      type="tel"
      dato
      opcional
    />
    <CampoTexto
      id="paciente-email"
      v-model="formulario.email"
      etiqueta="Correo"
      type="email"
      opcional
      :error="errores.email"
    />
    <CampoTexto
      id="paciente-direccion"
      v-model="formulario.direccion"
      class="columna-completa"
      etiqueta="Dirección"
      opcional
    />

    <AlergiasField
      v-model="formulario.alergias"
      class="columna-completa"
    />
    <div class="campo columna-completa">
      <label for="paciente-antecedentes">Antecedentes<span class="opcional"> (opcional)</span></label>
      <Textarea
        id="paciente-antecedentes"
        v-model="formulario.antecedentes"
        class="p-inputtext antecedentes"
        rows="2"
        placeholder="Enfermedades previas, cirugías, medicación habitual"
      />
    </div>
  </DialogoFormulario>
</template>

<style scoped>
.sexo { margin: 0; padding: 0; border: none; }
.sexo legend { padding: 0; margin-bottom: var(--espacio-sm); font: 600 12px/1.3 var(--fuente-texto); letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario); }
.sexo.campo-con-error legend { color: var(--color-alerta); }
.opciones { display: flex; gap: var(--espacio-sm); }
.opcion { flex-grow: 1; display: flex; align-items: center; gap: var(--espacio-sm); height: 44px; padding: 0 12px; border: 1px solid var(--color-linea); border-radius: var(--radio-md); font-size: 15px; cursor: pointer; }
.opcion input { margin: 0; accent-color: var(--color-tinta); }
.opcion-activa { background: var(--color-tinta-suave); border: 1.5px solid var(--color-tinta); font-weight: 600; color: var(--color-tinta); }
.antecedentes { height: auto; padding: 10px 12px; line-height: 1.5; resize: vertical; }
</style>
