<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import Chart from 'primevue/chart'
import { DIAS_SEMANA } from '@/utils/formato.js'
import { citasPorDiaYEstado, citasPorMedico } from '@/utils/estadisticas.js'

// Hoja "Resumen de la semana": citas por día y estado, y carga por médico (lunes a sábado).
const props = defineProps({
  citas: { type: Array, required: true },
  medicos: { type: Array, required: true }
})

// Lee un token de DESIGN.md desde las variables CSS, sin hex en el código.
const estilos = getComputedStyle(document.documentElement)
const token = (nombre) => estilos.getPropertyValue(nombre).trim()

// Semana lunes-sábado; el domingo muestra la que acaba de terminar (locale `es`).
const lunes = dayjs().startOf('week').format('YYYY-MM-DD')
const sabado = dayjs(lunes).add(5, 'day').format('YYYY-MM-DD')

const citasSemana = computed(() => props.citas.filter((c) => c.fecha >= lunes && c.fecha <= sabado))
const porDia = computed(() => citasPorDiaYEstado(citasSemana.value, lunes))
const porMedico = computed(() => citasPorMedico(citasSemana.value, props.medicos))

const suma = (serie) => serie.reduce((a, b) => a + b, 0)

const resumenDias = computed(() => {
  const { programadas, atendidas, canceladas, noAsistio } = porDia.value
  return `Citas de la semana: ${suma(programadas)} programadas, ${suma(atendidas)} atendidas, ${suma(canceladas)} canceladas, ${suma(noAsistio)} no asistió`
})
const resumenMedicos = computed(() =>
  `Carga por médico: ${porMedico.value.map((f) => `${f.etiqueta.split(' · ')[0]} ${f.total}`).join(', ')}`
)

// Color del texto, cuadrícula y tipografía comunes a ambos gráficos.
function opcionesBase({ leyenda, apilado, horizontal }) {
  const texto = token('--color-texto-secundario')
  const fuente = { family: token('--fuente-texto'), size: 13 }
  const eje = { ticks: { color: texto, font: fuente }, grid: { color: token('--color-renglon') }, border: { color: token('--color-linea') } }
  const cuenta = { ...eje, beginAtZero: true, stacked: apilado, ticks: { ...eje.ticks, precision: 0, stepSize: 1 } }
  const categorias = { ...eje, stacked: apilado, grid: { display: false } }
  return {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: leyenda, position: 'bottom', labels: { color: token('--color-texto'), font: fuente } },
      tooltip: { titleFont: fuente, bodyFont: fuente }
    },
    scales: horizontal ? { x: cuenta, y: categorias } : { x: categorias, y: cuenta }
  }
}

const datosDias = computed(() => {
  const serie = (label, datos, fondo, borde) => ({
    label,
    data: datos,
    backgroundColor: token(fondo),
    borderColor: token(borde ?? fondo),
    borderWidth: 1.5
  })
  const { programadas, atendidas, canceladas, noAsistio } = porDia.value
  return {
    labels: DIAS_SEMANA.map((d) => d.nombre.charAt(0).toUpperCase() + d.nombre.slice(1)),
    datasets: [
      serie('Programadas', programadas, '--color-tinta'),
      serie('Atendidas', atendidas, '--color-sello'),
      serie('Canceladas', canceladas, '--color-apagado', '--color-texto-secundario'),
      serie('No asistió', noAsistio, '--color-texto-secundario')
    ]
  }
})
const opcionesDias = opcionesBase({ leyenda: true, apilado: true, horizontal: false })

const datosMedicos = computed(() => ({
  labels: porMedico.value.map((f) => f.etiqueta),
  datasets: [{ label: 'Citas', data: porMedico.value.map((f) => f.total), backgroundColor: token('--color-tinta') }]
}))
const opcionesMedicos = opcionesBase({ leyenda: false, apilado: false, horizontal: true })
</script>

<template>
  <section
    aria-labelledby="titulo-resumen-semana"
    class="hoja-resumen"
  >
    <h2
      id="titulo-resumen-semana"
      class="tipo-title titulo-resumen"
    >
      Resumen de la semana
    </h2>

    <div class="graficos">
      <div class="grafico-bloque">
        <h3 class="tipo-label titulo-grafico">
          Citas de la semana
        </h3>
        <Chart
          v-if="citasSemana.length"
          type="bar"
          class="grafico"
          :data="datosDias"
          :options="opcionesDias"
          :canvas-props="{ role: 'img', 'aria-label': resumenDias }"
        />
        <p
          v-else
          class="sin-citas"
        >
          No hay citas esta semana.
        </p>
      </div>

      <div class="grafico-bloque">
        <h3 class="tipo-label titulo-grafico">
          Carga por médico
        </h3>
        <Chart
          v-if="citasSemana.length"
          type="bar"
          class="grafico"
          :data="datosMedicos"
          :options="opcionesMedicos"
          :canvas-props="{ role: 'img', 'aria-label': resumenMedicos }"
        />
        <p
          v-else
          class="sin-citas"
        >
          No hay citas esta semana.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hoja-resumen { margin: 0 48px 40px; padding: 24px 32px 28px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.titulo-resumen { margin: 0 0 var(--espacio-lg); padding-bottom: var(--espacio-md); border-bottom: 2px dotted var(--color-perforacion); }
.graficos { display: grid; grid-template-columns: 1fr 1fr; gap: var(--espacio-2xl); }
.grafico-bloque { min-width: 0; }
.titulo-grafico { margin: 0 0 var(--espacio-md); color: var(--color-texto-secundario); text-transform: uppercase; letter-spacing: 0.06em; }
.grafico { height: 320px; }
.sin-citas { margin: 0; padding: 36px 0; text-align: center; font-size: 14px; color: var(--color-texto-secundario); }

@media (max-width: 1023px) {
  .hoja-resumen { margin-inline: 24px; }
  .graficos { grid-template-columns: 1fr; }
}
</style>
