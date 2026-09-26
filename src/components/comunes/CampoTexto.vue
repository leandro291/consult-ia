<script setup>
import InputText from 'primevue/inputtext'
import CampoError from '@/components/comunes/CampoError.vue'

// Campo de formulario: etiqueta + InputText + mensaje de error accesible.
// El id del error es `<id>-error`.
defineProps({
  id: { type: String, required: true },
  etiqueta: { type: String, required: true },
  error: { type: String, default: '' },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  opcional: { type: Boolean, default: false },
  dato: { type: Boolean, default: false } // valor corto: aplica la clase campo-dato
})

const modelo = defineModel({ type: String, default: '' })
</script>

<template>
  <div :class="['campo', { 'campo-con-error': error }]">
    <label :for="id">
      {{ etiqueta }}<span
        v-if="opcional"
        class="opcional"
      > (opcional)</span>
    </label>
    <InputText
      :id="id"
      v-model="modelo"
      :type="type"
      :autocomplete="autocomplete"
      :class="{ 'campo-dato': dato }"
      :invalid="!!error"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
    />
    <CampoError
      :id="`${id}-error`"
      :mensaje="error"
    />
  </div>
</template>
