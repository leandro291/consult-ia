<script setup>
import IconoAlergia from '@/components/citas/IconoAlergia.vue'
</script>

<template>
  <div class="leyenda">
    <span class="item"><span
      class="muestra programada"
      aria-hidden="true"
    />Programada</span>
    <span class="item"><span
      class="muestra confirmada"
      aria-hidden="true"
    />Confirmada</span>
    <span class="item"><span
      class="muestra atendida"
      aria-hidden="true"
    />Atendida</span>
    <span class="item"><span
      class="muestra cancelada"
      aria-hidden="true"
    /><span class="tachado">Cancelada</span></span>
    <span class="item"><span
      class="muestra no-asistio"
      aria-hidden="true"
    />No asistió</span>
    <span class="item"><IconoAlergia />Paciente con alergias</span>
    <span class="relleno" />
    <!-- ponytail: texto fijo; si el horario se vuelve configurable, leerlo de los médicos. -->
    <span>Horario de atención: <span class="dato">Lun–Sáb 08:00–14:00</span></span>
  </div>
</template>

<style scoped>
.leyenda { display: flex; align-items: center; flex-wrap: wrap; gap: var(--espacio-lg); padding: 14px 20px; border-top: 1px solid var(--color-linea); font-size: 13px; color: var(--color-texto-secundario); }
.item { display: inline-flex; align-items: center; gap: 6px; }
.muestra { width: 16px; height: 12px; border-radius: 2px; }
.programada { border: 1.5px solid var(--color-tinta); }
.confirmada { background: var(--color-tinta); }
.atendida { background: var(--color-sello-suave); border: 1px solid var(--color-sello); }
.cancelada { background: var(--color-apagado); }
.no-asistio { border: 1.5px dashed var(--color-texto-secundario); }
.tachado { text-decoration: line-through; }
.item .icono { color: var(--color-alerta); }
.relleno { flex-grow: 1; }
.dato { font-family: var(--fuente-dato); color: var(--color-texto); }
</style>
