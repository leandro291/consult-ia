<script setup>
import { nextTick, ref, useId } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import CampoError from '@/components/comunes/CampoError.vue'

// Diálogo de formulario (patrón de PacienteNuevo.dc.html). El contenido va en el slot,
// como campos `.campo`; los anchos completos llevan la clase `.columna-completa`.
defineProps({
  visible: { type: Boolean, required: true },
  titulo: { type: String, required: true },
  etiquetaGuardar: { type: String, required: true },
  // Error del servicio: se muestra dentro del diálogo, que queda abierto.
  error: { type: String, default: null }
})

const emit = defineEmits(['update:visible', 'guardar'])

const idFormulario = useId()
const formulario = ref(null)

// Lleva el foco al primer campo marcado con aria-invalid (el primero en pantalla).
async function enfocarPrimerError() {
  await nextTick()
  formulario.value?.querySelector('[aria-invalid="true"]')?.focus()
}

defineExpose({ enfocarPrimerError })
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :header="titulo"
    class="dialogo-formulario"
    :style="{ width: '680px' }"
    :breakpoints="{ '720px': '95vw' }"
    :pt="{ mask: { style: 'background: var(--velo-dialogo)' } }"
    @update:visible="emit('update:visible', $event)"
  >
    <form
      :id="idFormulario"
      ref="formulario"
      novalidate
      class="cuerpo-formulario"
      @submit.prevent="emit('guardar')"
    >
      <slot />
    </form>
    <div
      role="alert"
      class="error-servicio"
    >
      <CampoError
        id="error-dialogo"
        :mensaje="error ?? ''"
      />
    </div>

    <template #footer>
      <Button
        type="button"
        label="Cancelar"
        text
        @click="emit('update:visible', false)"
      />
      <Button
        type="submit"
        :form="idFormulario"
        :label="etiquetaGuardar"
        class="boton-guardar"
      />
    </template>
  </Dialog>
</template>

<style>
/* Sin scoped: el diálogo se monta en el body. */
.dialogo-formulario {
  border: none;
  border-radius: var(--radio-md);
  background: var(--color-papel);
  box-shadow: var(--sombra-dialogo);
}

.dialogo-formulario .p-dialog-header {
  padding: 20px 28px 16px;
  border-bottom: 2px dotted var(--color-perforacion);
}

.dialogo-formulario .p-dialog-title {
  font: 800 22px/1.3 var(--fuente-texto);
  letter-spacing: -0.015em;
}

.dialogo-formulario .p-dialog-content {
  padding: 20px 28px;
}

.dialogo-formulario .p-dialog-footer {
  padding: 14px 28px 20px;
  border-top: 1px solid var(--color-renglon);
  gap: var(--espacio-md);
}

.dialogo-formulario .boton-guardar {
  height: 44px;
  padding: 0 20px;
  box-shadow: var(--sombra-boton);
}

.dialogo-formulario .cuerpo-formulario {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--espacio-lg) 20px;
}

.dialogo-formulario .columna-completa {
  grid-column: span 2;
}

.dialogo-formulario .opcional {
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.dialogo-formulario .campo-dato {
  font-family: var(--fuente-dato);
  font-size: 16px;
}

.dialogo-formulario .error-servicio:not(:empty) {
  margin-top: var(--espacio-lg);
}

.dialogo-formulario select {
  height: 44px;
  padding: 0 10px;
  background: var(--color-campo);
  color: var(--color-texto);
  border: none;
  border-bottom: 1.5px solid var(--color-texto);
  border-radius: var(--radio-sm) var(--radio-sm) 0 0;
}

.dialogo-formulario select[aria-invalid='true'] {
  background: var(--color-alerta-suave);
  border-bottom: 2px solid var(--color-alerta);
}

@media (max-width: 720px) {
  .dialogo-formulario .cuerpo-formulario {
    grid-template-columns: 1fr;
  }

  .dialogo-formulario .columna-completa {
    grid-column: auto;
  }
}
</style>
