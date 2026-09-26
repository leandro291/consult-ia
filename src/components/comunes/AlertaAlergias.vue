<script setup>
import ChipAlergia from '@/components/comunes/ChipAlergia.vue'

// Aviso rojo con las alergias del paciente. No renderiza nada si no hay ninguna.
defineProps({
  alergias: { type: Array, default: () => [] }
})
</script>

<template>
  <div
    v-if="alergias.length"
    role="note"
    aria-label="Alergias del paciente"
    class="alerta-alergias"
  >
    <strong class="titulo">Alergias</strong>
    <ChipAlergia
      v-for="alergia in alergias"
      :key="alergia"
      :texto="alergia"
    />
  </div>
</template>

<style scoped>
.alerta-alergias { display: flex; flex-wrap: wrap; align-items: center; gap: var(--espacio-sm) var(--espacio-md); padding: 10px 14px; background: var(--color-alerta-suave); border: 2px solid var(--color-alerta); border-radius: var(--radio-md); }
.titulo { font-size: 14px; font-weight: 800; color: var(--color-alerta); }
</style>
