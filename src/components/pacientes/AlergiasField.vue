<script setup>
import { ref } from 'vue'
import ChipAlergia from '@/components/comunes/ChipAlergia.vue'

// Lista de alergias editable: Enter (o salir del campo) agrega el texto; cada chip se quita con su botón.
const alergias = defineModel({ type: Array, default: () => [] })

const texto = ref('')

function agregar() {
  const nueva = texto.value.trim()
  texto.value = ''
  const repetida = alergias.value.some((a) => a.toLowerCase() === nueva.toLowerCase())
  if (nueva && !repetida) alergias.value = [...alergias.value, nueva]
}

function quitar(alergia) {
  alergias.value = alergias.value.filter((a) => a !== alergia)
}
</script>

<template>
  <div class="campo">
    <label for="paciente-alergias">Alergias</label>
    <div class="lista">
      <ChipAlergia
        v-for="alergia in alergias"
        :key="alergia"
        :texto="alergia"
        quitable
        @quitar="quitar(alergia)"
      />
      <input
        id="paciente-alergias"
        v-model="texto"
        type="text"
        placeholder="Escriba y presione Enter"
        @keydown.enter.prevent="agregar"
        @blur="agregar"
      >
    </div>
  </div>
</template>

<style scoped>
.lista { display: flex; flex-wrap: wrap; align-items: center; gap: var(--espacio-sm); min-height: 44px; padding: 6px 8px; background: var(--color-campo); border-bottom: 1.5px solid var(--color-texto); border-radius: var(--radio-sm) var(--radio-sm) 0 0; }
.lista:focus-within { border-bottom: 2px solid var(--color-tinta); }
.lista input { flex-grow: 1; min-width: 180px; height: 30px; padding: 0 4px; background: none; border: none; font-size: 15px; }
.lista input:focus-visible { outline: none; }
</style>
