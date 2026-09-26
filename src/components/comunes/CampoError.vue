<script setup>
defineProps({
  id: { type: String, required: true },
  mensaje: { type: String, default: '' }
})
</script>

<template>
  <p
    v-if="mensaje"
    :id="id"
    class="campo-error"
  >
    <svg
      class="icono"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <line
        x1="12"
        y1="8"
        x2="12"
        y2="13"
      />
      <line
        x1="12"
        y1="16.5"
        x2="12"
        y2="16.5"
      />
    </svg>
    {{ mensaje }}
  </p>
</template>

<style scoped>
.campo-error {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-alerta);
}
</style>
