<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import { useConsultoriosStore } from '@/stores/consultorios.js'
import { useMedicosStore } from '@/stores/medicos.js'
import { validarConsultorio } from '@/utils/validaciones.js'
import { nombreCompleto } from '@/utils/formato.js'
import PaginaListado from '@/components/comunes/PaginaListado.vue'
import DialogoFormulario from '@/components/comunes/DialogoFormulario.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'
import BotonEditar from '@/components/comunes/BotonEditar.vue'

const consultorios = useConsultoriosStore()
const medicos = useMedicosStore()
const toast = useToast()

const dialogo = ref(null)
const visible = ref(false)
const editandoId = ref(null)
const formulario = reactive({ nombre: '', piso: '', descripcion: '' })
const errores = ref({})

onMounted(() => {
  consultorios.cargar()
  medicos.cargar()
})

const plural = (n, singular, pluralTexto) => `${n} ${n === 1 ? singular : pluralTexto}`

const subtitulo = computed(() => {
  const total = plural(consultorios.lista.length, 'consultorio', 'consultorios')
  const pisos = new Set(consultorios.lista.map((c) => c.piso).filter(Boolean)).size
  return pisos ? `${total} en ${plural(pisos, 'piso', 'pisos')}` : total
})

function medicoAsignado(consultorio) {
  return medicos.lista
    .filter((m) => m.consultorioId === consultorio.id)
    .map(nombreCompleto)
    .join(', ')
}

function abrir(consultorio = null) {
  editandoId.value = consultorio?.id ?? null
  Object.assign(formulario, consultorio
    ? { nombre: consultorio.nombre, piso: consultorio.piso, descripcion: consultorio.descripcion }
    : { nombre: '', piso: '', descripcion: '' })
  errores.value = {}
  consultorios.error = null
  visible.value = true
}

function guardar() {
  errores.value = validarConsultorio(formulario)
  if (Object.keys(errores.value).length) {
    dialogo.value.enfocarPrimerError()
    return
  }
  const guardado = editandoId.value
    ? consultorios.actualizar(editandoId.value, formulario)
    : consultorios.crear(formulario)
  if (!guardado) return
  visible.value = false
  toast.add({ severity: 'success', summary: 'Consultorio guardado.', life: 4000 })
}
</script>

<template>
  <PaginaListado
    titulo="Consultorios"
    :subtitulo="subtitulo"
    etiqueta="Listado de consultorios"
    :valores="consultorios.lista"
    etiqueta-nuevo="Nuevo consultorio"
    titulo-vacio="Todavía no hay consultorios"
    texto-vacio="Cree el primero para poder asignarlo a un médico y agendar citas."
    @nuevo="abrir()"
  >
    <Column header="Consultorio">
      <template #body="{ data }">
        <strong>{{ data.nombre }}</strong>
      </template>
    </Column>
    <Column header="Piso">
      <template #body="{ data }">
        <span class="tipo-dato">{{ data.piso }}</span>
      </template>
    </Column>
    <Column header="Descripción">
      <template #body="{ data }">
        <span class="secundario">{{ data.descripcion }}</span>
      </template>
    </Column>
    <Column header="Médico asignado">
      <template #body="{ data }">
        {{ medicoAsignado(data) || 'Sin médico asignado' }}
      </template>
    </Column>
    <Column>
      <template #header>
        <span class="solo-lectores">Acciones</span>
      </template>
      <template #body="{ data }">
        <BotonEditar
          :nombre="data.nombre"
          @click="abrir(data)"
        />
      </template>
    </Column>
  </PaginaListado>

  <DialogoFormulario
    ref="dialogo"
    v-model:visible="visible"
    :titulo="editandoId ? 'Editar consultorio' : 'Nuevo consultorio'"
    etiqueta-guardar="Guardar consultorio"
    :error="consultorios.error"
    @guardar="guardar"
  >
    <CampoTexto
      id="consultorio-nombre"
      v-model="formulario.nombre"
      etiqueta="Nombre"
      :error="errores.nombre"
    />
    <CampoTexto
      id="consultorio-piso"
      v-model="formulario.piso"
      etiqueta="Piso"
      dato
      opcional
    />
    <CampoTexto
      id="consultorio-descripcion"
      v-model="formulario.descripcion"
      etiqueta="Descripción"
      class="columna-completa"
      opcional
    />
  </DialogoFormulario>
</template>

<style scoped>
.secundario { color: var(--color-texto-secundario); }
</style>
