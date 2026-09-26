import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Preset de PrimeVue (base Aura) con los tokens de DESIGN.md.
// Todos los colores son variables CSS de main.css: sin valores de color literales.
//
// Nota de compatibilidad: RF4 describía la escala "primary" y la de "surface" bajo
// `colorScheme.light.*`, estructura de versiones anteriores de @primeuix/themes.
// En la versión instalada (3.0.1, para primevue@5) Aura no tiene esa clave: los
// esquemas claro/oscuro se resuelven con la función CSS `light-dark()` dentro de cada
// token, y `definePreset` solo mezcla el árbol de `semantic`/`components` (ver README
// del paquete). Por eso los mismos valores se declaran directo en `semantic.primary`,
// `semantic.surface`, `semantic.focusRing` y `semantic.formField`, que es donde los
// componentes (Button, InputText) ya los leen. El resultado visual es el mismo que
// pedía RF4; el modo oscuro se desactiva aparte, con `darkModeSelector` en main.js.
export default definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--color-tinta-suave)',
      100: 'var(--color-tinta-clara)',
      200: 'var(--color-tinta-clara)',
      300: 'var(--color-tinta-clara)',
      400: 'var(--color-tinta-clara)',
      500: 'var(--color-tinta)',
      600: 'var(--color-tinta-oscura)',
      700: 'var(--color-tinta-oscura)',
      800: 'var(--color-tinta-oscura)',
      900: 'var(--color-tinta-oscura)',
      950: 'var(--color-tinta-oscura)',
      color: 'var(--color-tinta)',
      contrastColor: 'var(--color-papel)',
      hoverColor: 'var(--color-tinta-oscura)',
      activeColor: 'var(--color-tinta-oscura)'
    },
    surface: {
      0: 'var(--color-papel)',
      50: 'var(--color-lapiz-suave)',
      100: 'var(--color-campo)',
      200: 'var(--color-apagado)',
      300: 'var(--color-renglon)',
      400: 'var(--color-linea)',
      500: 'var(--color-perforacion)',
      600: 'var(--color-lapiz)',
      700: 'var(--color-texto-secundario)',
      800: 'var(--color-texto)',
      900: 'var(--color-texto)',
      950: 'var(--color-texto)'
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--color-tinta)',
      offset: '2px',
      shadow: 'none'
    },
    formField: {
      background: 'var(--color-campo)',
      color: 'var(--color-texto)',
      borderColor: 'var(--color-texto)',
      hoverBorderColor: 'var(--color-texto)',
      focusBorderColor: 'var(--color-tinta)',
      invalidBorderColor: 'var(--color-alerta)',
      borderRadius: 'var(--radio-sm)',
      disabledBackground: 'var(--color-apagado)',
      disabledColor: 'var(--color-lapiz)',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: 'var(--color-tinta)',
        offset: '2px',
        shadow: 'none'
      }
    }
  },
  components: {
    button: {
      root: {
        borderRadius: 'var(--radio-md)',
        label: { fontWeight: '700' }
      }
    }
  }
})
