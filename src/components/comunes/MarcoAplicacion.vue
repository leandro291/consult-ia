<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

defineProps({
  titulo: { type: String, required: true },
  // [{ etiqueta, ruta }]
  items: { type: Array, required: true }
})

const router = useRouter()
const authStore = useAuthStore()

function salir() {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div>
    <header>
      <strong>Consult-IA</strong>
      <span>{{ titulo }}</span>
      <span>{{ authStore.sesion?.nombre }}</span>
      <button
        type="button"
        @click="salir"
      >
        Cerrar sesión
      </button>
    </header>
    <nav>
      <RouterLink
        v-for="item in items"
        :key="item.ruta"
        :to="item.ruta"
      >
        {{ item.etiqueta }}
      </RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>
