<script setup>
import Textarea from 'primevue/textarea'
import ControlesDictado from '@/components/asistente/ControlesDictado.vue'
import { TRANSCRIPCION_DEMO } from '@/data/seed.js'

// Panel "Asistente de consulta" de "Atender cita" (RF1, RF2, RF4, RF5, RF7, RF9 del spec 017).
// No decide reglas de negocio: la vista llama a useAsistenteConsulta y le pasa el resultado.
defineProps({
  activo: { type: Boolean, default: false },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: null },
  advertencias: { type: Array, default: () => [] },
  generado: { type: Boolean, default: false }
})

const emit = defineEmits(['generar', 'usar-ejemplo'])

const transcripcion = defineModel({ type: String, default: '' })
</script>

<template>
  <section
    aria-labelledby="h-asistente"
    class="panel"
  >
    <div class="cabecera">
      <h2
        id="h-asistente"
        class="tipo-title"
      >
        Asistente de consulta
      </h2>
      <span
        class="indicador"
        :class="{ activa: activo }"
      >
        <span
          class="punto"
          aria-hidden="true"
        />
        {{ activo ? 'IA activa' : 'IA desactivada' }}
      </span>
    </div>

    <div class="aviso">
      <svg
        class="icono"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><circle
        cx="12"
        cy="12"
        r="9"
      /><path d="M12 11v5M12 8v.01" /></svg>
      Sugerencias generadas por IA. Verifique toda la información antes de guardar.
    </div>

    <ControlesDictado v-model="transcripcion" />

    <div class="campo">
      <label for="asistente-transcripcion">Transcripción</label>
      <Textarea
        id="asistente-transcripcion"
        v-model="transcripcion"
        class="p-inputtext area"
        rows="9"
      />
    </div>

    <div class="acciones">
      <button
        type="button"
        class="secundario"
        :disabled="!activo || !transcripcion.trim() || cargando"
        @click="emit('generar')"
      >
        <svg
          class="icono"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="M13.5 6.5l4 4" /></svg>
        {{ generado ? 'Volver a generar' : 'Generar con IA' }}
      </button>
      <button
        type="button"
        class="ghost"
        @click="emit('usar-ejemplo', TRANSCRIPCION_DEMO)"
      >
        Usar ejemplo
      </button>
    </div>
    <p
      v-if="!activo"
      class="ayuda"
    >
      El asistente de IA no está configurado en esta instalación.
    </p>

    <p
      v-if="cargando"
      class="cargando"
      role="status"
    >
      <span
        class="spinner"
        aria-hidden="true"
      />
      Analizando consulta…
    </p>

    <p
      v-if="error"
      class="error"
      role="alert"
    >
      {{ error }}
    </p>

    <div
      v-if="advertencias.length"
      class="advertencias"
    >
      <span class="advertencias-titulo">
        <svg
          class="icono"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>
        Revise antes de guardar · {{ advertencias.length }}
      </span>
      <ul>
        <li
          v-for="(advertencia, indice) in advertencias"
          :key="indice"
        >
          {{ advertencia }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel { background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); padding: var(--espacio-xl); display: flex; flex-direction: column; gap: var(--espacio-lg); }
.cabecera { display: flex; justify-content: space-between; align-items: center; }
.cabecera h2 { margin: 0; }
.indicador { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-texto-secundario); }
.indicador .punto { width: 8px; height: 8px; border-radius: 50%; background: var(--color-lapiz); }
.indicador.activa { color: var(--color-texto); }
.indicador.activa .punto { background: var(--color-tinta); }
.aviso { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--color-apagado); border-radius: var(--radio-md); font-size: 13px; line-height: 1.45; color: var(--color-texto-secundario); }
.aviso .icono { flex-shrink: 0; margin-top: 1px; }
.area { height: auto; padding: 12px; font-size: 14px; line-height: 1.6; resize: vertical; }
.acciones { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.secundario { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; background: var(--color-papel); color: var(--color-tinta); border: 1.5px solid var(--color-tinta); border-radius: var(--radio-md); font-size: 14px; font-weight: 700; }
.secundario:disabled { background: var(--color-apagado); color: var(--color-lapiz); border: 1.5px dashed var(--color-perforacion); cursor: not-allowed; }
.ghost { height: 44px; padding: 0 12px; background: none; color: var(--color-tinta); border: none; border-radius: var(--radio-md); font-size: 14px; font-weight: 700; }
.ayuda { margin: 0; font-size: 13px; color: var(--color-texto-secundario); }
.cargando { display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 14px; background: var(--color-lapiz-suave); border: 1px dashed var(--color-lapiz); border-radius: var(--radio-md); font-size: 14px; color: var(--color-lapiz); }
.spinner { width: 16px; height: 16px; flex-shrink: 0; border-radius: 50%; border: 2px solid var(--color-tinta-clara); border-top-color: var(--color-tinta); animation: girar 0.8s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
}
@keyframes girar {
  to { transform: rotate(360deg); }
}
.error { margin: 0; font-size: 14px; color: var(--color-alerta); }
.advertencias { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; background: var(--color-lapiz-suave); border: 1px dashed var(--color-lapiz); border-radius: var(--radio-md); }
.advertencias-titulo { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--color-texto); }
.advertencias ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; line-height: 1.45; color: var(--color-texto-secundario); }
</style>
