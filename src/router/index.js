import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { resolverAcceso } from '@/router/acceso.js'
import LoginView from '@/views/LoginView.vue'
import EnConstruccionView from '@/views/EnConstruccionView.vue'
import RecepcionLayout from '@/layouts/RecepcionLayout.vue'
import MedicoLayout from '@/layouts/MedicoLayout.vue'

// Las hijas heredan meta.rol del layout; todas usan la vista provisional hasta su fase.
const hija = (path) => ({ path, component: EnConstruccionView })

const routes = [
  { path: '/login', component: LoginView, meta: { publica: true } },
  { path: '/', redirect: '/login' },
  {
    path: '/recepcion',
    component: RecepcionLayout,
    meta: { rol: 'recepcion' },
    redirect: '/recepcion/dashboard',
    children: [
      'dashboard', 'pacientes', 'pacientes/:id', 'medicos', 'consultorios', 'agenda', 'respaldo'
    ].map(hija)
  },
  {
    path: '/medico',
    component: MedicoLayout,
    meta: { rol: 'medico' },
    redirect: '/medico/agenda',
    children: [
      'agenda', 'atencion/:citaId', 'historia/:pacienteId', 'receta/:consultaId', 'configuracion'
    ].map(hija)
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => resolverAcceso(to, useAuthStore().sesion))

export default router
