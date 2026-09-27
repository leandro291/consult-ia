<script setup>
import { computed } from 'vue'
import AlertaAlergias from '@/components/comunes/AlertaAlergias.vue'
import { calcularEdad, formatearFecha, nombreCompleto, SEXOS } from '@/utils/formato.js'

// Ficha del paciente en la Historia clínica (RF2). Maqueta HistoriaClinica.dc.html, líneas 76-93.
const props = defineProps({
  paciente: { type: Object, required: true }
})

const sexo = computed(() => SEXOS.find((s) => s.valor === props.paciente.sexo)?.etiqueta ?? props.paciente.sexo)
</script>

<template>
  <section
    aria-labelledby="h-ficha-paciente"
    class="ficha-paciente"
  >
    <h2
      id="h-ficha-paciente"
      class="tipo-title titulo"
    >
      {{ nombreCompleto(paciente) }}
    </h2>

    <AlertaAlergias :alergias="paciente.alergias" />

    <dl class="datos">
      <dt class="tipo-label">
        DNI
      </dt>
      <dd class="tipo-dato">
        {{ paciente.dni }}
      </dd>

      <dt class="tipo-label">
        Nacimiento
      </dt>
      <dd>
        <span class="tipo-dato">{{ formatearFecha(paciente.fechaNacimiento) }}</span> ·
        {{ calcularEdad(paciente.fechaNacimiento) }} años
      </dd>

      <dt class="tipo-label">
        Sexo
      </dt>
      <dd>{{ sexo }}</dd>

      <dt class="tipo-label">
        Grupo
      </dt>
      <dd>{{ paciente.grupoSanguineo || '—' }}</dd>

      <dt class="tipo-label">
        Teléfono
      </dt>
      <dd class="tipo-dato">
        {{ paciente.telefono || '—' }}
      </dd>
    </dl>

    <div class="antecedentes">
      <h3 class="tipo-label">
        Antecedentes
      </h3>
      <p>{{ paciente.antecedentes || '—' }}</p>
    </div>
  </section>
</template>

<style scoped>
.ficha-paciente { display: flex; flex-direction: column; gap: var(--espacio-lg); padding: var(--espacio-xl); background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.titulo { margin: 0; padding-bottom: var(--espacio-md); border-bottom: 2px dotted var(--color-perforacion); }
.datos { margin: 0; display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: var(--espacio-sm) var(--espacio-md); font-size: 14px; }
.datos dt { color: var(--color-texto-secundario); }
.datos dd { margin: 0; }
.antecedentes { display: flex; flex-direction: column; gap: var(--espacio-xs); padding-top: var(--espacio-lg); border-top: 1px solid var(--color-renglon); }
.antecedentes h3 { margin: 0; color: var(--color-texto-secundario); }
.antecedentes p { margin: 0; line-height: 1.6; }
</style>
