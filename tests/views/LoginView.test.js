import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { inicializarDatos } from '@/services/semillaService.js'

// Monta LoginView con el router real (módulo nuevo por caso).
async function montarLogin() {
  const { default: router } = await import('@/router/index.js')
  const { default: LoginView } = await import('@/views/LoginView.vue')
  const contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  createApp(LoginView).use(createPinia()).use(router).use(PrimeVue).use(ToastService).mount(contenedor)
  await router.push('/login')
  await router.isReady()
  return { router, contenedor }
}

function completarFormulario(contenedor, email, password) {
  for (const [id, valor] of [['#login-email', email], ['#login-password', password]]) {
    const campo = contenedor.querySelector(id)
    campo.value = valor
    campo.dispatchEvent(new Event('input'))
  }
}

async function enviarFormulario(contenedor) {
  contenedor.querySelector('form').dispatchEvent(new Event('submit'))
  await nextTick()
  // Deja resolver la navegación y el foco (incluye redirects y guards).
  await new Promise((resolver) => setTimeout(resolver, 50))
}

async function iniciarSesionEnVista(email, password) {
  const { router, contenedor } = await montarLogin()
  completarFormulario(contenedor, email, password)
  await enviarFormulario(contenedor)
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

describe('LoginView: validación del formulario', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    inicializarDatos()
  })

  it('con el formulario vacío, marca ambos campos y mueve el foco al correo', async () => {
    const { router, contenedor } = await montarLogin()
    await enviarFormulario(contenedor)

    expect(router.currentRoute.value.path).toBe('/login')

    const email = contenedor.querySelector('#login-email')
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(email.getAttribute('aria-describedby')).toBe('login-email-error')
    expect(contenedor.querySelector('#login-email-error').textContent).toContain('El correo es obligatorio.')

    const password = contenedor.querySelector('#login-password')
    expect(password.getAttribute('aria-invalid')).toBe('true')
    expect(contenedor.querySelector('#login-password-error').textContent).toContain('La contraseña es obligatoria.')

    expect(document.activeElement).toBe(email)
  })

  it('no marca aria-invalid en los campos cuando el envío es válido', async () => {
    const { contenedor } = await iniciarSesionEnVista('recepcion@clinica.com', '123456')
    expect(contenedor.querySelector('#login-email').hasAttribute('aria-invalid')).toBe(false)
    expect(contenedor.querySelector('#login-password').hasAttribute('aria-invalid')).toBe(false)
  })

  it('no marca aria-invalid en la contraseña cuando solo falla el correo', async () => {
    const { contenedor } = await montarLogin()
    completarFormulario(contenedor, '', '123456')
    await enviarFormulario(contenedor)
    expect(contenedor.querySelector('#login-password').hasAttribute('aria-invalid')).toBe(false)
  })
})

describe('LoginView: mostrar/ocultar contraseña', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    inicializarDatos()
  })

  it('alterna el tipo del campo y el aria-label del botón del ojo', async () => {
    const { contenedor } = await montarLogin()
    const password = contenedor.querySelector('#login-password')
    const boton = contenedor.querySelector('[aria-controls="login-password"]')

    expect(password.getAttribute('type')).toBe('password')
    expect(boton.getAttribute('aria-label')).toBe('Mostrar contraseña')

    boton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(password.getAttribute('type')).toBe('text')
    expect(boton.getAttribute('aria-label')).toBe('Ocultar contraseña')

    boton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(password.getAttribute('type')).toBe('password')
    expect(boton.getAttribute('aria-label')).toBe('Mostrar contraseña')
  })
})
