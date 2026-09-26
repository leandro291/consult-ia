<script setup>
// Chip rojo de una alergia. Con `quitable` lleva un botón para quitarla (formularios);
// sin él, lleva el triángulo de aviso (listados y avisos). El rojo es solo para alergias.
defineProps({
  texto: { type: String, required: true },
  quitable: { type: Boolean, default: false }
})

defineEmits(['quitar'])
</script>

<template>
  <span :class="['chip', { 'chip-quitable': quitable }]">
    <svg
      v-if="!quitable"
      class="icono"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5v.01" />
    </svg>
    {{ texto }}
    <button
      v-if="quitable"
      type="button"
      class="quitar"
      :aria-label="`Quitar ${texto}`"
      @click="$emit('quitar')"
    >
      <svg
        class="icono"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 7px; background: var(--color-alerta-suave); border: 1px solid var(--color-alerta); border-radius: var(--radio-sm); color: var(--color-alerta); font-size: 12px; font-weight: 700; }
.chip-quitable { gap: 4px; padding: 3px 4px 3px 8px; font-size: 13px; }
.quitar { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 3px; color: var(--color-alerta); cursor: pointer; }
</style>
