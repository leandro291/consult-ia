<script setup>
import { DIAS_SEMANA } from '@/utils/formato.js'
import CampoError from '@/components/comunes/CampoError.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'

// Días de atención y horas de inicio/fin de un médico.
defineProps({
  errores: { type: Object, required: true }
})

const horario = defineModel({ type: Object, required: true })
</script>

<template>
  <fieldset :class="['campo', 'columna-completa', 'dias', { 'campo-con-error': errores.dias }]">
    <legend>Días de atención</legend>
    <div class="dias-lista">
      <label
        v-for="dia in DIAS_SEMANA"
        :key="dia.numero"
        :class="['dia', { 'dia-activo': horario.dias.includes(dia.numero) }]"
      >
        <input
          v-model="horario.dias"
          type="checkbox"
          :value="dia.numero"
          :aria-label="dia.nombre"
          :aria-invalid="dia.numero === DIAS_SEMANA[0].numero && errores.dias ? 'true' : undefined"
          :aria-describedby="errores.dias ? 'medico-dias-error' : undefined"
        >
        {{ dia.abreviatura }}
      </label>
    </div>
    <CampoError
      id="medico-dias-error"
      :mensaje="errores.dias"
    />
  </fieldset>
  <CampoTexto
    id="medico-inicio"
    v-model="horario.inicio"
    etiqueta="Hora de inicio"
    type="time"
    dato
    :error="errores.inicio"
  />
  <CampoTexto
    id="medico-fin"
    v-model="horario.fin"
    etiqueta="Hora de fin"
    type="time"
    dato
    :error="errores.fin"
  />
</template>

<style scoped>
.dias { margin: 0; padding: 0; border: none; min-width: 0; }
.dias legend { padding: 0; margin-bottom: var(--espacio-sm); font: 600 12px/1.3 var(--fuente-texto); letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario); }
.dias.campo-con-error legend { color: var(--color-alerta); }
.dias-lista { display: flex; flex-wrap: wrap; gap: var(--espacio-sm); }
.dia { display: flex; align-items: center; gap: var(--espacio-sm); height: 44px; padding: 0 14px; border: 1px solid var(--color-linea); border-radius: var(--radio-md); font-size: 15px; cursor: pointer; }
.dia input { margin: 0; accent-color: var(--color-tinta); }
.dia-activo { background: var(--color-tinta-suave); border: 1.5px solid var(--color-tinta); color: var(--color-tinta); font-weight: 600; }
</style>
