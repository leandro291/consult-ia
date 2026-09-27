<script setup>
// Marca "Sugerido por IA" de la maqueta (regla lápiz de DESIGN.md): se pone junto a un
// campo del formulario mientras el médico no lo haya editado (RF6 del spec 017).
</script>

<template>
  <span class="marca-sugerido">
    <svg
      class="icono"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      aria-hidden="true"
    ><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>
    Sugerido por IA
  </span>
</template>

<style scoped>
.marca-sugerido { display: inline-flex; align-items: center; gap: 5px; padding: 2px 7px; border: 1px dashed var(--color-lapiz); border-radius: var(--radio-sm); color: var(--color-lapiz); font-size: 11px; font-weight: 700; white-space: nowrap; }
</style>
