<script setup>
import { computed } from 'vue'

// Barra de herramientas de la hoja: navegación, título del rango, filtro (slot) y vista.
const props = defineProps({
  titulo: { type: String, required: true },
  vista: { type: String, required: true }
})

defineEmits(['hoy', 'anterior', 'siguiente', 'cambiar-vista'])

const VISTAS = [
  { valor: 'timeGridWeek', etiqueta: 'Semana' },
  { valor: 'timeGridDay', etiqueta: 'Día' }
]

const unidad = computed(() => (props.vista === 'timeGridDay' ? 'Día' : 'Semana'))
</script>

<template>
  <div class="barra">
    <div class="navegacion">
      <button
        type="button"
        class="hoy"
        @click="$emit('hoy')"
      >
        Hoy
      </button>
      <button
        type="button"
        class="flecha"
        :aria-label="`${unidad} anterior`"
        @click="$emit('anterior')"
      >
        <svg
          class="icono"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        type="button"
        class="flecha"
        :aria-label="`${unidad} siguiente`"
        @click="$emit('siguiente')"
      >
        <svg
          class="icono"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <h2 class="titulo">
        {{ titulo }}
      </h2>
    </div>
    <div class="opciones">
      <slot />
      <div
        role="group"
        aria-label="Vista"
        class="vistas"
      >
        <button
          v-for="v in VISTAS"
          :key="v.valor"
          type="button"
          :aria-pressed="vista === v.valor"
          :class="['vista', { activa: vista === v.valor }]"
          @click="$emit('cambiar-vista', v.valor)"
        >
          {{ v.etiqueta }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.barra { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--espacio-lg); padding: 14px 20px; border-bottom: 1px solid var(--color-linea); }
.navegacion, .opciones { display: flex; align-items: center; gap: var(--espacio-sm); }
.opciones { gap: var(--espacio-md); }
.hoy { height: 40px; padding: 0 14px; background: var(--color-papel); color: var(--color-tinta); border: 1.5px solid var(--color-tinta); border-radius: var(--radio-md); font-size: 14px; font-weight: 700; cursor: pointer; }
.flecha { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; border-radius: var(--radio-md); color: var(--color-texto); cursor: pointer; }
.flecha:hover { background: var(--color-apagado); }
.titulo { margin: 0 0 0 6px; font-size: 18px; font-weight: 700; }
.vistas { display: flex; background: var(--color-papel); border: 1px solid var(--color-linea); border-radius: var(--radio-md); padding: 3px; }
.vista { height: 34px; padding: 0 14px; background: none; color: var(--color-texto); border: none; border-radius: var(--radio-sm); font-size: 14px; font-weight: 600; cursor: pointer; }
.vista.activa { background: var(--color-texto); color: var(--color-papel); font-weight: 700; }
</style>
