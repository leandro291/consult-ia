<script setup>
import MarcoAplicacion from '@/components/comunes/MarcoAplicacion.vue'

// icono: trazo de un path SVG de 24x24
const items = [
  { etiqueta: 'Panel del día', ruta: '/recepcion/dashboard', icono: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z' },
  { etiqueta: 'Agenda', ruta: '/recepcion/agenda', icono: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 10h18M8 3v4M16 3v4' },
  { etiqueta: 'Pacientes', ruta: '/recepcion/pacientes', icono: 'M5.5 8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 6' },
  { etiqueta: 'Médicos', ruta: '/recepcion/medicos', icono: 'M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2M18 11a2 2 0 1 0 4 0 2 2 0 1 0-4 0' },
  { etiqueta: 'Consultorios', ruta: '/recepcion/consultorios', icono: 'M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M14 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0' },
  { etiqueta: 'Respaldo', ruta: '/recepcion/respaldo', icono: 'M4 4h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4' }
]
</script>

<template>
  <MarcoAplicacion
    etiqueta-rol="Recepción"
    etiqueta-menu="Menú de recepción"
    :items="items"
  />
</template>
