<script setup>
import Button from 'primevue/button'

// El clic llega al padre por herencia de atributos (@click).
defineProps({
  // Nombre de la fila, para el aria-label ("Editar Consultorio 101").
  nombre: { type: String, required: true }
})
</script>

<template>
  <Button
    type="button"
    outlined
    class="boton-editar"
    :aria-label="`Editar ${nombre}`"
  >
    <svg
      class="icono"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
    </svg>
    Editar
  </Button>
</template>

<style scoped>
.boton-editar {
  height: 40px;
  gap: 6px;
  padding: 0 12px;
  font-size: 14px;
  border-color: var(--color-linea);
}
</style>
