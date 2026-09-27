<script setup>
import { reactive, ref } from 'vue'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import CampoError from '@/components/comunes/CampoError.vue'
import DiagnosticosField from '@/components/consultas/DiagnosticosField.vue'
import HojaCopias from '@/components/comunes/HojaCopias.vue'
import { validarConsulta } from '@/utils/validaciones.js'
import { formatearFecha } from '@/utils/formato.js'

// Formulario de consulta de "Atender cita" (RF4-RF6). Valida y emite "guardar"; la vista
// llama al store y maneja el Toast y la navegación.
const props = defineProps({
  cita: { type: Object, required: true }
})

const emit = defineEmits(['guardar'])

const CAMPOS_SIGNOS = [
  { clave: 'presion', etiqueta: 'Presión', unidad: 'mmHg', placeholder: '120/80' },
  { clave: 'frecuenciaCardiaca', etiqueta: 'Frec. cardiaca', unidad: 'lpm', placeholder: '' },
  { clave: 'temperatura', etiqueta: 'Temperatura', unidad: '°C', placeholder: '' },
  { clave: 'peso', etiqueta: 'Peso', unidad: 'kg', placeholder: '' },
  { clave: 'talla', etiqueta: 'Talla', unidad: 'cm', placeholder: '' }
]

const errores = ref({})
const formulario = reactive({
  motivo: props.cita.motivo ?? '',
  signosVitales: { presion: '', frecuenciaCardiaca: '', temperatura: '', peso: '', talla: '' },
  examenFisico: '',
  diagnosticos: [],
  plan: '',
  observaciones: ''
})

function guardar() {
  errores.value = validarConsulta(formulario)
  if (Object.keys(errores.value).length) return

  emit('guardar', {
    motivo: formulario.motivo.trim(),
    signosVitales: { ...formulario.signosVitales },
    examenFisico: formulario.examenFisico,
    diagnosticos: formulario.diagnosticos,
    plan: formulario.plan,
    observaciones: formulario.observaciones
  })
}
</script>

<template>
  <form
    class="consulta-form"
    novalidate
    @submit.prevent="guardar"
  >
    <HojaCopias>
      <div class="cabecera-tarjeta">
        <h2
          id="h-consulta"
          class="tipo-title"
        >
          Consulta
        </h2>
        <span class="tipo-dato">{{ formatearFecha(cita.fecha) }}</span>
      </div>

      <div :class="['campo', { 'campo-con-error': errores.motivo }]">
        <label for="consulta-motivo">Motivo</label>
        <input
          id="consulta-motivo"
          v-model="formulario.motivo"
          type="text"
          class="p-inputtext"
          :aria-invalid="errores.motivo ? 'true' : undefined"
          :aria-describedby="errores.motivo ? 'consulta-motivo-error' : undefined"
        >
        <CampoError
          id="consulta-motivo-error"
          :mensaje="errores.motivo"
        />
      </div>

      <fieldset class="signos">
        <legend class="tipo-label">
          Signos vitales
        </legend>
        <div class="signos-grid">
          <div
            v-for="campo in CAMPOS_SIGNOS"
            :key="campo.clave"
            :class="['campo', { 'campo-con-error': errores[campo.clave] }]"
          >
            <label :for="`consulta-${campo.clave}`">{{ campo.etiqueta }} <span class="unidad">{{ campo.unidad }}</span></label>
            <input
              :id="`consulta-${campo.clave}`"
              v-model="formulario.signosVitales[campo.clave]"
              type="text"
              class="p-inputtext tipo-dato"
              :placeholder="campo.placeholder"
              :aria-invalid="errores[campo.clave] ? 'true' : undefined"
              :aria-describedby="errores[campo.clave] ? `consulta-${campo.clave}-error` : undefined"
            >
            <CampoError
              :id="`consulta-${campo.clave}-error`"
              :mensaje="errores[campo.clave]"
            />
          </div>
        </div>
      </fieldset>

      <div class="campo">
        <label for="consulta-examen">Examen físico</label>
        <Textarea
          id="consulta-examen"
          v-model="formulario.examenFisico"
          class="p-inputtext area"
          rows="2"
        />
      </div>

      <DiagnosticosField
        id="consulta-diagnosticos"
        v-model="formulario.diagnosticos"
        :error="errores.diagnosticos"
      />

      <div class="campo">
        <label for="consulta-plan">Plan</label>
        <Textarea
          id="consulta-plan"
          v-model="formulario.plan"
          class="p-inputtext area"
          rows="2"
        />
      </div>

      <div class="campo">
        <label for="consulta-observaciones">Observaciones</label>
        <Textarea
          id="consulta-observaciones"
          v-model="formulario.observaciones"
          class="p-inputtext area"
          rows="2"
          placeholder="Opcional"
        />
      </div>
    </HojaCopias>

    <footer class="barra-inferior">
      <Button
        type="submit"
        label="Guardar consulta"
      />
    </footer>
  </form>
</template>

<style scoped>
.consulta-form { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.consulta-form :deep(.hoja) { display: flex; flex-direction: column; gap: 22px; }
.cabecera-tarjeta { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px dotted var(--color-perforacion); }
.cabecera-tarjeta h2 { margin: 0; }
.signos { margin: 0; padding: 0; border: none; }
.signos-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--espacio-md); }
.unidad { font-weight: 400; text-transform: none; letter-spacing: normal; color: var(--color-texto-secundario); }
.area { height: auto; padding: 10px 12px; line-height: 1.55; resize: vertical; }
.barra-inferior { position: sticky; bottom: 0; display: flex; justify-content: flex-end; padding: 16px 24px; background: var(--color-papel); border-radius: var(--radio-md); box-shadow: 0 -6px 20px rgba(22, 25, 43, 0.08); }

@media (max-width: 1023px) {
  .signos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
