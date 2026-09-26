import dayjs from 'dayjs'

export const VERSION_SEMILLA = 1

export const TRANSCRIPCION_DEMO =
  'Paciente refiere fiebre desde hace tres días y dolor de garganta al tragar. Temperatura 38.5, presión 120 sobre 80, frecuencia cardiaca 92. Amígdalas inflamadas con placas blanquecinas, sin tos. Impresión diagnóstica faringitis bacteriana. Indico amoxicilina 500 miligramos cada 8 horas por 7 días y paracetamol 500 miligramos cada 8 horas si hay fiebre. Control en una semana.'

export const DURACION_CITA_MIN = 30

const CONSULTORIOS = [
  { nombre: 'Consultorio 101', piso: '1', descripcion: 'Medicina general' },
  { nombre: 'Consultorio 102', piso: '1', descripcion: 'Pediatría, con camilla y balanza pediátrica' },
  { nombre: 'Consultorio 201', piso: '2', descripcion: 'Cardiología, con electrocardiógrafo' }
]

const PACIENTES = [
  { dni: '40123456', nombres: 'Ana María', apellidos: 'Quispe Rojas', fechaNacimiento: '1988-03-14', sexo: 'F', telefono: '987654321', email: 'ana.quispe@correo.com', direccion: 'Av. Los Olivos 123, Lima', grupoSanguineo: 'O+', alergias: ['Penicilina'], antecedentes: 'Asma leve en la infancia.' },
  { dni: '41234567', nombres: 'Luis Alberto', apellidos: 'Mendoza Paredes', fechaNacimiento: '1975-11-02', sexo: 'M', telefono: '986543210', email: 'luis.mendoza@correo.com', direccion: 'Jr. Cusco 456, Lima', grupoSanguineo: 'A+', alergias: [], antecedentes: 'Sin antecedentes relevantes.' },
  { dni: '42345678', nombres: 'Rosa Elena', apellidos: 'Huamán Flores', fechaNacimiento: '1992-07-21', sexo: 'F', telefono: '985432109', email: 'rosa.huaman@correo.com', direccion: 'Calle Las Flores 78, Lima', grupoSanguineo: 'B+', alergias: ['Polen'], antecedentes: 'Rinitis alérgica estacional.' },
  { dni: '43456789', nombres: 'Carlos Enrique', apellidos: 'Vargas Soto', fechaNacimiento: '1968-01-30', sexo: 'M', telefono: '984321098', email: 'carlos.vargas@correo.com', direccion: 'Av. Arequipa 890, Lima', grupoSanguineo: 'O-', alergias: [], antecedentes: 'Lumbalgia crónica.' },
  { dni: '44567890', nombres: 'María Isabel', apellidos: 'Torres Campos', fechaNacimiento: '1955-09-09', sexo: 'F', telefono: '983210987', email: 'maria.torres@correo.com', direccion: 'Jr. Puno 321, Lima', grupoSanguineo: 'A-', alergias: ['Sulfas'], antecedentes: 'Hipertensión arterial desde hace 10 años.' },
  { dni: '45678901', nombres: 'José Manuel', apellidos: 'Ríos Salazar', fechaNacimiento: '1960-05-17', sexo: 'M', telefono: '982109876', email: 'jose.rios@correo.com', direccion: 'Av. Brasil 654, Lima', grupoSanguineo: 'AB+', alergias: [], antecedentes: 'Diabetes tipo 2 controlada.' },
  { dni: '46789012', nombres: 'Patricia', apellidos: 'Castillo Ñahui', fechaNacimiento: '1971-12-05', sexo: 'F', telefono: '981098765', email: 'patricia.castillo@correo.com', direccion: 'Calle Los Pinos 12, Lima', grupoSanguineo: 'O+', alergias: ['Látex'], antecedentes: 'Dislipidemia.' },
  { dni: '47890123', nombres: 'Mateo', apellidos: 'Gutiérrez Lara', fechaNacimiento: '2018-04-11', sexo: 'M', telefono: '980987654', email: 'familia.gutierrez@correo.com', direccion: 'Av. Universitaria 987, Lima', grupoSanguineo: 'B-', alergias: [], antecedentes: 'Vacunas al día.' },
  { dni: '48901234', nombres: 'Valentina', apellidos: 'Ramírez Cruz', fechaNacimiento: '2020-08-25', sexo: 'F', telefono: '979876543', email: 'familia.ramirez@correo.com', direccion: 'Jr. Junín 147, Lima', grupoSanguineo: 'A+', alergias: ['Mariscos'], antecedentes: 'Dermatitis atópica.' },
  { dni: '49012345', nombres: 'Diego', apellidos: 'Flores Medina', fechaNacimiento: '2015-02-03', sexo: 'M', telefono: '978765432', email: 'familia.flores@correo.com', direccion: 'Calle Real 258, Lima', grupoSanguineo: 'O+', alergias: [], antecedentes: 'Sin antecedentes relevantes.' }
]

// Cada médico atiende a un grupo de pacientes (índices de PACIENTES) y usa plantillas de consulta.
// `horaBase` es la hora de la primera cita del día; el resto se desplaza dentro del horario.
const MEDICOS = [
  {
    nombres: 'Fernando', apellidos: 'Salas Vega', especialidad: 'Medicina General', colegiatura: 'CMP 45123',
    telefono: '955111222', consultorio: 0, horario: { dias: [1, 2, 3, 4, 5, 6], inicio: '08:00', fin: '14:00' },
    pacientes: [0, 1, 2, 3],
    plantillas: [
      {
        motivo: 'Dolor de garganta y fiebre',
        signosVitales: { presion: '110/70', frecuenciaCardiaca: 88, temperatura: 38.2, peso: 62, talla: 160 },
        examenFisico: 'Faringe eritematosa con exudado en amígdalas.',
        diagnosticos: [{ codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' }],
        plan: 'Tratamiento sintomático, hidratación y reposo. Control en 7 días.',
        items: [
          { medicamento: 'Azitromicina 500 mg', dosis: '1 tableta', frecuencia: 'cada 24 horas', duracion: '3 días', via: 'oral', indicaciones: 'una hora antes de las comidas' },
          { medicamento: 'Paracetamol 500 mg', dosis: '1 tableta', frecuencia: 'cada 8 horas', duracion: '3 días', via: 'oral', indicaciones: 'solo si hay fiebre o dolor' }
        ]
      },
      {
        motivo: 'Dolor en la zona lumbar',
        signosVitales: { presion: '120/80', frecuenciaCardiaca: 76, temperatura: 36.6, peso: 78, talla: 172 },
        examenFisico: 'Contractura paravertebral lumbar, sin déficit neurológico.',
        diagnosticos: [{ codigo: 'M54.5', descripcion: 'Lumbago no especificado' }],
        plan: 'Analgesia, calor local y evitar esfuerzos. Control en 10 días.',
        items: [
          { medicamento: 'Naproxeno 550 mg', dosis: '1 tableta', frecuencia: 'cada 12 horas', duracion: '5 días', via: 'oral', indicaciones: 'después de las comidas' }
        ]
      },
      {
        motivo: 'Congestión nasal y malestar general',
        signosVitales: { presion: '110/70', frecuenciaCardiaca: 80, temperatura: 37.4, peso: 58, talla: 158 },
        examenFisico: 'Mucosa nasal congestiva, orofaringe levemente hiperémica.',
        diagnosticos: [{ codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' }],
        plan: 'Manejo sintomático, abundantes líquidos y reposo.',
        items: [
          { medicamento: 'Paracetamol 500 mg', dosis: '1 tableta', frecuencia: 'cada 8 horas', duracion: '3 días', via: 'oral', indicaciones: 'solo si hay fiebre o dolor' },
          { medicamento: 'Loratadina 10 mg', dosis: '1 tableta', frecuencia: 'cada 24 horas', duracion: '5 días', via: 'oral', indicaciones: 'por la noche' }
        ]
      }
    ]
  },
  {
    nombres: 'Lucía', apellidos: 'Paredes Díaz', especialidad: 'Pediatría', colegiatura: 'CMP 51877',
    telefono: '955333444', consultorio: 1, horario: { dias: [1, 2, 3, 4, 5], inicio: '09:00', fin: '15:00' },
    pacientes: [7, 8, 9],
    plantillas: [
      {
        motivo: 'Fiebre y tos desde hace dos días',
        signosVitales: { presion: '90/60', frecuenciaCardiaca: 110, temperatura: 38.0, peso: 19, talla: 108 },
        examenFisico: 'Buen estado general, orofaringe hiperémica, murmullo vesicular normal.',
        diagnosticos: [{ codigo: 'J06.9', descripcion: 'Infección aguda de las vías respiratorias superiores, no especificada' }],
        plan: 'Control de la fiebre y abundantes líquidos. Volver si empeora.',
        items: [
          { medicamento: 'Paracetamol gotas 100 mg/mL', dosis: '1.5 mL', frecuencia: 'cada 6 horas', duracion: '3 días', via: 'oral', indicaciones: 'solo si hay fiebre' }
        ]
      },
      {
        motivo: 'Diarrea y vómitos',
        signosVitales: { presion: '90/55', frecuenciaCardiaca: 118, temperatura: 37.5, peso: 14, talla: 95 },
        examenFisico: 'Leve deshidratación, abdomen blando y depresible.',
        diagnosticos: [{ codigo: 'A09', descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso' }],
        plan: 'Rehidratación oral y dieta blanda. Control en 48 horas.',
        items: [
          { medicamento: 'Suero de rehidratación oral', dosis: '1 sobre en 1 litro de agua', frecuencia: 'a libre demanda', duracion: '3 días', via: 'oral', indicaciones: 'ofrecer en pequeños sorbos' }
        ]
      },
      {
        motivo: 'Estornudos y picazón nasal',
        signosVitales: { presion: '95/60', frecuenciaCardiaca: 100, temperatura: 36.7, peso: 24, talla: 120 },
        examenFisico: 'Mucosa nasal pálida y edematosa, sin signos de infección.',
        diagnosticos: [{ codigo: 'J30.4', descripcion: 'Rinitis alérgica, no especificada' }],
        plan: 'Evitar alérgenos y control en 15 días.',
        items: [
          { medicamento: 'Loratadina jarabe 5 mg/5 mL', dosis: '5 mL', frecuencia: 'cada 24 horas', duracion: '7 días', via: 'oral', indicaciones: 'por la noche' }
        ]
      }
    ]
  },
  {
    nombres: 'Ricardo', apellidos: 'Montoya Silva', especialidad: 'Cardiología', colegiatura: 'CMP 38456',
    telefono: '955555666', consultorio: 2, horario: { dias: [1, 3, 5], inicio: '10:00', fin: '16:00' },
    pacientes: [4, 5, 6],
    plantillas: [
      {
        motivo: 'Control de presión arterial',
        signosVitales: { presion: '145/90', frecuenciaCardiaca: 78, temperatura: 36.5, peso: 72, talla: 158 },
        examenFisico: 'Ruidos cardíacos rítmicos, sin soplos. Sin edemas.',
        diagnosticos: [{ codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' }],
        plan: 'Ajuste de tratamiento, dieta baja en sal y control en 1 mes.',
        items: [
          { medicamento: 'Losartán 50 mg', dosis: '1 tableta', frecuencia: 'cada 24 horas', duracion: '30 días', via: 'oral', indicaciones: 'en la mañana' }
        ]
      },
      {
        motivo: 'Dolor en el pecho ocasional',
        signosVitales: { presion: '130/85', frecuenciaCardiaca: 84, temperatura: 36.6, peso: 85, talla: 174 },
        examenFisico: 'Sin dolor a la palpación torácica, auscultación normal.',
        diagnosticos: [{ codigo: 'R07.4', descripcion: 'Dolor en el pecho, no especificado' }],
        plan: 'Electrocardiograma y control con resultados en 15 días.',
        items: [
          { medicamento: 'Omeprazol 20 mg', dosis: '1 cápsula', frecuencia: 'cada 24 horas', duracion: '14 días', via: 'oral', indicaciones: 'en ayunas' }
        ]
      }
    ]
  }
]

// Estados por posición dentro de las citas pasadas y las de hoy o futuras.
// Las dos primeras pasadas son atendidas, así siempre hay consultas.
const ESTADOS_PASADOS = ['atendida', 'atendida', 'no_asistio', 'cancelada']
const ESTADOS_FUTUROS = ['programada', 'confirmada', 'programada', 'cancelada']

const dosDigitos = (n) => String(n).padStart(2, '0')

export function generarDatosSemilla(hoy = dayjs()) {
  const creadoEn = hoy.toISOString()
  const nuevo = (datos) => ({ id: crypto.randomUUID(), creadoEn, ...datos })

  const consultorios = CONSULTORIOS.map(nuevo)
  const pacientes = PACIENTES.map(nuevo)
  const medicos = MEDICOS.map((m) =>
    nuevo({
      nombres: m.nombres, apellidos: m.apellidos, especialidad: m.especialidad,
      colegiatura: m.colegiatura, telefono: m.telefono,
      consultorioId: consultorios[m.consultorio].id, horario: { ...m.horario, dias: [...m.horario.dias] }
    })
  )

  const usuarios = [
    nuevo({ email: 'recepcion@clinica.com', password: '123456', nombre: 'Recepción Clínica', rol: 'recepcion' }),
    ...medicos.map((m, i) =>
      nuevo({
        email: `medico${i + 1}@clinica.com`, password: '123456',
        nombre: `Dr. ${m.nombres} ${m.apellidos}`, rol: 'medico', medicoId: m.id
      })
    )
  ]

  // Una cita por médico y por día laborable, de hoy − 3 a hoy + 3 (sin solapamientos por construcción).
  const citas = []
  const consultas = []
  const recetas = []
  let pasadas = 0
  let futuras = 0
  const contadorMedico = MEDICOS.map(() => 0)

  for (let desplazamiento = -3; desplazamiento <= 3; desplazamiento++) {
    const dia = hoy.add(desplazamiento, 'day')
    const fecha = dia.format('YYYY-MM-DD')
    MEDICOS.forEach((plan, i) => {
      if (!plan.horario.dias.includes(dia.day())) return
      const n = contadorMedico[i]++
      const plantilla = plan.plantillas[n % plan.plantillas.length]
      const paciente = pacientes[plan.pacientes[n % plan.pacientes.length]]
      const paso = desplazamiento + 3
      const hora = `${dosDigitos(Number(plan.horario.inicio.slice(0, 2)) + (paso % 4))}:${dosDigitos((paso % 2) * 30)}`
      const estado = desplazamiento < 0
        ? ESTADOS_PASADOS[pasadas++ % ESTADOS_PASADOS.length]
        : ESTADOS_FUTUROS[futuras++ % ESTADOS_FUTUROS.length]

      const cita = nuevo({
        pacienteId: paciente.id, medicoId: medicos[i].id, consultorioId: medicos[i].consultorioId,
        fecha, hora, duracionMin: DURACION_CITA_MIN, motivo: plantilla.motivo, estado
      })
      citas.push(cita)
      if (estado !== 'atendida') return

      const consulta = nuevo({
        citaId: cita.id, pacienteId: paciente.id, medicoId: cita.medicoId, fecha, motivo: plantilla.motivo,
        signosVitales: { ...plantilla.signosVitales }, examenFisico: plantilla.examenFisico,
        diagnosticos: plantilla.diagnosticos.map((d) => ({ ...d })), plan: plantilla.plan, observaciones: ''
      })
      consultas.push(consulta)
      recetas.push(nuevo({
        consultaId: consulta.id, pacienteId: paciente.id, medicoId: cita.medicoId, fecha,
        items: plantilla.items.map((item) => ({ ...item })),
        indicacionesGenerales: 'Tomar la medicación según lo indicado y acudir a control si los síntomas persisten.'
      }))
    })
  }

  return { consultorios, medicos, usuarios, pacientes, citas, consultas, recetas }
}
