<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import CampoError from '@/components/comunes/CampoError.vue'
import DiagnosticosField from '@/components/consultas/DiagnosticosField.vue'
import HojaCopias from '@/components/comunes/HojaCopias.vue'
import MarcaSugerido from '@/components/asistente/MarcaSugerido.vue'
import { validarConsulta } from '@/utils/validaciones.js'
import { formatearFecha } from '@/utils/formato.js'

// Formulario de consulta de "Atender cita" (RF4-RF6 del spec 012). Valida y emite "guardar";
// la vista llama al store y maneja el Toast y la navegación.
// La prop `sugerencia` (RF6 del spec 017) trae los campos que sugirió la IA, ya sin claves
// null ni arrays vacíos: se aplican sobre el formulario y se marcan a lápiz hasta que el
// médico los edite. "Volver a generar" sobrescribe sin confirmar los campos que llegan con valor.
// `avisoBloqueo` (RF5 del spec 018) deshabilita "Guardar consulta" mientras haya alertas de
// alergia del borrador de receta sin resolver.
const props = defineProps({
  cita: { type: Object, required: true },
  sugerencia: { type: Object, default: null },
  avisoBloqueo: { type: String, default: null }
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

// Campos actualmente marcados "Sugerido por IA": editarlos les quita la marca (RF6).
const sugeridos = reactive(new Set())
const contadorSugeridos = computed(() => sugeridos.size)

function quitarMarca(clave) {
  sugeridos.delete(clave)
}

watch(() => props.sugerencia, (nueva) => {
  if (!nueva) return
  if (nueva.motivo) {
    formulario.motivo = nueva.motivo
    sugeridos.add('motivo')
  }
  if (nueva.examenFisico) {
    formulario.examenFisico = nueva.examenFisico
    sugeridos.add('examenFisico')
  }
  if (nueva.plan) {
    formulario.plan = nueva.plan
    sugeridos.add('plan')
  }
  if (nueva.diagnosticos?.length) {
    formulario.diagnosticos = nueva.diagnosticos.map((d) => ({ ...d }))
    sugeridos.add('diagnosticos')
  }
  if (nueva.signosVitales) {
    Object.entries(nueva.signosVitales).forEach(([clave, valor]) => {
      formulario.signosVitales[clave] = valor
      sugeridos.add(clave)
    })
  }
})

function guardar() {
  if (props.avisoBloqueo) return
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
        <div class="cabecera-derecha">
          <span
            v-if="contadorSugeridos"
            class="contador-sugeridos"
          >
            <svg
              class="icono"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>
            {{ contadorSugeridos }} {{ contadorSugeridos === 1 ? 'campo sugerido' : 'campos sugeridos' }} por IA
          </span>
          <span class="tipo-dato">{{ formatearFecha(cita.fecha) }}</span>
        </div>
      </div>

      <div :class="['campo', { 'campo-con-error': errores.motivo }]">
        <div class="etiqueta-fila">
          <label for="consulta-motivo">Motivo</label>
          <MarcaSugerido v-if="sugeridos.has('motivo')" />
        </div>
        <input
          id="consulta-motivo"
          v-model="formulario.motivo"
          type="text"
          :class="['p-inputtext', { sugerido: sugeridos.has('motivo') }]"
          :aria-invalid="errores.motivo ? 'true' : undefined"
          :aria-describedby="errores.motivo ? 'consulta-motivo-error' : undefined"
          @input="quitarMarca('motivo')"
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
              :class="['p-inputtext', 'tipo-dato', { sugerido: sugeridos.has(campo.clave) }]"
              :placeholder="campo.placeholder"
              :aria-invalid="errores[campo.clave] ? 'true' : undefined"
              :aria-describedby="errores[campo.clave] ? `consulta-${campo.clave}-error` : undefined"
              @input="quitarMarca(campo.clave)"
            >
            <CampoError
              :id="`consulta-${campo.clave}-error`"
              :mensaje="errores[campo.clave]"
            />
          </div>
        </div>
      </fieldset>

      <div class="campo">
        <div class="etiqueta-fila">
          <label for="consulta-examen">Examen físico</label>
          <MarcaSugerido v-if="sugeridos.has('examenFisico')" />
        </div>
        <Textarea
          id="consulta-examen"
          v-model="formulario.examenFisico"
          :class="['p-inputtext', 'area', { sugerido: sugeridos.has('examenFisico') }]"
          rows="2"
          @input="quitarMarca('examenFisico')"
        />
      </div>

      <DiagnosticosField
        id="consulta-diagnosticos"
        v-model="formulario.diagnosticos"
        :error="errores.diagnosticos"
        :sugerido="sugeridos.has('diagnosticos')"
        @tocar="quitarMarca('diagnosticos')"
      />

      <div class="campo">
        <div class="etiqueta-fila">
          <label for="consulta-plan">Plan</label>
          <MarcaSugerido v-if="sugeridos.has('plan')" />
        </div>
        <Textarea
          id="consulta-plan"
          v-model="formulario.plan"
          :class="['p-inputtext', 'area', { sugerido: sugeridos.has('plan') }]"
          rows="2"
          @input="quitarMarca('plan')"
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

    <footer :class="['barra-inferior', { 'con-aviso': avisoBloqueo }]">
      <p
        v-if="avisoBloqueo"
        id="consulta-bloqueo"
        class="aviso-bloqueo"
        role="alert"
      >
        <svg
          class="icono"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><circle
          cx="12"
          cy="12"
          r="9"
        /><path d="M12 8v5M12 16v.01" /></svg>
        {{ avisoBloqueo }}
      </p>
      <Button
        type="submit"
        label="Guardar consulta"
        :disabled="!!avisoBloqueo"
        :aria-describedby="avisoBloqueo ? 'consulta-bloqueo' : undefined"
      />
    </footer>
  </form>
</template>

<style scoped>
.consulta-form { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.consulta-form :deep(.hoja) { display: flex; flex-direction: column; gap: 22px; }
.cabecera-tarjeta { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px dotted var(--color-perforacion); }
.cabecera-tarjeta h2 { margin: 0; }
.cabecera-derecha { display: flex; align-items: center; gap: var(--espacio-md); }
.contador-sugeridos { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px dashed var(--color-lapiz); border-radius: var(--radio-sm); color: var(--color-texto-secundario); font-size: 12px; font-weight: 700; white-space: nowrap; }
.etiqueta-fila { display: flex; justify-content: space-between; align-items: center; }
.signos { margin: 0; padding: 0; border: none; }
.signos-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--espacio-md); }
.unidad { font-weight: 400; text-transform: none; letter-spacing: normal; color: var(--color-texto-secundario); }
.area { height: auto; padding: 10px 12px; line-height: 1.55; resize: vertical; }
.p-inputtext.sugerido { font-style: italic; color: var(--color-lapiz); background: var(--color-lapiz-suave); border: 1px dashed var(--color-perforacion); border-bottom: 1.5px dashed var(--color-lapiz); }
.barra-inferior { position: sticky; bottom: 0; display: flex; justify-content: flex-end; align-items: center; gap: var(--espacio-lg); padding: 16px 24px; background: var(--color-papel); border-radius: var(--radio-md); box-shadow: 0 -6px 20px rgba(22, 25, 43, 0.08); }
.barra-inferior.con-aviso { justify-content: space-between; }
.aviso-bloqueo { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13px; font-weight: 600; color: var(--color-alerta); }

@media (max-width: 1023px) {
  .signos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
