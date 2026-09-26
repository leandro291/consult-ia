<script setup>
defineProps({
  // Etiqueta opcional debajo del nombre (ej. el rol en el menú lateral).
  etiqueta: { type: String, default: '' }
})
</script>

<template>
  <div class="marca-clinica">
    <svg
      class="logo"
      width="36"
      height="36"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <rect
        class="copia copia-rosa"
        x="9"
        y="9"
        width="19"
        height="19"
        rx="2"
      />
      <rect
        class="copia copia-amarilla"
        x="6.5"
        y="6.5"
        width="19"
        height="19"
        rx="2"
      />
      <rect
        class="hoja"
        x="4"
        y="4"
        width="19"
        height="19"
        rx="2"
      />
      <path
        class="renglones"
        d="M8 10h11M8 14h11M8 18h7"
      />
    </svg>
    <div class="textos">
      <span class="nombre">Clínica Demo</span>
      <span
        v-if="etiqueta"
        class="etiqueta"
      >{{ etiqueta }}</span>
    </div>
  </div>
</template>

<style scoped>
.marca-clinica {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo .copia,
.logo .hoja {
  stroke: var(--color-texto);
  stroke-width: 1.5;
}

.logo .copia-rosa {
  fill: var(--color-copia-rosa);
}

.logo .copia-amarilla {
  fill: var(--color-copia-amarilla);
}

.logo .hoja {
  fill: var(--color-papel);
}

.logo .renglones {
  fill: none;
  stroke: var(--color-tinta);
  stroke-width: 1.5;
}

.textos {
  display: flex;
  flex-direction: column;
}

.nombre {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.etiqueta {
  font-size: 13px;
  color: var(--color-texto-secundario);
}
</style>
