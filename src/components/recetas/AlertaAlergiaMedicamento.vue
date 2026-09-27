<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

// Bloque rojo bloqueante bajo un medicamento en conflicto con una alergia del paciente (RF4 del
// spec 018): exige marcar la casilla antes de habilitar "Mantener". "Quitar medicamento" lo
// resuelve quitando la fila (a cargo de quien escucha el evento).
defineProps({
  medicamento: { type: String, required: true },
  alergia: { type: String, required: true }
})

const emit = defineEmits(['mantener', 'quitar'])

const confirmado = ref(false)

function mantener() {
  emit('mantener')
  confirmado.value = false
}
</script>

<template>
  <div
    role="alert"
    class="alerta-alergia"
  >
    <p class="titulo">
      <svg
        class="icono"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 3 2 20h20L12 3Z" />
        <path d="M12 10v4M12 17.5v.01" />
      </svg>
      Posible reacción alérgica
    </p>
    <p class="texto">
      El paciente es alérgico a <strong>{{ alergia }}</strong> y <strong>{{ medicamento }}</strong> puede
      producir una reacción cruzada. No se puede guardar hasta resolverlo.
    </p>
    <div class="acciones">
      <label class="confirmar">
        <input
          v-model="confirmado"
          type="checkbox"
        >
        Revisé la alergia y mantengo la indicación
      </label>
      <div class="botones">
        <Button
          type="button"
          label="Mantener"
          outlined
          :disabled="!confirmado"
          @click="mantener"
        />
        <Button
          type="button"
          label="Quitar medicamento"
          @click="$emit('quitar')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerta-alergia { display: flex; flex-direction: column; gap: var(--espacio-md); margin-top: var(--espacio-md); padding: var(--espacio-lg); background: var(--color-papel); border-top: 1px solid var(--color-alerta); }
.titulo { display: flex; align-items: center; gap: var(--espacio-sm); margin: 0; font-size: 16px; font-weight: 800; color: var(--color-alerta); }
.texto { margin: 0; font-size: 14px; line-height: 1.5; }
.acciones { display: flex; justify-content: space-between; align-items: center; gap: var(--espacio-lg); flex-wrap: wrap; }
.confirmar { display: flex; align-items: center; gap: var(--espacio-sm); font-size: 14px; cursor: pointer; }
.confirmar input { width: 20px; height: 20px; margin: 0; accent-color: var(--color-alerta); }
.botones { display: flex; gap: var(--espacio-sm); }

@media (max-width: 1023px) {
  .acciones { flex-direction: column; align-items: flex-start; }
}
</style>
