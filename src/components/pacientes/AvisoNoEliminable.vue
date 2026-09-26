<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { nombreCompleto } from '@/utils/formato.js'

// Aviso de que el paciente tiene consultas y no se puede eliminar. Un solo botón: "Entendido".
defineProps({
  visible: { type: Boolean, required: true },
  paciente: { type: Object, default: null }
})

defineEmits(['update:visible'])
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    role="alertdialog"
    :draggable="false"
    :header="paciente ? `No se puede eliminar a ${nombreCompleto(paciente)}` : ''"
    class="aviso-no-eliminable"
    :style="{ width: '480px' }"
    :breakpoints="{ '720px': '95vw' }"
    :pt="{ mask: { style: 'background: var(--velo-dialogo)' } }"
    @update:visible="$emit('update:visible', $event)"
  >
    <p
      v-if="paciente"
      class="motivo"
    >
      Tiene <strong>{{ paciente.totalConsultas }} {{ paciente.totalConsultas === 1 ? 'consulta registrada' : 'consultas registradas' }}</strong>.
      Las historias clínicas se conservan, así que el paciente no se puede borrar.
    </p>
    <template #footer>
      <Button
        type="button"
        label="Entendido"
        class="boton-entendido"
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<style>
/* Sin scoped: el diálogo se monta en el body. */
.aviso-no-eliminable { border: none; border-radius: var(--radio-md); background: var(--color-papel); box-shadow: var(--sombra-dialogo); }
.aviso-no-eliminable .p-dialog-title { font: 800 18px/1.3 var(--fuente-texto); }
.aviso-no-eliminable .motivo { margin: 0; font-size: 15px; line-height: 1.55; color: var(--color-texto-secundario); }
.aviso-no-eliminable .boton-entendido { height: 44px; padding: 0 20px; box-shadow: var(--sombra-boton); }
</style>
