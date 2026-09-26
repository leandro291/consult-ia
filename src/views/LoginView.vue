<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.js'
import { validarLogin } from '@/utils/validaciones.js'
import { INICIO_POR_ROL } from '@/utils/roles.js'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const formulario = reactive({ email: '', password: '' })
const errores = ref({})
const mostrarPassword = ref(false)

async function enviar() {
  errores.value = validarLogin(formulario)
  if (Object.keys(errores.value).length) return

  if (authStore.iniciarSesion(formulario.email, formulario.password)) {
    // Ir directo al inicio del rol: '/' redirige a /login (la ruta actual) y vue-router aborta esa navegación.
    router.push(INICIO_POR_ROL[authStore.sesion.rol])
  } else {
    toast.add({ severity: 'error', summary: 'No se pudo ingresar', detail: authStore.error, life: 4000 })
  }
}
</script>

<template>
  <main>
    <h1>Consult-IA</h1>
    <form
      novalidate
      @submit.prevent="enviar"
    >
      <div>
        <label for="login-email">Correo</label>
        <input
          id="login-email"
          v-model="formulario.email"
          type="email"
          autocomplete="username"
        >
        <p v-if="errores.email">
          {{ errores.email }}
        </p>
      </div>
      <div>
        <label for="login-password">Contraseña</label>
        <input
          id="login-password"
          v-model="formulario.password"
          :type="mostrarPassword ? 'text' : 'password'"
          autocomplete="current-password"
        >
        <p v-if="errores.password">
          {{ errores.password }}
        </p>
      </div>
      <div>
        <input
          id="login-mostrar"
          v-model="mostrarPassword"
          type="checkbox"
        >
        <label for="login-mostrar">Mostrar contraseña</label>
      </div>
      <p
        v-if="authStore.error"
        role="alert"
      >
        {{ authStore.error }}
      </p>
      <button
        type="submit"
        :disabled="authStore.cargando"
      >
        Ingresar
      </button>
    </form>
  </main>
</template>
