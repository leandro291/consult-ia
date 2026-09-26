import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { inicializarDatos } from '@/services/semillaService.js'

// Monta LoginView con el router real (módulo nuevo por caso) y envía el formulario.
async function iniciarSesionEnVista(email, password) {
  const { default: router } = await import('@/router/index.js')
  const { default: LoginView } = await import('@/views/LoginView.vue')
  const contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  createApp(LoginView).use(createPinia()).use(router).use(PrimeVue).use(ToastService).mount(contenedor)
  await router.push('/login')
  await router.isReady()

  for (const [id, valor] of [['#login-email', email], ['#login-password', password]]) {
    const campo = contenedor.querySelector(id)
    campo.value = valor
    campo.dispatchEvent(new Event('input'))
  }
  contenedor.querySelector('form').dispatchEvent(new Event('submit'))
  await nextTick()
  // Deja resolver la navegación (incluye redirects y guards).
  await new Promise((resolver) => setTimeout(resolver, 50))
  return { ruta: router.currentRoute.value.path, contenedor }
}

describe('LoginView: redirección tras iniciar sesión', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    inicializarDatos()
  })

  it('lleva a recepción al ingresar como recepcionista', async () => {
    expect((await iniciarSesionEnVista('recepcion@clinica.com', '123456')).ruta).toBe('/recepcion/dashboard')
  })

  it('lleva a la agenda al ingresar como médico', async () => {
    expect((await iniciarSesionEnVista('medico1@clinica.com', '123456')).ruta).toBe('/medico/agenda')
  })

  it('con credenciales incorrectas permanece en /login y muestra el error en el DOM', async () => {
    const { ruta, contenedor } = await iniciarSesionEnVista('recepcion@clinica.com', 'incorrecta')
    expect(ruta).toBe('/login')
    const alerta = contenedor.querySelector('[role="alert"]')
    expect(alerta).not.toBeNull()
    expect(alerta.textContent.trim().length).toBeGreaterThan(0)
  })
})
