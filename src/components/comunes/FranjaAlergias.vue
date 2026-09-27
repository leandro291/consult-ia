<script setup>
import { computed } from 'vue'

// Franja roja de todo el ancho (Atender cita, Emitir receta). No renderiza nada sin alergias (RF2).
const props = defineProps({
  alergias: { type: Array, default: () => [] },
  antecedentes: { type: String, default: '' },
  sexo: { type: String, default: 'M' }
})

const texto = computed(() => `${props.sexo === 'F' ? 'Alérgica' : 'Alérgico'} a ${props.alergias.join(', ')}`)
</script>

<template>
  <div
    v-if="alergias.length"
    role="note"
    aria-label="Alergias del paciente"
    class="franja-alergias"
  >
    <svg
      class="icono icono-alerta"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5v.01" />
    </svg>
    <p class="titulo">
      {{ texto }}
    </p>
    <div class="espacio" />
    <p
      v-if="antecedentes"
      class="antecedentes"
    >
      Antecedentes: {{ antecedentes }}
    </p>
  </div>
</template>

<style scoped>
.franja-alergias { display: flex; align-items: center; gap: var(--espacio-lg); padding: 12px 48px; background: var(--color-alerta); color: var(--color-papel); }
.icono-alerta { flex-shrink: 0; }
.titulo { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; }
.espacio { flex-grow: 1; }
.antecedentes { margin: 0; font-size: 14px; color: var(--color-alerta-clara); }

@media (max-width: 1023px) {
  .franja-alergias { padding-inline: 24px; flex-wrap: wrap; }
}
</style>
