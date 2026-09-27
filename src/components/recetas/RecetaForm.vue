<script>
// Fila vacía de medicamento: para "Agregar medicamento" y el estado inicial sin receta (RF5).
// "oral" es la primera opción de VIAS_RECETA (utils/formato.js).
export function medicamentoVacio() {
  return { medicamento: '', dosis: '', frecuencia: '', duracion: '', via: 'oral', indicaciones: '' }
}
</script>

<script setup>
import Textarea from 'primevue/textarea'
import CampoError from '@/components/comunes/CampoError.vue'
import CampoTexto from '@/components/comunes/CampoTexto.vue'
import { VIAS_RECETA } from '@/utils/formato.js'

// Formulario de medicamentos de "Emitir receta" (RF5, RF6). Los botones de descargar e imprimir
// y el aviso de bloqueo viven en RecetaView, que calcula `errores` con `validarReceta`.
const props = defineProps({
  errores: { type: Object, default: () => ({}) }
})

const items = defineModel('items', { type: Array, required: true })
const indicacionesGenerales = defineModel('indicacionesGenerales', { type: String, default: '' })

// Error de un campo puntual de un medicamento, o undefined si no hay.
function errorDe(indice, campo) {
  return Array.isArray(props.errores.items) ? props.errores.items[indice]?.[campo] : undefined
}

function agregar() {
  items.value = [...items.value, medicamentoVacio()]
}

function quitar(indice) {
  items.value = items.value.filter((_, i) => i !== indice)
}
</script>

<template>
  <section
    aria-labelledby="h-medicamentos"
    class="receta-form"
  >
    <div class="cabecera-tarjeta">
      <h2
        id="h-medicamentos"
        class="tipo-title"
      >
        Medicamentos
      </h2>
      <span class="copia">Copia rosa</span>
    </div>

    <fieldset
      v-for="(item, indice) in items"
      :key="indice"
      class="medicamento"
    >
      <legend class="solo-lectores">
        {{ item.medicamento || `Medicamento ${indice + 1}` }}
      </legend>

      <div class="fila-nombre">
        <CampoTexto
          :id="`receta-medicamento-${indice}`"
          v-model="item.medicamento"
          etiqueta="Medicamento"
          :error="errorDe(indice, 'medicamento')"
        />
        <button
          type="button"
          class="quitar"
          :aria-label="`Quitar ${item.medicamento || `medicamento ${indice + 1}`}`"
          @click="quitar(indice)"
        >
          <svg
            class="icono"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
        </button>
      </div>

      <div class="grilla-detalle">
        <CampoTexto
          :id="`receta-dosis-${indice}`"
          v-model="item.dosis"
          etiqueta="Dosis"
          :error="errorDe(indice, 'dosis')"
        />
        <CampoTexto
          :id="`receta-frecuencia-${indice}`"
          v-model="item.frecuencia"
          etiqueta="Frecuencia"
          :error="errorDe(indice, 'frecuencia')"
        />
        <CampoTexto
          :id="`receta-duracion-${indice}`"
          v-model="item.duracion"
          etiqueta="Duración"
          :error="errorDe(indice, 'duracion')"
        />
        <div :class="['campo', { 'campo-con-error': errorDe(indice, 'via') }]">
          <label :for="`receta-via-${indice}`">Vía</label>
          <select
            :id="`receta-via-${indice}`"
            v-model="item.via"
            :aria-invalid="errorDe(indice, 'via') ? 'true' : undefined"
            :aria-describedby="errorDe(indice, 'via') ? `receta-via-${indice}-error` : undefined"
          >
            <option
              v-for="via in VIAS_RECETA"
              :key="via"
              :value="via"
            >
              {{ via }}
            </option>
          </select>
          <CampoError
            :id="`receta-via-${indice}-error`"
            :mensaje="errorDe(indice, 'via')"
          />
        </div>
      </div>

      <CampoTexto
        :id="`receta-indicaciones-${indice}`"
        v-model="item.indicaciones"
        etiqueta="Indicaciones"
        opcional
      />
    </fieldset>

    <button
      type="button"
      class="agregar"
      @click="agregar"
    >
      <svg
        class="icono"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><path d="M12 5v14M5 12h14" /></svg>
      Agregar medicamento
    </button>

    <div class="campo">
      <label for="receta-indicaciones-generales">Indicaciones generales</label>
      <Textarea
        id="receta-indicaciones-generales"
        v-model="indicacionesGenerales"
        class="p-inputtext area"
        rows="3"
      />
    </div>
  </section>
</template>

<style scoped>
.receta-form { background: var(--color-papel); border-top: 8px solid var(--color-copia-rosa); border-radius: 0 0 var(--radio-sm) var(--radio-sm); box-shadow: var(--sombra-hoja); padding: var(--espacio-lg) var(--espacio-xl) var(--espacio-xl); display: flex; flex-direction: column; gap: var(--espacio-xl); min-width: 0; }
.cabecera-tarjeta { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--espacio-md); border-bottom: 2px dotted var(--color-perforacion); }
.cabecera-tarjeta h2 { margin: 0; }
.copia { display: inline-flex; padding: 3px 8px; background: var(--color-copia-rosa); border-radius: var(--radio-sm); color: var(--color-texto-copia-rosa); font-size: 12px; font-weight: 700; }

.medicamento { margin: 0; padding: 0 0 var(--espacio-xl); border: none; border-bottom: 1px solid var(--color-renglon); display: flex; flex-direction: column; gap: var(--espacio-md); }
.medicamento:last-of-type { padding-bottom: 0; border-bottom: none; }
.fila-nombre { display: flex; align-items: flex-end; gap: var(--espacio-md); }
.fila-nombre .campo { flex-grow: 1; }
.quitar { flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--color-linea); border-radius: var(--radio-md); color: var(--color-texto-secundario); cursor: pointer; }
.grilla-detalle { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--espacio-md); }

.receta-form select { height: 44px; padding: 0 10px; font-size: 15px; background: var(--color-campo); color: var(--color-texto); border: none; border-bottom: 1.5px solid var(--color-texto); border-radius: var(--radio-sm) var(--radio-sm) 0 0; }
.receta-form select[aria-invalid='true'] { background: var(--color-alerta-suave); border-bottom: 2px solid var(--color-alerta); }

.agregar { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 8px; background: none; color: var(--color-tinta); border: none; border-radius: var(--radio-md); font-size: 14px; font-weight: 700; cursor: pointer; }
.area { height: auto; padding: 10px 12px; line-height: 1.55; resize: vertical; }

@media (max-width: 1023px) {
  .grilla-detalle { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
