<script setup>
import { ETIQUETAS_ESTADO_CITA } from '@/utils/formato.js'

// Chip de estado de cita (DESIGN.md → Chips). Mismo estilo en el detalle de la agenda y en el panel del día.
defineProps({
  estado: { type: String, required: true }
})
</script>

<template>
  <span :class="['chip-estado-cita', `estado-${estado}`]">{{ ETIQUETAS_ESTADO_CITA[estado] ?? estado }}</span>
</template>

<style scoped>
.chip-estado-cita { display: inline-block; padding: 3px 8px; border-radius: var(--radio-sm); font-size: 12px; font-weight: 700; }
.chip-estado-cita.estado-programada { background: var(--color-papel); border: 1.5px solid var(--color-tinta); color: var(--color-tinta); padding: 1.5px 6.5px; }
.chip-estado-cita.estado-confirmada { background: var(--color-tinta); color: var(--color-papel); }
.chip-estado-cita.estado-atendida { background: var(--color-sello-suave); border: 1px solid var(--color-sello); color: var(--color-sello-oscuro); padding: 2px 7px; }
.chip-estado-cita.estado-cancelada { background: var(--color-apagado); color: var(--color-texto-secundario); text-decoration: line-through; }
.chip-estado-cita.estado-no_asistio { background: var(--color-papel); border: 1.5px dashed var(--color-texto-secundario); color: var(--color-texto-secundario); padding: 1.5px 6.5px; }
</style>
