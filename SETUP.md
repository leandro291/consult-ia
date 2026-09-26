# SETUP.md — Arquitectura, instalación y convenciones

Este archivo es la **fuente de verdad** para lo siguiente:
- Estructura de carpetas.
- Dependencias.
- Comandos.
- Nombres.

Toda nueva carpeta, archivo o dependencia debe seguirlo. Si algo nuevo no encaja, se actualiza este archivo **dentro del mismo spec** antes de implementarlo (ver `CLAUDE.md`).

---

## Arquitectura

### Capas y dependencias permitidas

```
┌─────────────┐
│   views/    │  Pantallas por ruta. Delgadas: arman componentes y llaman stores/composables.
└──────┬──────┘
       │ usa
┌──────▼──────┐     ┌──────────────┐
│ components/ │     │ composables/ │  Lógica reactiva reutilizable (useXxx).
└──────┬──────┘     └──────┬───────┘
       │ usa               │ usa
┌──────▼───────────────────▼──────┐
│            stores/              │  Pinia, uno por dominio. Estado + cargando + error.
└──────────────┬──────────────────┘
               │ llama
┌──────────────▼──────────────────┐
│           services/             │  CRUD y reglas de negocio. Lanzan Error en español.
└──────────────┬──────────────────┘
               │ único acceso
┌──────────────▼──────────────────┐
│   services/storage.js → localStorage
└─────────────────────────────────┘
```

| Capa | Puede importar | No puede importar |
|---|---|---|
| `views/` | components, composables, stores, utils | services, storage |
| `layouts/` | components, composables, stores, utils | services, storage |
| `components/` | components, composables, stores, utils | services, storage |
| `composables/` | stores, services, utils | views, components |
| `stores/` | su propio servicio, utils | `localStorage` directo, views, components |
| `services/` | `storage.js`, otros services, utils, data | Vue, Pinia, `localStorage` directo (salvo `storage.js`) |
| `utils/`, `data/` | nada del proyecto (funciones puras) | todo lo demás |
| `pdf/` | utils, data | stores, services |
| `router/` | views, layouts, stores, utils, `acceso.js` | services |
| `main.js` | todo (raíz de composición) | — |

> ¿Por qué? Si en el futuro hay un backend HTTP, solo se reemplaza `services/`. Lo demás no cambia.

### Árbol de carpetas

```
consult-ia/
├── CLAUDE.md                 # Reglas del proyecto, dominio y metodología SDD
├── SETUP.md                  # Este archivo: arquitectura, instalación, convenciones
├── README.md                 # Presentación del proyecto y limitaciones (fase 6)
├── PRODUCT.md                # Contexto de producto (usuarios, propósito, principios)
├── DESIGN.md                 # Sistema de diseño: tokens, componentes y reglas visuales
├── index.html                # Punto de entrada de Vite
├── package.json
├── vite.config.js            # Config de Vite + Vitest (environment: jsdom)
├── eslint.config.js          # ESLint flat config (JS + Vue)
├── .gitignore
│
├── .claude/
│   └── agents/               # Subagentes SDD: orquestador, spec-writer, developer, reviewer
│
├── specs/                    # Specs SDD: NNN-nombre-en-kebab.md
│
├── docs/
│   └── diseno/               # Guía de pantallas y fuentes del canvas de diseño (referencia, no se compila)
│
├── public/                   # Archivos estáticos servidos tal cual (favicon, logo)
│
├── src/
│   ├── main.js               # Crea la app, registra Router, Pinia, PrimeVue; ejecuta la semilla
│   ├── App.vue               # Raíz: <RouterView>, Toast y ConfirmDialog globales
│   │
│   ├── router/
│   │   ├── index.js          # Rutas con meta.rol + guard global de sesión y rol
│   │   └── acceso.js         # resolverAcceso(): decisión pura del guard
│   │
│   ├── services/             # Única capa con persistencia
│   │   ├── storage.js        # leer(clave, porDefecto = []), guardar(clave, datos), CLAVES: único acceso a localStorage
│   │   ├── semillaService.js # cargarSemilla, inicializarDatos (persiste los datos de seed.js)
│   │   ├── pacientesService.js
│   │   ├── medicosService.js
│   │   ├── consultoriosService.js
│   │   ├── citasService.js   # Incluye validación de solapamiento y horario
│   │   ├── consultasService.js
│   │   ├── recetasService.js
│   │   ├── authService.js    # login, logout, sesionActual
│   │   ├── respaldoService.js # Exportar e importar JSON (sin iaApiKey)
│   │   └── iaService.js      # Config IA (clinica_config), fetch a Claude y validación
│   │
│   ├── stores/               # Pinia, uno por dominio + auth
│   │   ├── auth.js
│   │   ├── pacientes.js
│   │   ├── medicos.js
│   │   ├── consultorios.js
│   │   ├── citas.js
│   │   ├── consultas.js
│   │   └── recetas.js
│   │
│   ├── composables/          # Lógica reactiva reutilizable
│   │   ├── useFecha.js
│   │   ├── useConfirmacion.js
│   │   ├── useDictado.js     # Envoltura de Web Speech API
│   │   └── useAsistenteConsulta.js # Orquesta dictado → IA → formulario
│   │
│   ├── layouts/              # Un layout por rol (menú + <RouterView>)
│   │   ├── RecepcionLayout.vue
│   │   └── MedicoLayout.vue
│   │
│   ├── views/                # Una vista por ruta
│   │   ├── LoginView.vue
│   │   ├── EnConstruccionView.vue # Provisional para rutas de fases futuras
│   │   ├── recepcion/        # DashboardView, PacientesView, AgendaView, ...
│   │   └── medico/           # MiAgendaView, AtencionView, HistoriaView, ...
│   │
│   ├── components/           # Componentes reutilizables, agrupados por dominio
│   │   ├── comunes/          # Piezas genéricas (MarcoAplicacion, AlertaAlergias, CampoError, ...)
│   │   ├── pacientes/        # PacienteForm.vue, ...
│   │   ├── citas/
│   │   ├── consultas/
│   │   ├── recetas/
│   │   └── asistente/        # PanelAsistente, BotonMicrofono, ...
│   │
│   ├── pdf/                  # Plantillas pdfmake
│   │   ├── comunes.js        # Membrete, estilos y pie compartidos
│   │   ├── recetaPdf.js
│   │   └── historiaPdf.js
│   │
│   ├── data/                 # Datos estáticos
│   │   ├── seed.js           # Datos semilla + transcripción de demo
│   │   └── cie10.js          # Lista reducida de códigos CIE-10
│   │
│   ├── utils/                # Funciones puras, sin Vue ni persistencia
│   │   ├── validaciones.js
│   │   ├── formato.js
│   │   ├── roles.js          # Ruta de inicio por rol
│   │   ├── alergias.js       # Cruce receta vs alergias (local, sin IA)
│   │   └── anonimizar.js     # Quita datos identificables antes de llamar a la IA
│   │
│   └── assets/               # Imágenes importadas desde el código (el diseño lo aporta el usuario)
│
└── tests/                    # Vitest, replica la estructura de src/
    ├── services/             # citasService.test.js, pacientesService.test.js, ...
    ├── router/               # acceso.test.js
    ├── views/                # LoginView.test.js
    ├── data/                 # seed.test.js
    ├── utils/                # alergias.test.js, anonimizar.test.js, validaciones.test.js
    └── composables/          # Solo cuando la lógica no dependa del navegador real
```

**Qué se testea (mínimo):**
- Reglas de negocio de `services/`:
  - Solapamiento de citas.
  - Horario.
  - DNI único.
  - Estados de cita.
  - Receta ligada a consulta.
- Todas las funciones de `utils/`.
- Validación y extracción del JSON de `iaService.js`, con `fetch` simulado.

Los componentes visuales no requieren tests unitarios.

---

## Instalación y comandos

> Estado actual: **fase 1 implementada**. El proyecto Vue está generado (Vite + Vue 3 en JS, Router, Pinia, PrimeVue sin tema, login simulado, layouts por rol y datos semilla). Las rutas de fases futuras usan `EnConstruccionView.vue`.

### Instalación por fase

No se usa `npm create vite`: los archivos base se escriben a mano y cada fase instala solo lo que usa.

```bash
# Fase 1
npm install vue vue-router pinia primevue dayjs
npm install -D vite @vitejs/plugin-vue eslint @eslint/js eslint-plugin-vue globals vitest jsdom

# Fase 3 (agenda)
npm install @fullcalendar/vue3 @fullcalendar/core @fullcalendar/daygrid \
  @fullcalendar/timegrid @fullcalendar/interaction

# Fase 5 (PDFs)
npm install pdfmake

# Opcionales (solo si el spec de la fase lo requiere)
npm install qrcode chart.js vue-chartjs
```

Si se incorpora un tema o íconos de PrimeVue, se documentan aquí en el spec correspondiente.

### Scripts de `package.json`

| Script | Comando | Uso |
|---|---|---|
| `dev` | `vite` | Servidor de desarrollo |
| `build` | `vite build` | Build de producción en `dist/` |
| `preview` | `vite preview` | Sirve el build localmente |
| `lint` | `eslint .` | Lint de JS y Vue |
| `test` | `vitest` | Tests en modo watch; `npm run test -- --run` para una sola pasada (la que usan developer y reviewer) |

### Configuración mínima esperada

**`eslint.config.js`**

```js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } }
]
```

**`vite.config.js`**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom' }
})
```

Los imports internos usan el alias `@/` (ej. `import { leer } from '@/services/storage.js'`).

---

## Dependencias

### Runtime

| Paquete | Propósito |
|---|---|
| `vue` | Framework (Composition API, `<script setup>`) |
| `vue-router` | Rutas y guard de roles |
| `pinia` | Estado global, un store por dominio |
| `primevue` | Componentes UI (Toast, ConfirmDialog, DataTable, Dialog, …), sin tema: el diseño lo aporta el usuario |
| `@fullcalendar/vue3`, `@fullcalendar/core` | Calendario de citas |
| `@fullcalendar/daygrid`, `@fullcalendar/timegrid` | Vistas de mes, semana y día |
| `@fullcalendar/interaction` | Arrastrar para reprogramar y hacer clic para crear |
| `dayjs` | Manejo de fechas (locale `es`) |
| `pdfmake` | PDF de receta e historia clínica |
| `qrcode` *(opcional)* | QR con el id de la receta |
| `chart.js`, `vue-chartjs` *(opcional)* | Gráficos del dashboard |

**Sin dependencia**, se usan APIs nativas:
- Web Speech API para el dictado.
- `fetch` para la API de Claude.
- `crypto.randomUUID()` para los ids.
- `localStorage` para la persistencia.

### Desarrollo

| Paquete | Propósito |
|---|---|
| `vite`, `@vitejs/plugin-vue` | Build y servidor de desarrollo |
| `eslint`, `@eslint/js`, `globals` | Lint de JavaScript |
| `eslint-plugin-vue` | Reglas de lint para archivos `.vue` |
| `vitest` | Tests unitarios (usa la config de Vite) |
| `jsdom` | Simula el navegador (`localStorage`, `window`) en los tests |

Para agregar una dependencia nueva hace falta:
1. Justificarla en un spec.
2. Agregarla a estas tablas.

---

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componente | `PascalCase.vue`, dos palabras o más | `PacienteForm.vue`, `AlertaAlergias.vue` |
| Vista (ruta) | `PascalCase` + `View.vue` | `AgendaView.vue`, `AtencionView.vue` |
| Layout | `PascalCase` + `Layout.vue` | `MedicoLayout.vue` |
| Composable | `use` + `PascalCase.js`, exporta función homónima | `useDictado.js` → `useDictado()` |
| Servicio | `camelCase` + `Service.js` | `citasService.js` |
| Store | `camelCase.js` en plural, exporta `use<Dominio>Store` | `citas.js` → `useCitasStore` |
| Util / data / pdf | `camelCase.js` | `anonimizar.js`, `recetaPdf.js` |
| Test | mismo nombre que el archivo + `.test.js` | `citasService.test.js` |
| Spec | `NNN-nombre-en-kebab.md` | `003-agenda-citas.md` |
| Agente | `kebab-case.md` | `spec-writer.md` |
| Clave de localStorage | `clinica_` + entidad en plural, `snake_case` | `clinica_citas` |
| Ruta | minúsculas, segmentos en español | `/medico/atencion/:citaId` |
| Variables y funciones | `camelCase` **en español** | `citasDelDia`, `validarSolapamiento()` |
| Constantes | `UPPER_SNAKE_CASE` | `DURACION_CITA_MIN` |
| Eventos de componente | `kebab-case` en español | `@guardar`, `@cita-cancelada` |

**Idioma:** todo en español (identificadores, textos, errores, comentarios y commits). Las excepciones son las palabras reservadas y las APIs de librerías.
