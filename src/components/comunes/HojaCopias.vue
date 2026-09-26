<script setup>
// Sin props: solo compone la hoja con sus copias y un slot para el contenido.
</script>

<template>
  <div class="hoja-copias">
    <div
      class="copia copia-rosa"
      aria-hidden="true"
    />
    <div
      class="copia copia-amarilla"
      aria-hidden="true"
    />
    <div class="hoja">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hoja-copias {
  position: relative;
}

.copia {
  position: absolute;
  inset: 0;
  border-radius: var(--radio-sm);
}

.copia-rosa {
  background: var(--color-copia-rosa);
  transform: translate(10px, 10px);
}

.copia-amarilla {
  background: var(--color-copia-amarilla);
  transform: translate(5px, 5px);
}

.hoja {
  position: relative;
  background: var(--color-papel);
  border-radius: var(--radio-sm);
  box-shadow: var(--sombra-hoja);
  padding: 28px 32px;
}
</style>
