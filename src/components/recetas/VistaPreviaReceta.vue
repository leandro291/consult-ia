<script setup>
import { computed } from 'vue'
import { calcularEdad, formatearFecha, nombreCompleto } from '@/utils/formato.js'

// Hoja de solo lectura que refleja en vivo el contenido del PDF de recetaPdf.js (RF2-RF5).
// No importa pdf/ (tabla de capas de SETUP.md): recibe todo por props desde RecetaView.vue.
const props = defineProps({
  items: { type: Array, required: true },
  indicacionesGenerales: { type: String, default: '' },
  paciente: { type: Object, required: true },
  medico: { type: Object, required: true },
  fecha: { type: String, required: true },
  recetaId: { type: String, default: null },
  clinica: { type: Object, required: true },
  nombreArchivo: { type: String, required: true }
})

// Campo obligatorio vacío -> null, para mostrar "falta" en su celda (RF4).
function conFalta(valor) {
  return (valor ?? '').trim() || null
}

const filas = computed(() =>
  props.items.map((item) => ({
    medicamento: conFalta(item.medicamento),
    indicaciones: (item.indicaciones ?? '').trim(),
    dosis: conFalta(item.dosis),
    frecuencia: conFalta(item.frecuencia),
    duracion: conFalta(item.duracion),
    via: conFalta(item.via)
  }))
)

const indicacionesTexto = computed(() => (props.indicacionesGenerales ?? '').trim())
</script>

<template>
  <div class="vista-previa">
    <div class="cabecera-vp">
      <h2 class="tipo-title">
        Vista previa
      </h2>
      <span class="nombre-archivo tipo-dato">{{ nombreArchivo }}</span>
    </div>

    <article
      aria-label="Vista previa de la receta en PDF"
      class="hoja"
    >
      <div class="membrete">
        <div class="marca">
          <svg
            class="logo"
            width="26"
            height="26"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <rect
              class="copia copia-rosa"
              x="9"
              y="9"
              width="19"
              height="19"
              rx="2"
            />
            <rect
              class="copia copia-amarilla"
              x="6.5"
              y="6.5"
              width="19"
              height="19"
              rx="2"
            />
            <rect
              class="hoja-logo"
              x="4"
              y="4"
              width="19"
              height="19"
              rx="2"
            />
            <path
              class="renglones"
              d="M8 10h11M8 14h11M8 18h7"
            />
          </svg>
          <div class="textos-marca">
            <span class="clinica-nombre">{{ clinica.nombre }}</span>
            <span class="clinica-datos">{{ clinica.direccion }} · Tel. {{ clinica.telefono }}</span>
          </div>
        </div>
        <div class="datos-medico">
          <strong>{{ nombreCompleto(medico) }}</strong><br>
          {{ medico.especialidad }}<br>
          <span class="tipo-dato">{{ medico.colegiatura }}</span>
        </div>
      </div>

      <div class="datos-paciente">
        <div class="dato dato-ancho">
          <span class="etiqueta">Paciente</span>
          <span class="valor">{{ nombreCompleto(paciente) }}</span>
        </div>
        <div class="dato">
          <span class="etiqueta">DNI · Edad</span>
          <span class="valor tipo-dato">{{ paciente.dni }} · {{ calcularEdad(paciente.fechaNacimiento) }}</span>
        </div>
        <div class="dato">
          <span class="etiqueta">Fecha</span>
          <span class="valor tipo-dato">{{ formatearFecha(fecha) }}</span>
        </div>
      </div>

      <div class="rp">
        <span class="rp-titulo">Rp/</span>
        <div class="tabla-cabecera">
          <span>Medicamento</span><span>Dosis</span><span>Frecuencia</span><span>Duración</span><span>Vía</span>
        </div>
        <div
          v-for="(fila, indice) in filas"
          :key="indice"
          class="tabla-fila"
        >
          <span class="celda-medicamento">
            <span :class="{ falta: !fila.medicamento }">{{ fila.medicamento || 'falta' }}</span>
            <span
              v-if="fila.indicaciones"
              class="indicaciones-medicamento"
            >{{ fila.indicaciones }}</span>
          </span>
          <span :class="{ falta: !fila.dosis }">{{ fila.dosis || 'falta' }}</span>
          <span :class="{ falta: !fila.frecuencia }">{{ fila.frecuencia || 'falta' }}</span>
          <span :class="{ falta: !fila.duracion }">{{ fila.duracion || 'falta' }}</span>
          <span :class="{ falta: !fila.via }">{{ fila.via || 'falta' }}</span>
        </div>
      </div>

      <div
        v-if="indicacionesTexto"
        class="indicaciones-generales"
      >
        <span class="etiqueta">Indicaciones generales</span>
        <p>{{ indicacionesTexto }}</p>
      </div>

      <div class="relleno" />

      <div class="pie-hoja">
        <div class="pie-qr">
          <div
            aria-label="Código QR con el id de la receta"
            class="qr"
          >
            QR
          </div>
          <span class="pie-texto">
            Receta<br>
            <span
              v-if="recetaId"
              class="tipo-dato"
            >{{ recetaId }}</span>
            <span v-else>Se asigna al guardar</span>
          </span>
        </div>
        <div class="firma">
          <div class="linea-firma" />
          Firma y sello del médico
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.vista-previa { display: flex; flex-direction: column; gap: var(--espacio-lg); min-width: 0; }
.cabecera-vp { display: flex; justify-content: space-between; align-items: baseline; gap: var(--espacio-md); }
.cabecera-vp h2 { margin: 0; }
.nombre-archivo { font-size: 13px; color: var(--color-texto-secundario); }

.hoja { width: 100%; max-width: 500px; min-height: 708px; box-sizing: border-box; background: var(--color-papel); border-top: 4px solid var(--color-copia-rosa); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); padding: 30px 34px 24px; display: flex; flex-direction: column; gap: var(--espacio-lg); color: var(--color-texto); font-size: 11px; }

.membrete { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1.5px solid var(--color-texto); }
.marca { display: flex; align-items: center; gap: 10px; }
.logo .copia, .logo .hoja-logo { stroke: var(--color-texto); stroke-width: 1.5; }
.logo .copia-rosa { fill: var(--color-copia-rosa); }
.logo .copia-amarilla { fill: var(--color-copia-amarilla); }
.logo .hoja-logo { fill: var(--color-papel); }
.logo .renglones { fill: none; stroke: var(--color-tinta); stroke-width: 1.5; }
.textos-marca { display: flex; flex-direction: column; }
.clinica-nombre { font-size: 15px; font-weight: 800; }
.clinica-datos { font-size: 10px; color: var(--color-texto-secundario); }
.datos-medico { text-align: right; font-size: 11px; line-height: 1.4; }
.datos-medico strong { font-size: 12px; }

.datos-paciente { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--espacio-sm); }
.dato { display: flex; flex-direction: column; gap: 2px; }
.dato-ancho { grid-column: span 2; }
.etiqueta { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario); }
.valor { font-weight: 700; }

.rp { display: flex; flex-direction: column; gap: var(--espacio-sm); }
.rp-titulo { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
.tabla-cabecera, .tabla-fila { display: grid; grid-template-columns: 1.5fr 0.8fr 1fr 0.9fr 0.5fr; gap: var(--espacio-sm); }
.tabla-cabecera { padding-bottom: 5px; border-bottom: 1px solid var(--color-texto); font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario); }
.tabla-fila { padding: 6px 0; border-bottom: 1px solid var(--color-renglon); }
.celda-medicamento { display: flex; flex-direction: column; font-weight: 700; }
.indicaciones-medicamento { font-weight: 400; color: var(--color-texto-secundario); }
.falta { color: var(--color-alerta); font-weight: 700; }

.indicaciones-generales { display: flex; flex-direction: column; gap: 4px; }
.indicaciones-generales p { margin: 0; line-height: 1.5; }

.relleno { flex-grow: 1; }

.pie-hoja { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-lg); }
.pie-qr { display: flex; align-items: flex-end; gap: 10px; }
.qr { width: 64px; height: 64px; box-sizing: border-box; border: 1.5px dashed var(--color-perforacion); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--color-texto-secundario); }
.pie-texto { font-size: 10px; line-height: 1.5; color: var(--color-texto-secundario); }
.firma { width: 180px; text-align: center; font-size: 10px; color: var(--color-texto-secundario); }
.linea-firma { border-top: 1px solid var(--color-texto); margin-bottom: 4px; }
</style>
