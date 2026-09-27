<script setup>
import { nextTick, ref } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { CIE10 } from '@/data/cie10.js'
import { normalizarTexto } from '@/utils/formato.js'
import CampoError from '@/components/comunes/CampoError.vue'

// Lista editable de diagnósticos con buscador sobre data/cie10.js (RF5).
defineProps({
  id: { type: String, required: true },
  error: { type: String, default: '' }
})

const diagnosticos = defineModel({ type: Array, default: () => [] })

const buscando = ref(false)
const busqueda = ref('')
const sugerencias = ref([])
const campoBusqueda = ref(null)

function etiqueta(item) {
  return `${item.codigo} · ${item.descripcion}`
}

function buscar({ query }) {
  const texto = normalizarTexto(query)
  sugerencias.value = CIE10.filter(
    (d) => normalizarTexto(d.codigo).includes(texto) || normalizarTexto(d.descripcion).includes(texto)
  )
}

async function mostrarBuscador() {
  buscando.value = true
  busqueda.value = ''
  await nextTick()
  campoBusqueda.value?.$el.querySelector('input')?.focus()
}

// No se agrega dos veces el mismo código.
function agregar({ value }) {
  if (!diagnosticos.value.some((d) => d.codigo === value.codigo)) {
    diagnosticos.value = [...diagnosticos.value, { codigo: value.codigo, descripcion: value.descripcion }]
  }
  buscando.value = false
}

function quitar(codigo) {
  diagnosticos.value = diagnosticos.value.filter((d) => d.codigo !== codigo)
}
</script>

<template>
  <div :class="['campo', { 'campo-con-error': error }]">
    <span
      :id="`${id}-label`"
      class="etiqueta"
    >Diagnósticos (CIE-10)</span>

    <ul
      v-if="diagnosticos.length"
      :aria-labelledby="`${id}-label`"
      class="lista"
    >
      <li
        v-for="d in diagnosticos"
        :key="d.codigo"
        class="diagnostico"
      >
        <span class="tipo-dato codigo">{{ d.codigo }}</span>
        <span class="descripcion">{{ d.descripcion }}</span>
        <button
          type="button"
          class="quitar"
          :aria-label="`Quitar diagnóstico ${d.codigo}`"
          @click="quitar(d.codigo)"
        >
          <svg
            class="icono"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </li>
    </ul>

    <AutoComplete
      v-if="buscando"
      :id="id"
      ref="campoBusqueda"
      v-model="busqueda"
      :suggestions="sugerencias"
      :option-label="etiqueta"
      placeholder="Buscar por código o descripción"
      fluid
      @complete="buscar"
      @item-select="agregar"
    />
    <button
      v-else
      type="button"
      class="agregar"
      @click="mostrarBuscador"
    >
      <svg
        class="icono"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><path d="M12 5v14M5 12h14" /></svg>
      Agregar diagnóstico
    </button>

    <CampoError
      :id="`${id}-error`"
      :mensaje="error"
    />
  </div>
</template>

<style scoped>
.etiqueta { font: 600 12px/1.3 var(--fuente-texto); letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario); }
.campo.campo-con-error .etiqueta { color: var(--color-alerta); }
.lista { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.diagnostico { display: flex; align-items: center; gap: var(--espacio-md); min-height: 48px; padding: 4px 4px 4px 12px; background: var(--color-lapiz-suave); border: 1px solid var(--color-linea); border-radius: var(--radio-sm); }
.descripcion { flex-grow: 1; font-size: 15px; }
.quitar { flex-shrink: 0; width: 40px; height: 40px; background: none; border: none; border-radius: var(--radio-md); color: var(--color-texto-secundario); cursor: pointer; }
.agregar { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 8px; background: none; color: var(--color-tinta); border: none; border-radius: var(--radio-md); font-size: 14px; font-weight: 700; cursor: pointer; }
</style>
