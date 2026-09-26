<script setup>
import InputText from 'primevue/inputtext'

const busqueda = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="barra">
    <div class="buscador">
      <label
        for="buscar-paciente"
        class="solo-lectores"
      >Buscar paciente</label>
      <svg
        class="icono"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
        />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <InputText
        id="buscar-paciente"
        v-model="busqueda"
        type="search"
        placeholder="Buscar por DNI o nombre"
      />
    </div>
    <span class="orden">Ordenado por apellido</span>
  </div>
</template>

<style scoped>
.barra { display: flex; justify-content: space-between; align-items: center; gap: var(--espacio-lg); padding: 8px 0 16px; border-bottom: 1px solid var(--color-linea); }
.buscador { position: relative; }
.buscador .icono { position: absolute; left: 12px; top: 13px; color: var(--color-texto-secundario); }
.buscador :deep(.p-inputtext) { width: 360px; max-width: 100%; padding-left: 40px; }
.orden { font-size: 14px; color: var(--color-texto-secundario); }
</style>
