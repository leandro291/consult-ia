<script setup>
import { computed } from 'vue'
import { useDictado } from '@/composables/useDictado.js'

// Controles de dictado del panel del asistente (RF3 del spec 017): usa useDictado sobre el
// texto de la transcripción, recibido como v-model. Sin soporte del navegador no se renderiza
// nada, y el área de texto sigue usable de forma manual.
const texto = defineModel({ type: String, default: '' })

const { soporte, estado, error, iniciar, pausar, reanudar, detener, limpiar } = useDictado(texto)

const TEXTOS_ESTADO = {
  dictando: 'Dictando',
  pausado: 'Dictado en pausa',
  detenido: 'Dictado detenido'
}
const textoEstado = computed(() => TEXTOS_ESTADO[estado.value] ?? '')
</script>

<template>
  <div
    v-if="soporte"
    class="controles-dictado"
  >
    <span
      v-if="estado !== 'inactivo'"
      class="pildora"
    >
      <span
        v-if="estado === 'dictando'"
        class="punto punto-rojo"
        aria-hidden="true"
      />
      <span
        v-else-if="estado === 'pausado'"
        class="punto"
        aria-hidden="true"
      />
      <svg
        v-else
        class="icono"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><path d="m5 12 5 5 9-10" /></svg>
      {{ textoEstado }}
    </span>

    <button
      v-if="estado === 'inactivo'"
      type="button"
      class="secundario"
      @click="iniciar"
    >
      <svg
        class="icono"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
      /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      Iniciar dictado
    </button>
    <button
      v-if="estado === 'dictando'"
      type="button"
      class="secundario"
      @click="pausar"
    >
      Pausar
    </button>
    <button
      v-if="estado === 'pausado'"
      type="button"
      class="secundario"
      @click="reanudar"
    >
      Reanudar
    </button>
    <button
      v-if="estado === 'dictando' || estado === 'pausado'"
      type="button"
      class="secundario"
      @click="detener"
    >
      Detener
    </button>
    <button
      v-if="estado === 'detenido'"
      type="button"
      class="secundario"
      @click="reanudar"
    >
      <svg
        class="icono"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
      /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      Seguir dictando
    </button>
    <button
      v-if="estado !== 'inactivo'"
      type="button"
      class="ghost"
      @click="limpiar"
    >
      Limpiar
    </button>

    <p
      v-if="error"
      class="error"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.controles-dictado { display: flex; align-items: center; gap: var(--espacio-sm); flex-wrap: wrap; }
.pildora { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; background: var(--color-apagado); border-radius: var(--radio-pill); font-size: 13px; font-weight: 700; color: var(--color-texto-secundario); }
.punto { width: 8px; height: 8px; border-radius: 50%; background: var(--color-lapiz); flex-shrink: 0; }
.punto-rojo { background: var(--color-alerta); animation: pulso 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .punto-rojo { animation: none; }
}
@keyframes pulso {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.secundario { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; background: var(--color-papel); color: var(--color-tinta); border: 1.5px solid var(--color-tinta); border-radius: var(--radio-md); font-size: 14px; font-weight: 700; }
.ghost { height: 40px; padding: 0 10px; background: none; color: var(--color-tinta); border: none; border-radius: var(--radio-md); font-size: 14px; font-weight: 700; }
.error { flex-basis: 100%; margin: 0; font-size: 13px; color: var(--color-alerta); }
</style>
