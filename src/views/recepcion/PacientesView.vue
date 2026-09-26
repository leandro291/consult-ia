<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useEliminarPaciente } from '@/composables/useEliminarPaciente.js'
import { calcularEdad, formatearFecha, nombreCompleto, normalizarTexto } from '@/utils/formato.js'
import PaginaListado from '@/components/comunes/PaginaListado.vue'
import BotonEditar from '@/components/comunes/BotonEditar.vue'
import ChipAlergia from '@/components/comunes/ChipAlergia.vue'
import BuscadorPacientes from '@/components/pacientes/BuscadorPacientes.vue'
import PacienteForm from '@/components/pacientes/PacienteForm.vue'
import AvisoNoEliminable from '@/components/pacientes/AvisoNoEliminable.vue'

const FILAS_POR_PAGINA = 8

const pacientes = usePacientesStore()
const { avisoVisible, pacienteConConsultas, pedirEliminar } = useEliminarPaciente()

const busqueda = ref('')
const formularioVisible = ref(false)
const pacienteEditado = ref(null)

onMounted(() => pacientes.cargar())

const termino = computed(() => busqueda.value.trim())

// Busca por DNI, nombres o apellidos, sin distinguir mayúsculas ni tildes.
const filtrados = computed(() => {
  const buscado = normalizarTexto(termino.value)
  return pacientes.lista.filter((p) => normalizarTexto(`${p.dni} ${p.nombres} ${p.apellidos}`).includes(buscado))
})

const subtitulo = computed(() => {
  const n = pacientes.lista.length
  return `${n} ${n === 1 ? 'paciente registrado' : 'pacientes registrados'}`
})

function abrir(paciente = null) {
  pacienteEditado.value = paciente
  formularioVisible.value = true
}
</script>

<template>
  <PaginaListado
    titulo="Pacientes"
    :subtitulo="subtitulo"
    etiqueta="Listado de pacientes"
    :valores="filtrados"
    :filas="FILAS_POR_PAGINA"
    etiqueta-nuevo="Nuevo paciente"
    :titulo-vacio="termino ? `Ningún paciente coincide con “${termino}”` : 'Todavía no hay pacientes'"
    :texto-vacio="termino ? 'Revise el apellido o busque por DNI.' : 'Registre al primer paciente para empezar a agendar citas.'"
    @nuevo="abrir()"
  >
    <template #herramientas>
      <BuscadorPacientes v-model="busqueda" />
    </template>

    <template #acciones-vacio>
      <Button
        v-if="termino"
        type="button"
        label="Limpiar búsqueda"
        text
        @click="busqueda = ''"
      />
    </template>

    <Column header="DNI">
      <template #body="{ data }">
        <span class="tipo-dato">{{ data.dni }}</span>
      </template>
    </Column>
    <Column header="Paciente">
      <template #body="{ data }">
        <strong>{{ data.apellidos }}, {{ data.nombres }}</strong>
        <ChipAlergia
          v-for="alergia in data.alergias"
          :key="alergia"
          :texto="alergia"
          class="chip-fila"
        />
      </template>
    </Column>
    <Column header="Edad">
      <template #body="{ data }">
        {{ calcularEdad(data.fechaNacimiento) }}
      </template>
    </Column>
    <Column header="Teléfono">
      <template #body="{ data }">
        <span class="tipo-dato secundario">{{ data.telefono }}</span>
      </template>
    </Column>
    <Column header="Última consulta">
      <template #body="{ data }">
        <span
          v-if="data.ultimaConsulta"
          class="tipo-dato dato-normal"
        >{{ formatearFecha(data.ultimaConsulta) }}</span>
        <span
          v-else
          class="secundario"
        >Sin consultas</span>
      </template>
    </Column>
    <Column>
      <template #header>
        <span class="solo-lectores">Acciones</span>
      </template>
      <template #body="{ data }">
        <div class="acciones">
          <RouterLink
            :to="`/recepcion/pacientes/${data.id}`"
            class="ver"
            :aria-label="`Ver a ${nombreCompleto(data)}`"
          >
            Ver
          </RouterLink>
          <BotonEditar
            :nombre="`a ${nombreCompleto(data)}`"
            @click="abrir(data)"
          />
          <Button
            type="button"
            text
            class="boton-eliminar"
            :aria-label="`Eliminar a ${nombreCompleto(data)}`"
            @click="pedirEliminar(data)"
          >
            <svg
              class="icono"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </svg>
          </Button>
        </div>
      </template>
    </Column>
  </PaginaListado>

  <PacienteForm
    v-model:visible="formularioVisible"
    :paciente="pacienteEditado"
  />
  <AvisoNoEliminable
    v-model:visible="avisoVisible"
    :paciente="pacienteConConsultas"
  />
</template>

<style scoped>
.secundario { color: var(--color-texto-secundario); }
.dato-normal { font-weight: 400; }
.chip-fila { margin-left: 6px; }
.acciones { display: flex; justify-content: flex-end; align-items: center; gap: 6px; white-space: nowrap; }
.ver { font-size: 14px; font-weight: 600; margin-right: 6px; }
.boton-eliminar { width: 40px; height: 40px; padding: 0; color: var(--color-texto-secundario); }
</style>
