<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth.js'
import { validarLogin } from '@/utils/validaciones.js'
import { INICIO_POR_ROL } from '@/utils/roles.js'
import { formatearFecha } from '@/utils/formato.js'
import MarcaClinica from '@/components/comunes/MarcaClinica.vue'
import HojaCopias from '@/components/comunes/HojaCopias.vue'
import CampoError from '@/components/comunes/CampoError.vue'

// Leyenda de las tres copias que genera cada atención.
const LEYENDA = [
  { clase: 'muestra-papel', titulo: 'Original', detalle: 'la consulta: motivo, signos vitales, diagnóstico y plan' },
  { clase: 'muestra-amarilla', titulo: 'Copia amarilla', detalle: 'la historia clínica, en orden cronológico' },
  { clase: 'muestra-rosa', titulo: 'Copia rosa', detalle: 'la receta en PDF, para descargar o imprimir' }
]

const router = useRouter()
const authStore = useAuthStore()

const fechaHoy = formatearFecha(new Date())
const formulario = reactive({ email: '', password: '' })
const errores = ref({})
const mostrarPassword = ref(false)
const campoEmail = ref(null)
const campoPassword = ref(null)

async function enviar() {
  errores.value = validarLogin(formulario)
  if (Object.keys(errores.value).length) {
    // El correo se revisa antes que la contraseña.
    await nextTick()
    const campoConFoco = errores.value.email ? campoEmail : campoPassword
    campoConFoco.value?.$el.focus()
    return
  }

  if (authStore.iniciarSesion(formulario.email, formulario.password)) {
    router.push(INICIO_POR_ROL[authStore.sesion.rol])
  }
}
</script>

<template>
  <main class="login">
    <div class="presentacion">
      <MarcaClinica />
      <h1 class="tipo-display">Una consulta,<br>tres copias.</h1>
      <p class="bajada">El médico dicta y la hoja se llena. Al confirmar, la historia clínica y la receta salen de la misma atención.</p>
      <ul class="leyenda">
        <li
          v-for="item in LEYENDA"
          :key="item.titulo"
        >
          <span :class="['muestra', item.clase]" aria-hidden="true" />
          <p><strong>{{ item.titulo }}</strong> <span class="detalle">· {{ item.detalle }}</span></p>
        </li>
      </ul>
    </div>

    <HojaCopias class="columna-formulario">
      <form
        novalidate
        @submit.prevent="enviar"
      >
        <div class="encabezado">
          <h2 class="titulo-ingresar">Ingresar</h2>
          <span class="tipo-dato fecha">{{ fechaHoy }}</span>
        </div>

        <div :class="['campo', { 'campo-con-error': errores.email }]">
          <label for="login-email">Correo electrónico</label>
          <InputText
            id="login-email"
            ref="campoEmail"
            v-model="formulario.email"
            type="email"
            autocomplete="username"
            :invalid="!!errores.email"
            :aria-describedby="errores.email ? 'login-email-error' : undefined"
          />
          <CampoError id="login-email-error" :mensaje="errores.email" />
        </div>

        <div :class="['campo', { 'campo-con-error': errores.password }]">
          <label for="login-password">Contraseña</label>
          <div class="contenedor-password">
            <InputText
              id="login-password"
              ref="campoPassword"
              v-model="formulario.password"
              :type="mostrarPassword ? 'text' : 'password'"
              class="campo-password-input"
              autocomplete="current-password"
              :invalid="!!errores.password"
              :aria-describedby="errores.password ? 'login-password-error' : undefined"
            />
            <Button
              type="button"
              text
              class="boton-ojo"
              aria-controls="login-password"
              :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="mostrarPassword = !mostrarPassword"
            >
              <svg class="icono" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                <path v-if="mostrarPassword" d="M3 3l18 18" />
              </svg>
            </Button>
          </div>
          <CampoError id="login-password-error" :mensaje="errores.password" />
        </div>

        <p
          v-if="authStore.error"
          role="alert"
          class="error-credenciales"
        >
          <svg class="icono" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16.5" x2="12" y2="16.5" />
          </svg>
          <span>{{ authStore.error }}<br>Revise el correo y la contraseña, o use una cuenta de demostración.</span>
        </p>

        <Button
          type="submit"
          label="Ingresar"
          class="boton-ingresar"
          :disabled="authStore.cargando"
        />

        <div class="cuentas-demo">
          <p class="cuentas-titulo">Cuentas de demostración</p>
          <p class="tipo-dato cuentas-lista">recepcion@clinica.com<br>medico1@clinica.com · medico2 · medico3</p>
          <p class="cuentas-password">Contraseña de todas: <span class="tipo-dato cuentas-valor">123456</span></p>
        </div>

        <p class="pie">Proyecto académico. Los datos se guardan solo en este navegador.</p>
      </form>
    </HojaCopias>
  </main>
</template>

<style scoped>
.login { display: grid; grid-template-columns: minmax(0, 1fr) 452px; gap: 104px; align-items: center; min-height: 100vh; padding: 72px 120px; }
@media (max-width: 1365px) { .login { padding-inline: 48px; } }
@media (max-width: 1199px) {
  .login { grid-template-columns: 1fr; max-width: 560px; min-height: auto; margin-inline: auto; padding: 48px 24px; }
  .columna-formulario { max-width: 452px; width: 100%; margin-inline: auto; }
}
.presentacion { display: flex; flex-direction: column; gap: var(--espacio-2xl); max-width: 560px; }
.bajada { margin: 0; font-size: 18px; line-height: 1.55; color: var(--color-texto-secundario); max-width: 44ch; }
.leyenda { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px; }
.leyenda li { display: flex; align-items: center; gap: 14px; }
.leyenda p { margin: 0; font-size: 15px; line-height: 1.4; }
.detalle { color: var(--color-texto-secundario); }
.muestra { width: 26px; height: 32px; flex-shrink: 0; border: 1.5px solid var(--color-texto); border-radius: var(--radio-sm); }
.muestra-papel { background: var(--color-papel); }
.muestra-amarilla { background: var(--color-copia-amarilla); }
.muestra-rosa { background: var(--color-copia-rosa); }
.columna-formulario form { display: flex; flex-direction: column; gap: 22px; }
.encabezado { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 18px; border-bottom: 2px dotted var(--color-perforacion); }
.titulo-ingresar { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
.fecha { font-size: 14px; color: var(--color-texto-secundario); }
.contenedor-password { position: relative; }
.campo-password-input { width: 100%; padding-right: 48px; }
.boton-ojo { position: absolute; top: 0; right: 0; width: 44px; height: 44px; color: var(--color-texto-secundario); }
.error-credenciales { margin: 0; display: flex; align-items: flex-start; gap: 8px; color: var(--color-alerta); font-weight: 600; }
.boton-ingresar { width: 100%; height: 48px; font-size: 16px; box-shadow: var(--sombra-boton); margin-top: 4px; }
.cuentas-demo { background: var(--color-campo); border-radius: var(--radio-md); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.cuentas-titulo { margin: 0; font-size: 13px; font-weight: 700; }
.cuentas-lista { margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-texto); }
.cuentas-password { margin: 0; font-size: 13px; color: var(--color-texto-secundario); }
.cuentas-valor { color: var(--color-texto); font-weight: 700; }
.pie { margin: 0; font-size: 12px; line-height: 1.5; color: var(--color-texto-secundario); }
</style>
