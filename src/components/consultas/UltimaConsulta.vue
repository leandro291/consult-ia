<script setup>
import { computed } from 'vue'
import { formatearFecha, nombreCompleto } from '@/utils/formato.js'

// Panel "Última consulta" de Atender cita (RF3): la más reciente del paciente, de cualquier médico.
const props = defineProps({
  consulta: { type: Object, default: null },
  medico: { type: Object, default: null },
  pacienteId: { type: String, required: true }
})

const medicoTexto = computed(() => props.medico ? nombreCompleto(props.medico) : 'médico desconocido')

const diagnosticosTexto = computed(() =>
  (props.consulta?.diagnosticos ?? [])
    .map((d) => (d.codigo ? `${d.codigo} ${d.descripcion}` : d.descripcion))
    .join(', ')
)

const signosTexto = computed(() => {
  const { temperatura, presion } = props.consulta?.signosVitales ?? {}
  const partes = []
  if (temperatura) partes.push(`T ${temperatura} °C`)
  if (presion) partes.push(`PA ${presion}`)
  return partes.join(' · ')
})
</script>

<template>
  <section
    aria-labelledby="h-ultima-consulta"
    class="ultima-consulta"
  >
    <h2
      id="h-ultima-consulta"
      class="tipo-title"
    >
      Última consulta
    </h2>
    <p
      v-if="!consulta"
      class="texto"
    >
      Sin consultas anteriores.
    </p>
    <p
      v-else
      class="texto"
    >
      <span class="tipo-dato">{{ formatearFecha(consulta.fecha) }}</span> · {{ medicoTexto }}<br>
      <span
        v-if="diagnosticosTexto"
        class="tipo-dato"
      >{{ diagnosticosTexto }}</span>
      <template v-if="diagnosticosTexto && signosTexto">
        ·
      </template>
      <span
        v-if="signosTexto"
        class="tipo-dato"
      >{{ signosTexto }}</span>
    </p>
    <RouterLink
      v-if="consulta"
      :to="`/medico/historia/${pacienteId}`"
      class="enlace"
    >
      Ver historia clínica completa
    </RouterLink>
  </section>
</template>

<style scoped>
.ultima-consulta { display: flex; flex-direction: column; gap: 10px; padding: 20px 24px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.ultima-consulta h2 { margin: 0; }
.texto { margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-texto-secundario); }
.enlace { align-self: flex-start; font-size: 14px; font-weight: 600; }
</style>
