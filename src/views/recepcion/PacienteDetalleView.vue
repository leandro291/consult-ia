<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes.js'
import { calcularEdad, formatearFecha, nombreCompleto, SEXOS } from '@/utils/formato.js'
import AlertaAlergias from '@/components/comunes/AlertaAlergias.vue'

const route = useRoute()
const pacientes = usePacientesStore()

const paciente = computed(() => pacientes.obtener(route.params.id))

const sexo = computed(() => SEXOS.find((s) => s.valor === paciente.value.sexo)?.etiqueta)

// Campos de solo lectura: [etiqueta, valor, ¿es dato de código?]
const datos = computed(() => {
  const p = paciente.value
  return [
    ['DNI', p.dni, true],
    ['Fecha de nacimiento', `${formatearFecha(p.fechaNacimiento)} · ${calcularEdad(p.fechaNacimiento)} años`, false],
    ['Sexo', sexo.value, false],
    ['Grupo sanguíneo', p.grupoSanguineo, true],
    ['Teléfono', p.telefono, true],
    ['Correo', p.email, false],
    ['Dirección', p.direccion, false]
  ]
})
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <RouterLink to="/recepcion/pacientes">
        Volver a pacientes
      </RouterLink>
      <h1 class="tipo-headline">
        {{ paciente ? nombreCompleto(paciente) : 'Paciente' }}
      </h1>
    </header>

    <p
      v-if="!paciente"
      class="hoja"
    >
      Paciente no encontrado.
    </p>

    <section
      v-else
      aria-label="Datos del paciente"
      class="hoja"
    >
      <AlertaAlergias :alergias="paciente.alergias" />
      <dl class="datos">
        <div
          v-for="[etiqueta, valor, esDato] in datos"
          :key="etiqueta"
        >
          <dt class="tipo-label">
            {{ etiqueta }}
          </dt>
          <dd :class="{ 'tipo-dato': esDato }">
            {{ valor || '—' }}
          </dd>
        </div>
      </dl>
      <div class="antecedentes">
        <h2 class="tipo-label">
          Antecedentes
        </h2>
        <p>{{ paciente.antecedentes || '—' }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera { display: flex; flex-direction: column; gap: var(--espacio-sm); padding: 28px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); }
.cabecera h1 { margin: 0; }
.hoja { display: flex; flex-direction: column; gap: var(--espacio-xl); margin: 28px 48px 40px; padding: 24px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.datos { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--espacio-lg) var(--espacio-xl); margin: 0; }
.datos dt, .antecedentes h2 { margin: 0 0 var(--espacio-xs); color: var(--color-texto-secundario); }
.datos dd { margin: 0; }
.antecedentes p { margin: 0; line-height: 1.55; }

@media (max-width: 1023px) {
  .cabecera { padding-inline: 24px; }
  .hoja { margin-inline: 24px; }
}
</style>
