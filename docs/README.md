# Docs — quién lee qué

Reglas de lectura de los agentes de `.claude/agents/`, para controlar el consumo de tokens.
Si un agente duda de si algo existe o necesita leer algo restringido, **no lo lee**: pide permiso al hilo principal, que se lo consulta al usuario.

| Recurso | orquestador | spec-writer | developer | reviewer |
|---|---|---|---|---|
| `CLAUDE.md` | ya en contexto | lee | ya en contexto | ya en contexto |
| `SETUP.md` | no lee | lee | lee | lee |
| Encabezado del spec (`Estado:`) | lee solo eso | — | lee entero (es su tarea) | lee entero |
| Spec inmediato anterior | no lee | solo encabezado y tareas | no lee | no lee |
| Otros specs | no lee | solo `Glob` de nombres | no lee | no lee |
| Código (`src/`, `tests/`) | **prohibido** | `Glob`/`Grep`; `Read` solo lo que el spec modifica | lee y escribe | lee |
| `docs/diseno/pantallas/*.html` | **prohibido** | **prohibido entero**: solo nombres y ruta | solo la pantalla de su tarea | no lee |

## Reglas

1. El orquestador clasifica con el texto del requerimiento y delega ese texto tal cual.
2. El spec-writer referencia las maquetas por ruta; no las describe ni las lee completas.
3. Ante la duda, pedir permiso al hilo principal indicando la ruta exacta (orquestador: `PREGUNTA`; spec-writer: "Decisiones abiertas").
4. Estas reglas viven en `.claude/agents/orquestador.md` y `.claude/agents/spec-writer.md`; esta tabla es el resumen.

Diseño visual: ver [`diseno/README.md`](diseno/README.md).
