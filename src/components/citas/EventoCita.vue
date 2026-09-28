<script setup>
import ChipEstadoCita from '@/components/citas/ChipEstadoCita.vue'
import IconoAlergia from '@/components/citas/IconoAlergia.vue'

// Contenido de una cita en la agenda de solo lectura del médico: hora, paciente, alergia
// y, en la vista Día, motivo y estado; con la acción "Atender" si la cita se puede atender
// y "Ver historia" si ya está atendida (RF7).
defineProps({
  id: { type: String, required: true },
  hora: { type: String, required: true },
  paciente: { type: String, required: true },
  pacienteId: { type: String, required: true },
  motivo: { type: String, default: '' },
  estadoCodigo: { type: String, required: true },
  alergico: { type: Boolean, default: false },
  atendible: { type: Boolean, default: false },
  // Id de la consulta ya registrada para esta cita, si la hay (RF1 de spec 014).
  consultaId: { type: String, default: null },
  mostrarDetalle: { type: Boolean, default: false }
})

defineEmits(['atender', 'ver-historia', 'generar-receta'])
</script>

<template>
  <div class="evento-medico">
    <IconoAlergia
      v-if="alergico"
      :tamano="13"
      class="evento-alergia"
    />
    <span class="evento-datos">
      <span class="evento-hora">{{ hora }}</span>
      {{ paciente }}
      <template v-if="mostrarDetalle">
        · {{ motivo || 'Sin motivo' }}
      </template>
    </span>
    <ChipEstadoCita
      v-if="mostrarDetalle"
      :estado="estadoCodigo"
      class="evento-chip"
    />
    <button
      v-if="atendible"
      type="button"
      class="evento-atender"
      :aria-label="`Atender a ${paciente}`"
      @click.stop="$emit('atender', id)"
    >
      Atender
    </button>
    <button
      v-if="estadoCodigo === 'atendida'"
      type="button"
      class="evento-ver-historia"
      :aria-label="`Ver historia de ${paciente}`"
      @click.stop="$emit('ver-historia', pacienteId)"
    >
      Ver historia
    </button>
    <button
      v-if="estadoCodigo === 'atendida' && consultaId"
      type="button"
      class="evento-receta"
      :aria-label="`Generar receta de ${paciente}`"
      @click.stop="$emit('generar-receta', consultaId)"
    >
      Generar receta PDF
    </button>
  </div>
</template>

<style scoped>
.evento-medico { display: flex; flex-wrap: wrap; align-items: center; gap: var(--espacio-xs); padding: 4px 8px; overflow: hidden; font-size: 12px; line-height: 1.35; }
.evento-datos { flex-grow: 1; min-width: 0; }
.evento-hora { font-family: var(--fuente-dato); font-weight: 700; }
.evento-alergia { flex-shrink: 0; margin-top: 1px; color: var(--color-alerta); }
.evento-chip { flex-shrink: 0; }
.evento-atender { flex-shrink: 0; height: 22px; padding: 0 8px; background: var(--color-papel); border: 1px solid currentColor; border-radius: var(--radio-sm); color: var(--color-tinta); font-size: 11px; font-weight: 700; cursor: pointer; }
.evento-ver-historia { flex-shrink: 0; height: 22px; padding: 0 8px; background: none; border: none; color: inherit; font-size: 11px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.evento-receta { flex-shrink: 0; height: 22px; padding: 0 8px; background: var(--color-papel); border: 1px solid currentColor; border-radius: var(--radio-sm); color: var(--color-tinta); font-size: 11px; font-weight: 700; cursor: pointer; }
</style>
