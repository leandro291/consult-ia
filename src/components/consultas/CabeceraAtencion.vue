<script setup>
import { computed } from 'vue'
import ChipEstadoCita from '@/components/citas/ChipEstadoCita.vue'
import { calcularEdad, nombreCompleto, SEXOS } from '@/utils/formato.js'

// Cabecera de "Atender cita" (RF1). Si el paciente no tiene alergias, agrega sus antecedentes
// aquí, porque en ese caso no hay franja de alergias que los muestre (RF2).
const props = defineProps({
  paciente: { type: Object, required: true },
  cita: { type: Object, required: true },
  consultorio: { type: Object, default: null }
})

const sexo = computed(() => SEXOS.find((s) => s.valor === props.paciente.sexo)?.etiqueta ?? props.paciente.sexo)
const consultorioTexto = computed(() =>
  props.consultorio ? `${props.consultorio.nombre} · Piso ${props.consultorio.piso}` : 'Consultorio desconocido'
)
const mostrarAntecedentes = computed(() => !props.paciente.alergias?.length && props.paciente.antecedentes)
</script>

<template>
  <header class="cabecera-atencion">
    <div class="titulos">
      <RouterLink
        to="/medico/agenda"
        class="volver"
      >
        <svg
          class="icono"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M15 6l-6 6 6 6" /></svg>
        Mi agenda
      </RouterLink>
      <h1 class="tipo-headline">
        {{ nombreCompleto(paciente) }}
      </h1>
      <p class="datos-paciente">
        {{ calcularEdad(paciente.fechaNacimiento) }} años · {{ sexo }} ·
        <span class="tipo-dato">DNI {{ paciente.dni }}</span> · Grupo {{ paciente.grupoSanguineo || 'sin registrar' }}
      </p>
      <p
        v-if="mostrarAntecedentes"
        class="antecedentes"
      >
        Antecedentes: {{ paciente.antecedentes }}
      </p>
    </div>
    <div class="datos-cita">
      <span class="cita-info">Cita <span class="tipo-dato">{{ cita.hora }}</span> · {{ consultorioTexto }}</span>
      <ChipEstadoCita :estado="cita.estado" />
      <RouterLink
        :to="`/medico/historia/${paciente.id}`"
        class="historia"
      >
        Historia clínica
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.cabecera-atencion { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); padding: 20px 48px 18px; flex-wrap: wrap; }
.titulos { display: flex; flex-direction: column; gap: 6px; }
.volver { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; font-size: 14px; font-weight: 600; text-decoration: none; }
.cabecera-atencion h1 { margin: 0; }
.datos-paciente, .antecedentes { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }
.datos-cita { display: flex; align-items: center; gap: var(--espacio-lg); }
.cita-info { font-size: 14px; color: var(--color-texto-secundario); }
.historia { display: inline-flex; align-items: center; height: 40px; padding: 0 var(--espacio-md); background: var(--color-papel); border: 1px solid var(--color-linea); border-radius: var(--radio-md); color: var(--color-texto); font-size: 14px; font-weight: 600; text-decoration: none; }

@media (max-width: 1023px) {
  .cabecera-atencion { padding-inline: 24px; }
}
</style>
