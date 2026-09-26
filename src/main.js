import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import App from '@/App.vue'
import router from '@/router/index.js'
import { inicializarDatos } from '@/services/semillaService.js'

// La semilla debe existir antes de que los stores lean del storage.
inicializarDatos()

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue) // sin tema: el diseño lo aporta el usuario
  .use(ToastService)
  .use(ConfirmationService)
  .mount('#app')
