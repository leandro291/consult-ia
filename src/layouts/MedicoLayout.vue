<script setup>
import MarcoAplicacion from '@/components/comunes/MarcoAplicacion.vue'

// Las rutas con parámetro (atención, historia, receta) no van en el menú.
// icono: trazo de un path SVG de 24x24
const items = [
  { etiqueta: 'Mi agenda', ruta: '/medico/agenda', icono: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 10h18M8 3v4M16 3v4' }
]
</script>

<template>
  <MarcoAplicacion
    etiqueta-rol="Médico"
    etiqueta-menu="Menú del médico"
    :items="items"
  />
</template>
