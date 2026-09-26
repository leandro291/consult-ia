<script setup>
import { computed, onMounted, ref } from 'vue'
import Column from 'primevue/column'
import { useMedicosStore } from '@/stores/medicos.js'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { DIAS_SEMANA, listarDias, nombreCompleto } from '@/utils/formato.js'
import PaginaListado from '@/components/comunes/PaginaListado.vue'
import BotonEditar from '@/components/comunes/BotonEditar.vue'
import MedicoForm from '@/components/medicos/MedicoForm.vue'

const medicos = useMedicosStore()
const consultorios = useConsultoriosStore()

const visible = ref(false)
const medicoEditado = ref(null)

onMounted(() => {
  medicos.cargar()
  consultorios.cargar()
})

const subtitulo = computed(() => {
  const n = medicos.lista.length
  return `${n} ${n === 1 ? 'médico' : 'médicos'} · cada uno con su consultorio y horario`
})

function consultorioDe(medico) {
  const c = consultorios.lista.find((x) => x.id === medico.consultorioId)
  if (!c) return ''
  return c.piso ? `${c.nombre} · Piso ${c.piso}` : c.nombre
}

function abrir(medico = null) {
  medicoEditado.value = medico
  visible.value = true
}
</script>

<template>
  <PaginaListado
    titulo="Médicos"
    :subtitulo="subtitulo"
    etiqueta="Listado de médicos"
    :valores="medicos.lista"
    etiqueta-nuevo="Nuevo médico"
    titulo-vacio="Todavía no hay médicos"
    texto-vacio="Cree un consultorio y luego registre al médico con su horario."
    @nuevo="abrir()"
  >
    <Column header="Médico">
      <template #body="{ data }">
        <strong>{{ nombreCompleto(data) }}</strong><br>
        <span class="tipo-dato colegiatura">{{ data.colegiatura }}</span>
      </template>
    </Column>
    <Column
      field="especialidad"
      header="Especialidad"
    />
    <Column header="Consultorio">
      <template #body="{ data }">
        <span class="secundario">{{ consultorioDe(data) }}</span>
      </template>
    </Column>
    <Column header="Horario">
      <template #body="{ data }">
        <div class="horario">
          <div
            class="dias"
            :aria-label="listarDias(data.horario.dias)"
            role="group"
          >
            <!-- Activo: relleno y texto en negrita; inactivo: borde punteado. No depende solo del color. -->
            <span
              v-for="dia in DIAS_SEMANA"
              :key="dia.numero"
              :class="['dia', { 'dia-activo': data.horario.dias.includes(dia.numero) }]"
            >{{ dia.abreviatura }}</span>
          </div>
          <span class="tipo-dato rango">{{ data.horario.inicio }}–{{ data.horario.fin }}</span>
        </div>
      </template>
    </Column>
    <Column header="Teléfono">
      <template #body="{ data }">
        <span class="tipo-dato secundario">{{ data.telefono }}</span>
      </template>
    </Column>
    <Column>
      <template #header>
        <span class="solo-lectores">Acciones</span>
      </template>
      <template #body="{ data }">
        <BotonEditar
          :nombre="nombreCompleto(data)"
          @click="abrir(data)"
        />
      </template>
    </Column>
  </PaginaListado>

  <MedicoForm
    v-model:visible="visible"
    :medico="medicoEditado"
  />
</template>

<style scoped>
.secundario { color: var(--color-texto-secundario); }
.colegiatura { font-size: 13px; font-weight: 400; color: var(--color-texto-secundario); }
.horario { display: flex; flex-direction: column; gap: 6px; }
.rango { font-size: 14px; font-weight: 400; }
.dias { display: flex; gap: 3px; }
.dia { box-sizing: border-box; width: 26px; height: 24px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--color-perforacion); border-radius: 3px; font-size: 11px; font-weight: 600; color: var(--color-texto-secundario); }
.dia-activo { background: var(--color-tinta); border-color: var(--color-tinta); color: var(--color-papel); font-weight: 700; }
</style>
