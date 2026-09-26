<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import { nombreCompleto } from '@/utils/formato.js'

// Filtro de médico: v-model con el id elegido o null para "Todos los médicos".
const props = defineProps({
  medicos: { type: Array, required: true }
})
const medicoId = defineModel({ type: String, default: null })

const opciones = computed(() => [
  { id: null, etiqueta: 'Todos los médicos' },
  ...props.medicos.map((m) => ({ id: m.id, etiqueta: `${nombreCompleto(m)} · ${m.especialidad}` }))
])
</script>

<template>
  <div class="filtro">
    <span
      id="filtro-medico-etiqueta"
      class="tipo-label etiqueta"
    >Médico</span>
    <Select
      v-model="medicoId"
      :options="opciones"
      option-label="etiqueta"
      option-value="id"
      aria-labelledby="filtro-medico-etiqueta"
      class="filtro-medico"
    />
  </div>
</template>

<style scoped>
.filtro { display: flex; align-items: center; gap: var(--espacio-md); }
.etiqueta { color: var(--color-texto-secundario); }
.filtro-medico { min-width: 260px; height: 40px; font-size: 14px; font-weight: 600; background: var(--color-campo); border: none; border-bottom: 1.5px solid var(--color-texto); border-radius: var(--radio-sm) var(--radio-sm) 0 0; }
.filtro-medico :deep(.p-select-label) { display: flex; align-items: center; padding: 0 10px; font-weight: 600; }
</style>
