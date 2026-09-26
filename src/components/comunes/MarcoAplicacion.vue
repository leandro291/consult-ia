<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import MarcaClinica from '@/components/comunes/MarcaClinica.vue'

defineProps({
  // Etiqueta del rol que se muestra bajo la marca
  etiquetaRol: { type: String, required: true },
  // aria-label del nav
  etiquetaMenu: { type: String, required: true },
  // [{ etiqueta, ruta, icono }] — icono: trazo "d" de un path SVG de 24x24
  items: { type: Array, required: true }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Activo también en subrutas (/recepcion/pacientes/:id → Pacientes)
function esActivo(item) {
  return route.path === item.ruta || route.path.startsWith(`${item.ruta}/`)
}

// Primera letra de las dos primeras palabras, sin tratamientos ("Dra.")
const iniciales = computed(() =>
  (authStore.sesion?.nombre ?? '')
    .split(/\s+/)
    .filter((palabra) => palabra && !palabra.endsWith('.'))
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
)

function salir() {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="marco">
    <aside class="menu">
      <MarcaClinica
        class="marca"
        :etiqueta="etiquetaRol"
      />

      <nav :aria-label="etiquetaMenu">
        <ul class="lista">
          <li
            v-for="item in items"
            :key="item.ruta"
          >
            <RouterLink
              :to="item.ruta"
              class="item"
              :class="{ activo: esActivo(item) }"
              :aria-current="esActivo(item) ? 'page' : null"
            >
              <svg
                class="icono"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path :d="item.icono" />
              </svg>
              <span class="texto-menu">{{ item.etiqueta }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="pie">
        <div class="usuario">
          <span
            class="iniciales"
            aria-hidden="true"
          >{{ iniciales }}</span>
          <span class="nombre-usuario texto-menu">{{ authStore.sesion?.nombre }}</span>
        </div>
        <button
          type="button"
          class="salir"
          @click="salir"
        >
          <svg
            class="icono"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
          </svg>
          <span class="texto-menu">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="contenido">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.marco {
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr);
  min-height: 100vh;
}

.menu {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 16px;
  background: var(--color-papel);
  border-right: 1px solid var(--color-linea);
}

.marca {
  padding: 0 8px;
  gap: 10px;
}

.marca :deep(.logo) {
  width: 30px;
  height: 30px;
}

.marca :deep(.nombre) {
  font-size: 16px;
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espacio-xs);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--espacio-md);
  height: 44px;
  padding: 0 var(--espacio-md);
  border-radius: var(--radio-md);
  color: var(--color-texto);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.item:hover {
  background: var(--color-campo);
  color: var(--color-texto);
}

.item.activo,
.item.activo:hover {
  background: var(--color-tinta-suave);
  color: var(--color-tinta);
  font-weight: 700;
}

.pie {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--espacio-md);
  padding-top: var(--espacio-lg);
  border-top: 2px dotted var(--color-perforacion);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
}

.iniciales {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-texto);
  color: var(--color-papel);
  font-size: 13px;
  font-weight: 700;
}

.nombre-usuario {
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
}

.salir {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 var(--espacio-md);
  background: none;
  border: none;
  border-radius: var(--radio-md);
  color: var(--color-texto);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.salir:hover {
  background: var(--color-campo);
}

.contenido {
  min-width: 0;
}

/* Tablet: solo íconos. Los textos siguen disponibles para lectores de pantalla. */
@media (max-width: 1023px) {
  .marco {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .menu {
    padding: 24px 12px;
    align-items: center;
  }

  .marca {
    padding: 0;
  }

  .marca :deep(.textos),
  .texto-menu {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .item,
  .salir {
    width: 44px;
    justify-content: center;
    padding: 0;
  }

  .usuario {
    padding: 0;
  }
}
</style>
