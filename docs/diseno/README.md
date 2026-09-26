# Diseño de pantallas

Referencia visual de todas las pantallas de la app, con la dirección **"formulario en triplicado"**.

- **Sistema de diseño** (tokens, componentes, reglas): [`DESIGN.md`](../../DESIGN.md).
- **Contexto de producto**: [`PRODUCT.md`](../../PRODUCT.md).
- **Canvas interactivo**: https://claude.ai/artifact/LZeFPnEjFHgUwnUvs9HvR2 (abierto a cualquiera con el enlace).

## Cómo leer estos archivos

`pantallas/` guarda el código fuente de cada pantalla del canvas (`.dc.html`) y su índice (`canvas.json`).

- Se pueden abrir directo en el navegador como maqueta estática. El script `support.js` no existe fuera del canvas, así que ese error en la consola es esperado.
- **No se compilan ni se importan en la app.** Son la referencia que el código en `src/` reproduce con Vue y PrimeVue.
- Los nombres de pacientes y médicos son **ilustrativos**. La app usa los de `src/data/seed.js`.
- La API key que aparece en Configuración IA es un texto de ejemplo, no una key real.

## Pantallas

| Pantalla | Ruta | Archivo | Fase |
|---|---|---|---|
| Login | `/login` | `Main.dc.html` | 1 |
| Panel del día (recepción) | `/recepcion/dashboard` | `RecepcionLayout.dc.html` | 1 y 6 |
| Layout médico: lista del día | alternativa de `/medico/agenda` | `MedicoLayout.dc.html` | 1 |
| Componentes base | — | `Componentes.dc.html` | todas |
| Pacientes | `/recepcion/pacientes` | `Pacientes.dc.html` | 2 |
| Nuevo paciente (diálogo) | `/recepcion/pacientes` | `PacienteNuevo.dc.html` | 2 |
| Médicos | `/recepcion/medicos` | `Medicos.dc.html` | 2 |
| Consultorios | `/recepcion/consultorios` | `Consultorios.dc.html` | 2 |
| Agenda (semana, por médico) | `/recepcion/agenda` | `AgendaRecepcion.dc.html` | 3 |
| Mi agenda (día) | `/medico/agenda` | `MiAgendaMedico.dc.html` | 4 |
| Atender cita | `/medico/atencion/:citaId` | `AtenderCita.dc.html` | 4 y 7 |
| Historia clínica | `/medico/historia/:pacienteId` | `HistoriaClinica.dc.html` | 4 |
| Emitir receta | `/medico/receta/:consultaId` | `EmitirReceta.dc.html` | 5 |
| Respaldo | `/recepcion/respaldo` | `Respaldo.dc.html` | 6 |
| Configuración IA | `/medico/configuracion` | `ConfiguracionIA.dc.html` | 7 |
| Dictado por voz: estados | `/medico/atencion/:citaId` | `EstadosDictado.dc.html` | 7 |
| Estados vacíos, de carga y de error | varias | `EstadosVaciosCarga.dc.html` | todas |

## Decisiones clave

- **Tres copias = tres documentos:** blanca (consulta), amarilla (historia clínica) y rosa (receta).
- **Lápiz → tinta → sello:** lo que sugiere la IA se ve a lápiz, lo que revisa el médico pasa a tinta y lo registrado lleva un sello violeta.
- **Rojo reservado** para alergias, errores y grabación.
- **La alergia bloquea en línea**, dentro de la fila del medicamento, sin diálogo.
- **Acciones destructivas en dos pasos:** botón con borde rojo y confirmación en rojo lleno.
- **Accesibilidad:** contraste AA verificado (mínimo 5,57:1), estados que no dependen solo del color y acciones repetidas con nombre accesible.

## Pendiente de diseño

- Detalle de paciente (`/recepcion/pacientes/:id`).
- Diálogos de alta y edición de médico y consultorio (siguen el patrón de "Nuevo paciente").
- Estados de arrastre en la agenda: arrastre en curso y aviso de solapamiento.
