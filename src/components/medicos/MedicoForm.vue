<script setup>
import { reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useMedicosStore } from '@/stores/medicos.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { validarMedico } from '@/utils/validaciones.js'
import DialogoFormulario from '@/components/comunes/DialogoFormulario.vue'
import CampoError from '@/components/comunes/CampoError.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'
import HorarioFields from '@/components/medicos/HorarioFields.vue'

// Alta (medico = null) o edición de un médico, con su horario.
// En el alta también pide correo y contraseña del usuario de acceso.
const props = defineProps({
  visible: { type: Boolean, required: true },
  medico: { type: Object, default: null }
})

const emit = defineEmits(['update:visible'])

const medicos = useMedicosStore()
const consultorios = useConsultoriosStore()
const toast = useToast()

const dialogo = ref(null)
const errores = ref({})
const formulario = reactive(vacio())

function vacio() {
  return {
    nombres: '', apellidos: '', especialidad: '', colegiatura: '', telefono: '',
    consultorioId: '', email: '', password: '',
    horario: { dias: [1, 2, 3, 4, 5], inicio: '08:00', fin: '22:00' }
  }
}

// Cada vez que se abre, el formulario parte del médico a editar (o vacío).
watch(() => props.visible, (abierto) => {
  if (!abierto) return
  const { horario, ...resto } = props.medico ?? {}
  Object.assign(formulario, vacio(), resto)
  if (horario) formulario.horario = { ...horario, dias: [...horario.dias] }
  errores.value = {}
  medicos.error = null
})

function guardar() {
  errores.value = validarMedico(formulario, { alta: !props.medico })
  if (Object.keys(errores.value).length) {
    dialogo.value.enfocarPrimerError()
    return
  }
  const guardado = props.medico
    ? medicos.actualizar(props.medico.id, formulario)
    : medicos.crear(formulario)
  if (!guardado) return
  emit('update:visible', false)
  toast.add({ severity: 'success', summary: 'Médico guardado.', life: 4000 })
}
</script>

<template>
  <DialogoFormulario
    ref="dialogo"
    :visible="visible"
    :titulo="medico ? 'Editar médico' : 'Nuevo médico'"
    etiqueta-guardar="Guardar médico"
    :error="medicos.error"
    @update:visible="emit('update:visible', $event)"
    @guardar="guardar"
  >
    <CampoTexto
      id="medico-nombres"
      v-model="formulario.nombres"
      etiqueta="Nombres"
      :error="errores.nombres"
    />
    <CampoTexto
      id="medico-apellidos"
      v-model="formulario.apellidos"
      etiqueta="Apellidos"
      :error="errores.apellidos"
    />
    <CampoTexto
      id="medico-especialidad"
      v-model="formulario.especialidad"
      etiqueta="Especialidad"
      :error="errores.especialidad"
    />
    <CampoTexto
      id="medico-colegiatura"
      v-model="formulario.colegiatura"
      etiqueta="Colegiatura"
      dato
      :error="errores.colegiatura"
    />
    <CampoTexto
      id="medico-telefono"
      v-model="formulario.telefono"
      etiqueta="Teléfono"
      type="tel"
      dato
      opcional
    />
    <div :class="['campo', { 'campo-con-error': errores.consultorioId }]">
      <label for="medico-consultorio">Consultorio</label>
      <select
        id="medico-consultorio"
        v-model="formulario.consultorioId"
        :aria-invalid="errores.consultorioId ? 'true' : undefined"
        :aria-describedby="errores.consultorioId ? 'medico-consultorioId-error' : undefined"
      >
        <option
          value=""
          disabled
        >
          Seleccione un consultorio
        </option>
        <option
          v-for="c in consultorios.lista"
          :key="c.id"
          :value="c.id"
        >
          {{ c.nombre }}{{ c.piso ? ` · Piso ${c.piso}` : '' }}
        </option>
      </select>
      <CampoError
        id="medico-consultorioId-error"
        :mensaje="errores.consultorioId"
      />
    </div>

    <HorarioFields
      v-model="formulario.horario"
      :errores="errores"
    />

    <template v-if="!medico">
      <CampoTexto
        id="medico-email"
        v-model="formulario.email"
        etiqueta="Correo de acceso"
        type="email"
        autocomplete="off"
        :error="errores.email"
      />
      <CampoTexto
        id="medico-password"
        v-model="formulario.password"
        etiqueta="Contraseña"
        type="password"
        autocomplete="new-password"
        :error="errores.password"
      />
    </template>
  </DialogoFormulario>
</template>
