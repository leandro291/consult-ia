<script setup>
import MarcoAplicacion from '@/components/comunes/MarcoAplicacion.vue'

// Las rutas con parámetro (atención, historia, receta) no van en el menú.
const items = [
  { etiqueta: 'Mi agenda', ruta: '/medico/agenda' },
  { etiqueta: 'Configuración IA', ruta: '/medico/configuracion' }
]
</script>

<template>
  <MarcoAplicacion
    titulo="Médico"
    :items="items"
  />
</template>
