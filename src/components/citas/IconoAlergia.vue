<script setup>
// Triángulo de aviso de alergia. Toma el color del texto (`currentColor`).
defineProps({
  tamano: { type: Number, default: 14 }
})
</script>

<template>
  <svg
    class="icono"
    :width="tamano"
    :height="tamano"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17.5v.01" />
  </svg>
</template>
