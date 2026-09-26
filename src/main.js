import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import '@/assets/main.css'
import presetClinica from '@/assets/presetClinica.js'
import App from '@/App.vue'
import router from '@/router/index.js'
import { inicializarDatos } from '@/services/semillaService.js'

// La semilla debe existir antes de que los stores lean del storage.
inicializarDatos()

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: presetClinica,
      options: {
        darkModeSelector: false, // DESIGN.md prohíbe el modo oscuro por defecto
        cssLayer: { name: 'primevue', order: 'base, primevue' }
      }
    }
  })
  .use(ToastService)
  .use(ConfirmationService)
  .mount('#app')
