<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import { useConsultasStore } from '@/stores/consultas.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import FichaPaciente from '@/components/pacientes/FichaPaciente.vue'
import TarjetaConsulta from '@/components/consultas/TarjetaConsulta.vue'
import { formatearMesAnio, nombreCompleto } from '@/utils/formato.js'

const route = useRoute()
const pacientes = usePacientesStore()
const medicos = useMedicosStore()
const consultas = useConsultasStore()

const cargando = ref(true)
const errorCarga = ref(null)
const orden = ref('recientes')

function cargar() {
  cargando.value = true
  pacientes.cargar()
  medicos.cargar()
  consultas.cargar()
  errorCarga.value = pacientes.error ?? medicos.error ?? consultas.error
  cargando.value = false
}

onMounted(cargar)

const paciente = computed(() => pacientes.lista.find((p) => p.id === route.params.pacienteId) ?? null)

// Todas las consultas del paciente, de cualquier médico (RF3), en el orden elegido.
const consultasPaciente = computed(() => {
  if (!paciente.value) return []
  const propias = consultas.lista.filter((c) => c.pacienteId === paciente.value.id)
  const porFecha = [...propias].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return orden.value === 'recientes' ? porFecha.reverse() : porFecha
})

const masAntigua = computed(() =>
  consultasPaciente.value.length
    ? [...consultasPaciente.value].sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
    : null
)

const subtitulo = computed(() => {
  if (!paciente.value) return ''
  const cantidad = consultasPaciente.value.length
  if (!cantidad) return 'Sin consultas registradas'
  const plural = cantidad === 1 ? 'consulta' : 'consultas'
  return `${nombreCompleto(paciente.value)} · ${cantidad} ${plural} desde ${formatearMesAnio(masAntigua.value.fecha)}`
})

function medicoDe(consulta) {
  return medicos.lista.find((m) => m.id === consulta.medicoId) ?? null
}
</script>

<template>
  <div class="pagina">
    <p
      v-if="cargando"
      class="estado"
      role="status"
    >
      Cargando…
    </p>

    <div
      v-else-if="errorCarga"
      class="estado"
      role="alert"
    >
      <p class="estado-titulo">
        No se pudo cargar la historia clínica
      </p>
      <p>{{ errorCarga }} No se cambió ningún dato.</p>
      <Button
        type="button"
        label="Reintentar"
        @click="cargar"
      />
    </div>

    <template v-else-if="!paciente">
      <header class="cabecera-simple">
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
      </header>
      <p
        class="estado"
        role="alert"
      >
        Paciente no encontrado.
      </p>
    </template>

    <template v-else>
      <header class="cabecera">
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
            Historia clínica
          </h1>
          <p class="subtitulo">
            {{ subtitulo }}
          </p>
        </div>

        <div
          role="group"
          aria-label="Orden"
          class="orden"
        >
          <button
            type="button"
            :aria-pressed="orden === 'recientes'"
            :class="['boton-orden', { activo: orden === 'recientes' }]"
            @click="orden = 'recientes'"
          >
            Más recientes
          </button>
          <button
            type="button"
            :aria-pressed="orden === 'antiguas'"
            :class="['boton-orden', { activo: orden === 'antiguas' }]"
            @click="orden = 'antiguas'"
          >
            Más antiguas
          </button>
        </div>
      </header>

      <main class="contenido">
        <FichaPaciente :paciente="paciente" />

        <p
          v-if="!consultasPaciente.length"
          class="hoja estado-vacio"
        >
          Este paciente no tiene consultas registradas.
        </p>
        <div
          v-else
          class="linea-tiempo"
        >
          <ol
            aria-label="Consultas"
            class="lista"
          >
            <li
              v-for="(c, i) in consultasPaciente"
              :key="`${orden}-${c.id}`"
              class="item"
            >
              <span
                aria-hidden="true"
                class="punto"
              />
              <TarjetaConsulta
                :consulta="c"
                :medico="medicoDe(c)"
                :expandida-inicial="i < 2"
              />
            </li>
          </ol>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.cabecera-simple { padding: 20px 48px 0; }
.cabecera { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); padding: 20px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); flex-wrap: wrap; }
.titulos { display: flex; flex-direction: column; gap: 6px; }
.volver { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; font-size: 14px; font-weight: 600; text-decoration: none; }
.cabecera h1 { margin: 0; }
.subtitulo { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }
.orden { display: flex; background: var(--color-papel); border: 1px solid var(--color-linea); border-radius: var(--radio-md); padding: 3px; }
.boton-orden { height: 38px; padding: 0 var(--espacio-md); background: none; color: var(--color-texto); border: none; border-radius: var(--radio-sm); font-size: 14px; font-weight: 600; cursor: pointer; }
.boton-orden.activo { background: var(--color-texto); color: var(--color-papel); font-weight: 700; }

.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 28px 48px 40px; padding: 36px 24px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); text-align: center; color: var(--color-texto-secundario); }
.estado p { margin: 0; }
.estado-titulo { font-size: 17px; font-weight: 700; color: var(--color-texto); }

.contenido { padding: 28px 48px 40px; display: grid; grid-template-columns: 300px minmax(0, 1fr); align-items: start; gap: var(--espacio-2xl); }
.hoja { background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); }
.estado-vacio { margin: 0; padding: 36px 24px; text-align: center; color: var(--color-texto-secundario); }

.linea-tiempo { position: relative; }
.lista { list-style: none; margin: 0; padding: 0 0 0 36px; display: flex; flex-direction: column; gap: var(--espacio-xl); }
.linea-tiempo::before { content: ''; position: absolute; left: 11px; top: 8px; bottom: 8px; width: 2px; background: var(--color-linea); }
.item { position: relative; }
.punto { position: absolute; left: -32px; top: 22px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-papel); border: 2px solid var(--color-texto); }

@media (max-width: 1023px) {
  .cabecera-simple, .cabecera, .contenido { padding-inline: 24px; }
  .contenido { grid-template-columns: 1fr; }
}
</style>
