<script setup>
// Pestañas-filtro por estado (DESIGN.md → Navigation): número grande y etiqueta, no tarjetas de métricas.
defineProps({
  // [{ valor: 'todas', etiqueta: 'Todas', numero: 12 }, ...]
  opciones: { type: Array, required: true },
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div
    role="group"
    aria-label="Filtrar citas por estado"
    class="filtro-estados"
  >
    <button
      v-for="opcion in opciones"
      :key="opcion.valor"
      type="button"
      :aria-pressed="modelValue === opcion.valor"
      class="pestana"
      @click="$emit('update:modelValue', opcion.valor)"
    >
      <span class="numero">{{ opcion.numero }}</span>
      <span class="etiqueta">{{ opcion.etiqueta }}</span>
    </button>
  </div>
</template>

<style scoped>
.filtro-estados { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-bottom: 1.5px solid var(--color-tinta); }
.pestana { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 18px 24px 14px; background: none; border: none; border-left: 1px solid var(--color-linea); border-bottom: 3px solid transparent; text-align: left; color: var(--color-texto); cursor: pointer; }
.pestana:first-child { border-left: none; }
.numero { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
.etiqueta { font-size: 13px; font-weight: 600; color: var(--color-texto-secundario); }
.pestana[aria-pressed="true"] { background: var(--color-tinta-suave); border-bottom-color: var(--color-tinta); color: var(--color-tinta); }
.pestana[aria-pressed="true"] .etiqueta { color: var(--color-tinta); font-weight: 700; }
</style>
