import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { resolverAcceso } from '@/router/acceso.js'
import LoginView from '@/views/LoginView.vue'
import EnConstruccionView from '@/views/EnConstruccionView.vue'
import ConsultoriosView from '@/views/recepcion/ConsultoriosView.vue'
import PacientesView from '@/views/recepcion/PacientesView.vue'
import PacienteDetalleView from '@/views/recepcion/PacienteDetalleView.vue'
import MedicosView from '@/views/recepcion/MedicosView.vue'
import AgendaView from '@/views/recepcion/AgendaView.vue'
import DashboardView from '@/views/recepcion/DashboardView.vue'
import MiAgendaView from '@/views/medico/MiAgendaView.vue'
import AtencionView from '@/views/medico/AtencionView.vue'
import HistoriaView from '@/views/medico/HistoriaView.vue'
import RecetaView from '@/views/medico/RecetaView.vue'
import RecepcionLayout from '@/layouts/RecepcionLayout.vue'
import MedicoLayout from '@/layouts/MedicoLayout.vue'

// Las hijas heredan meta.rol del layout; usan la vista provisional hasta su fase.
const hija = (path, component = EnConstruccionView) => ({ path, component })

const routes = [
  { path: '/login', component: LoginView, meta: { publica: true } },
  { path: '/', redirect: '/login' },
  {
    path: '/recepcion',
    component: RecepcionLayout,
    meta: { rol: 'recepcion' },
    redirect: '/recepcion/dashboard',
    children: [
      hija('dashboard', DashboardView),
      hija('respaldo'),
      hija('pacientes', PacientesView),
      hija('pacientes/:id', PacienteDetalleView),
      hija('agenda', AgendaView),
      hija('medicos', MedicosView),
      hija('consultorios', ConsultoriosView)
    ]
  },
  {
    path: '/medico',
    component: MedicoLayout,
    meta: { rol: 'medico' },
    redirect: '/medico/agenda',
    children: [
      hija('agenda', MiAgendaView),
      hija('atencion/:citaId', AtencionView),
      hija('historia/:pacienteId', HistoriaView),
      hija('receta/:consultaId', RecetaView),
      hija('configuracion')
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => resolverAcceso(to, useAuthStore().sesion))

export default router
