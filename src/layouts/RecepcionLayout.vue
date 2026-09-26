<script setup>
import MarcoAplicacion from '@/components/comunes/MarcoAplicacion.vue'

const items = [
  { etiqueta: 'Dashboard', ruta: '/recepcion/dashboard' },
  { etiqueta: 'Pacientes', ruta: '/recepcion/pacientes' },
  { etiqueta: 'Médicos', ruta: '/recepcion/medicos' },
  { etiqueta: 'Consultorios', ruta: '/recepcion/consultorios' },
  { etiqueta: 'Agenda', ruta: '/recepcion/agenda' },
  { etiqueta: 'Respaldo', ruta: '/recepcion/respaldo' }
]
</script>

<template>
  <MarcoAplicacion
    titulo="Recepción"
    :items="items"
  />
</template>
