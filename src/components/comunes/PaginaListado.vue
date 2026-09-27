<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'

// Página de listado: cabecera, hoja con tabla (las <Column> van en el slot) y estado vacío.
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  // Ej. "Listado de médicos": nombra la región de la tabla.
  etiqueta: { type: String, required: true },
  valores: { type: Array, required: true },
  // Ej. "Nuevo médico": texto del botón primario.
  etiquetaNuevo: { type: String, required: true },
  tituloVacio: { type: String, required: true },
  textoVacio: { type: String, required: true },
  // Filas por página; 0 = sin paginación.
  filas: { type: Number, default: 0 }
})

defineEmits(['nuevo'])
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <div class="titulos">
        <h1 class="tipo-headline">
          {{ titulo }}
        </h1>
        <p class="subtitulo">
          {{ subtitulo }}
        </p>
      </div>
      <Button
        type="button"
        class="boton-nuevo"
        @click="$emit('nuevo')"
      >
        <svg
          class="icono"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        {{ etiquetaNuevo }}
      </Button>
    </header>

    <section
      :aria-label="etiqueta"
      class="hoja"
    >
      <!-- Herramientas de la hoja (ej. búsqueda): siempre visibles, también con el estado vacío. -->
      <slot name="herramientas" />

      <DataTable
        v-if="valores.length"
        :value="valores"
        data-key="id"
        :paginator="filas > 0"
        :rows="filas || null"
        :always-show-paginator="false"
        paginator-template="CurrentPageReport PrevPageLink NextPageLink"
        current-page-report-template="{first}–{last} de {totalRecords}"
      >
        <slot />
      </DataTable>

      <!-- Pie de la hoja (ej. "Mostrando N de M" y un enlace): solo con tabla, no con el estado vacío. -->
      <slot
        v-if="valores.length"
        name="pie"
      />

      <div
        v-else
        class="vacio"
        role="status"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect
            x="9"
            y="9"
            width="19"
            height="19"
            rx="2"
            fill="none"
            stroke="var(--color-perforacion)"
            stroke-width="0.9"
            stroke-dasharray="2 1.5"
          />
          <rect
            x="6.5"
            y="6.5"
            width="19"
            height="19"
            rx="2"
            fill="none"
            stroke="var(--color-perforacion)"
            stroke-width="0.9"
            stroke-dasharray="2 1.5"
          />
          <rect
            x="4"
            y="4"
            width="19"
            height="19"
            rx="2"
            fill="var(--color-papel)"
            stroke="var(--color-texto)"
            stroke-width="0.9"
          />
          <path
            d="M8 10h11M8 14h7"
            stroke="var(--color-linea)"
            stroke-width="0.9"
            fill="none"
          />
        </svg>
        <p class="vacio-titulo">
          {{ tituloVacio }}
        </p>
        <p class="vacio-texto">
          {{ textoVacio }}
        </p>
        <div class="acciones-vacio">
          <slot name="acciones-vacio" />
          <Button
            type="button"
            class="boton-nuevo"
            @click="$emit('nuevo')"
          >
            <svg
              class="icono"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {{ etiquetaNuevo }}
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabecera { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--espacio-xl); padding: 28px 48px 22px; border-bottom: 2px dotted var(--color-perforacion); }
.titulos { display: flex; flex-direction: column; gap: var(--espacio-xs); }
.titulos h1 { margin: 0; }
.subtitulo { margin: 0; font-size: 15px; color: var(--color-texto-secundario); }
.boton-nuevo { height: 44px; gap: var(--espacio-sm); padding: 0 18px; font-size: 15px; box-shadow: var(--sombra-boton); }
.hoja { margin: 28px 48px 40px; padding: 8px 24px 16px; background: var(--color-papel); border-radius: var(--radio-sm); box-shadow: var(--sombra-hoja); overflow-x: auto; }

.hoja :deep(.p-datatable-header-cell) { padding: 14px 12px 10px; background: transparent; border: none; border-bottom: 1.5px solid var(--color-texto); color: var(--color-texto-secundario); font: 600 12px/1.3 var(--fuente-texto); letter-spacing: 0.06em; text-transform: uppercase; text-align: left; }
.hoja :deep(.p-datatable-tbody > tr) { background: transparent; }
.hoja :deep(.p-datatable-tbody > tr > td) { padding: 16px 12px; border: none; border-bottom: 1px solid var(--color-renglon); color: var(--color-texto); vertical-align: middle; }
.hoja :deep(.p-datatable-tbody > tr:last-child > td) { border-bottom: none; }
.hoja :deep(.p-datatable-header-cell:first-child),
.hoja :deep(.p-datatable-tbody > tr > td:first-child) { padding-left: 0; }
.hoja :deep(.p-datatable-header-cell:last-child),
.hoja :deep(.p-datatable-tbody > tr > td:last-child) { padding-right: 0; text-align: right; }

.vacio { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 24px; text-align: center; }
.vacio-titulo { margin: 0; font-size: 17px; font-weight: 700; }
.vacio-texto { margin: 0; max-width: 38ch; font-size: 14px; line-height: 1.5; color: var(--color-texto-secundario); }
.acciones-vacio { display: flex; align-items: center; gap: 10px; margin-top: 6px; }

.hoja :deep(.p-paginator) { justify-content: flex-end; gap: 4px; padding: 14px 0 0; background: transparent; border-top: 2px dotted var(--color-perforacion); font-size: 14px; color: var(--color-texto-secundario); }
.hoja :deep(.p-paginator-current) { margin-right: auto; }

@media (max-width: 1023px) {
  .cabecera { padding-inline: 24px; }
  .hoja { margin-inline: 24px; }
}
</style>
