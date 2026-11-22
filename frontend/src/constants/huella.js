import { ICONE_FOLHA, ICONE_BROTO, ICONE_LIVRO, ICONE_ARVORE } from './icones'

// Empresas que dejan huella positiva (pedido da turma do Chile, seção 11 da proposta).

const ICONE_ONDAS = [
  'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
  'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
  'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'
]
const ICONE_GOTA = ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z']
const ICONE_RECICLAR = [
  'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5',
  'M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12',
  'm14 16-3 3 3 3',
  'M8.293 13.596 7.196 9.5 3.1 10.598',
  'm9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843',
  'm13.378 9.633 4.096 1.098 1.097-4.096'
]
const ICONE_MAOS = [
  'M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16',
  'm7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9',
  'm2 15 6 6'
]
const ICONE_ESTRELA = ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']

// mesmos valores da coluna actividades.tipo (banco) e de services/huella.py (back-end)
export const TIPOS_ACTIVIDAD = [
  {
    id: 'limpieza_playa',
    nombre: 'Limpieza de playas y costas',
    icone: ICONE_ONDAS,
    ods: [14],
    descripcion: 'Recolección de residuos en playas, orillas del mar y costas.',
    consejos: [
      'Coordina con la municipalidad el retiro de los residuos recolectados.',
      'Separa los residuos reciclables y pésalos para registrar los kilos.',
      'No intervengas dunas, nidos ni zonas con fauna.'
    ],
    llevar: ['guantes', 'bolsas resistentes', 'agua', 'bloqueador solar', 'gorro']
  },
  {
    id: 'limpieza_rio',
    nombre: 'Limpieza de ríos, canales y humedales',
    icone: ICONE_GOTA,
    ods: [6, 15],
    descripcion: 'Retiro de residuos en riberas de ríos, canales y humedales.',
    consejos: [
      'Trabaja solo en las orillas: nunca entres al agua sin equipo y supervisión.',
      'Los humedales son frágiles: camina por senderos y evita pisar la vegetación.',
      'Pide autorización a la municipalidad o al administrador del lugar.'
    ],
    llevar: ['guantes', 'bolsas resistentes', 'botas', 'agua', 'repelente']
  },
  {
    id: 'limpieza_bosque',
    nombre: 'Limpieza de bosques, parques y espacios naturales',
    icone: ICONE_FOLHA,
    ods: [15, 11],
    descripcion: 'Recolección de residuos en bosques, cerros, parques y senderos.',
    consejos: [
      'Organiza grupos pequeños con un responsable cada uno.',
      'Respeta los senderos y no retires plantas, piedras ni leña.',
      'Ten un plan ante emergencias y un botiquín.'
    ],
    llevar: ['guantes', 'bolsas', 'calzado cerrado', 'agua', 'botiquín']
  },
  {
    id: 'reforestacion',
    nombre: 'Reforestación con árboles nativos',
    icone: ICONE_ARVORE,
    ods: [15, 13],
    descripcion: 'Plantación de árboles y arbustos nativos en espacios autorizados.',
    consejos: [
      'Usa siempre especies nativas adecuadas para tu zona.',
      'Consigue los árboles en viveros o programas oficiales de arborización.',
      'Planifica el riego y el cuidado de los árboles después de plantarlos.'
    ],
    llevar: ['guantes', 'palas', 'agua para riego', 'ropa cómoda']
  },
  {
    id: 'areas_verdes',
    nombre: 'Recuperación de áreas verdes',
    icone: ICONE_BROTO,
    ods: [11, 15],
    descripcion: 'Recuperación y mantención de plazas, jardines y espacios comunitarios.',
    consejos: [
      'Elige el espacio junto a los vecinos o la junta de vecinos.',
      'Registra cómo estaba el lugar antes y cómo quedó después.',
      'Acuerda quién mantendrá el espacio en el tiempo.'
    ],
    llevar: ['guantes', 'herramientas de jardín', 'agua', 'ropa de trabajo']
  },
  {
    id: 'reciclaje',
    nombre: 'Campaña de reciclaje',
    icone: ICONE_RECICLAR,
    ods: [12],
    descripcion: 'Recolección de residuos reciclables en la empresa o la comunidad.',
    consejos: [
      'Acuerda antes con un reciclador o punto limpio qué materiales recibe.',
      'Informa con anticipación qué traer y cómo entregarlo limpio y separado.',
      'Pesa lo recolectado para registrar los kilos.'
    ],
    llevar: ['materiales reciclables limpios y separados']
  },
  {
    id: 'educacion',
    nombre: 'Educación ambiental',
    icone: ICONE_LIVRO,
    ods: [4, 13],
    descripcion: 'Charlas, talleres o visitas guiadas sobre el cuidado del medioambiente.',
    consejos: [
      'Invita a una organización ambiental o a un experto local.',
      'Relaciona el tema con el trabajo diario de la empresa.',
      'Puedes abrir la actividad a las familias de los trabajadores.'
    ],
    llevar: ['ganas de aprender']
  },
  {
    id: 'voluntariado',
    nombre: 'Voluntariado en conservación',
    icone: ICONE_MAOS,
    ods: [15, 17],
    descripcion: 'Apoyo a proyectos de conservación de flora y fauna local.',
    consejos: [
      'Busca organizaciones o áreas protegidas que reciban voluntarios.',
      'Sigue siempre las instrucciones de los encargados del lugar.',
      'Registra las horas de voluntariado de cada jornada.'
    ],
    llevar: ['ropa cómoda', 'agua', 'protección solar']
  },
  {
    id: 'otra',
    nombre: 'Otra actividad',
    icone: ICONE_ESTRELA,
    ods: [],
    descripcion: 'Cualquier otra acción positiva para la naturaleza o la comunidad.',
    consejos: [],
    llevar: []
  }
]

export const tipoPorId = (id) => TIPOS_ACTIVIDAD.find((t) => t.id === id) ?? TIPOS_ACTIVIDAD.at(-1)

// ---------- Fechas ambientales ----------
// Base: Calendario Ambiental del Ministerio del Medio Ambiente de Chile + días mundiales de la ONU.
// Fecha fija: { mes, dia }. Fecha móvil: { mes, semana, diaSemana }, con semana 1-4 (primer…cuarto)
// o -1 (último) y diaSemana 0 = domingo … 6 = sábado.
export const FUENTE_CALENDARIO = {
  nombre: 'Calendario Ambiental – Ministerio del Medio Ambiente',
  url: 'https://www.chileatiende.gob.cl/fichas/75614-calendario-ambiental-2026'
}

export const FECHAS_AMBIENTALES = [
  { mes: 1, dia: 26, nombre: 'Día de la Educación Ambiental', tipo: 'educacion', sugerencia: 'Organiza una charla breve sobre el cuidado del medioambiente en tu empresa.' },
  { mes: 1, dia: 28, nombre: 'Día Mundial de la Reducción de CO₂', tipo: 'educacion', sugerencia: 'Revisa con tu equipo el consumo de energía y combustible, y propongan una meta de reducción.' },
  { mes: 2, dia: 2, nombre: 'Día Mundial de los Humedales', tipo: 'limpieza_rio', sugerencia: 'Organiza una limpieza en un humedal o en la ribera de un río cercano.' },
  { mes: 2, dia: 19, nombre: 'Día Mundial de las Ballenas', tipo: 'educacion', sugerencia: 'Comparte con tu equipo cómo los residuos plásticos llegan al océano y afectan a la fauna marina.' },
  { mes: 3, dia: 1, nombre: 'Día Internacional de los Recicladores de Base', tipo: 'reciclaje', sugerencia: 'Organiza una campaña de reciclaje junto a un reciclador de base de tu comuna.' },
  { mes: 3, dia: 3, nombre: 'Día Mundial de la Naturaleza', tipo: 'voluntariado', sugerencia: 'Participa en un voluntariado de conservación en un espacio natural.' },
  { mes: 3, dia: 21, nombre: 'Día Internacional de los Bosques', tipo: 'reforestacion', sugerencia: 'Planta árboles nativos o limpia un bosque o parque cercano.' },
  { mes: 3, dia: 22, nombre: 'Día Mundial del Agua', tipo: 'limpieza_rio', sugerencia: 'Limpia la ribera de un río o canal, y revisa las filtraciones de agua en tu empresa.' },
  { mes: 3, dia: 26, nombre: 'Día Mundial del Clima', tipo: 'educacion', sugerencia: 'Realiza un taller sobre la huella de carbono de tu empresa.' },
  { mes: 4, dia: 22, nombre: 'Día de la Tierra', tipo: 'areas_verdes', sugerencia: 'Recupera un área verde de tu barrio junto a tus trabajadores.' },
  { mes: 4, dia: 25, nombre: 'Día Mundial de los Pingüinos', tipo: 'limpieza_playa', sugerencia: 'Organiza una limpieza de playa o costa.' },
  { mes: 5, semana: 2, diaSemana: 6, nombre: 'Día Internacional de las Aves Migratorias', tipo: 'limpieza_rio', sugerencia: 'Limpia un humedal, lugar de descanso de muchas aves migratorias.' },
  { mes: 5, dia: 17, nombre: 'Día Internacional del Reciclaje', tipo: 'reciclaje', sugerencia: 'Lanza una campaña de reciclaje en tu empresa y con tus clientes.' },
  { mes: 5, dia: 22, nombre: 'Día Internacional de la Diversidad Biológica', tipo: 'voluntariado', sugerencia: 'Apoya un proyecto de conservación de flora o fauna local.' },
  { mes: 6, dia: 3, nombre: 'Día Mundial de la Bicicleta', tipo: 'educacion', sugerencia: 'Invita a tu equipo a llegar en bicicleta y conversen sobre transporte sostenible.' },
  { mes: 6, dia: 5, nombre: 'Día Mundial del Medio Ambiente', tipo: 'areas_verdes', sugerencia: 'Realiza una jornada ambiental con tus trabajadores y sus familias.' },
  { mes: 6, dia: 8, nombre: 'Día Mundial de los Océanos', tipo: 'limpieza_playa', sugerencia: 'Organiza una limpieza de playa con tu equipo.' },
  { mes: 6, dia: 16, nombre: 'Día Mundial de las Tortugas Marinas', tipo: 'limpieza_playa', sugerencia: 'Limpia una playa: los plásticos son una de las principales amenazas para las tortugas.' },
  { mes: 6, dia: 17, nombre: 'Día Mundial de Lucha contra la Desertificación y la Sequía', tipo: 'reforestacion', sugerencia: 'Planta especies nativas resistentes a la sequía.' },
  { mes: 6, dia: 28, nombre: 'Día Mundial del Árbol', tipo: 'reforestacion', sugerencia: 'Organiza una plantación de árboles nativos.' },
  { mes: 7, dia: 3, nombre: 'Día Internacional sin Bolsas Plásticas', tipo: 'reciclaje', sugerencia: 'Elimina las bolsas plásticas en tu empresa y entrega bolsas reutilizables.' },
  { mes: 7, dia: 31, nombre: 'Día Internacional de los Guardaparques', tipo: 'voluntariado', sugerencia: 'Visita un área protegida y apoya sus actividades de voluntariado.' },
  { mes: 8, dia: 5, nombre: 'Día Internacional del Huemul', tipo: 'educacion', sugerencia: 'Conoce con tu equipo las especies nativas en peligro de Chile.' },
  { mes: 8, dia: 24, nombre: 'Día Internacional de los Parques Nacionales', tipo: 'voluntariado', sugerencia: 'Organiza una visita o un voluntariado en un parque nacional.' },
  { mes: 9, dia: 6, nombre: 'Día Mundial de las Aves Playeras', tipo: 'limpieza_playa', sugerencia: 'Limpia una costa o humedal costero respetando las zonas de aves.' },
  { mes: 9, dia: 16, nombre: 'Día Internacional de la Preservación de la Capa de Ozono', tipo: 'educacion', sugerencia: 'Revisa los equipos de refrigeración y climatización de tu empresa.' },
  { mes: 9, semana: 3, diaSemana: 6, nombre: 'Día de Limpieza de Playas y Costas', tipo: 'limpieza_playa', sugerencia: 'Súmate a la jornada de limpieza de playas con tu equipo.' },
  { mes: 9, dia: 22, nombre: 'Día Mundial sin Automóvil', tipo: 'educacion', sugerencia: 'Invita a tu equipo a llegar caminando, en bicicleta o en transporte público.' },
  { mes: 10, dia: 2, nombre: 'Día Nacional del Medio Ambiente', tipo: 'areas_verdes', sugerencia: 'Celebra con una jornada de recuperación de un espacio natural de tu comuna.', chile: true },
  { mes: 10, semana: 1, diaSemana: 1, nombre: 'Día Mundial del Hábitat', tipo: 'areas_verdes', sugerencia: 'Mejora un espacio comunitario de tu barrio.' },
  { mes: 10, dia: 18, nombre: 'Día de Protección de la Naturaleza', tipo: 'voluntariado', sugerencia: 'Participa en un voluntariado de conservación.' },
  { mes: 10, dia: 21, nombre: 'Día Mundial del Ahorro de Energía', tipo: 'educacion', sugerencia: 'Haz un recorrido por la empresa para detectar equipos y luces encendidos sin uso.' },
  { mes: 10, dia: 24, nombre: 'Día Internacional contra el Cambio Climático', tipo: 'educacion', sugerencia: 'Comparte con tu equipo las acciones de la empresa para reducir sus emisiones.' },
  { mes: 11, semana: 1, diaSemana: 6, nombre: 'Día de la Fauna Chilena', tipo: 'voluntariado', sugerencia: 'Apoya un proyecto de protección de fauna nativa.', chile: true },
  { mes: 11, dia: 14, nombre: 'Día Nacional de las Áreas Protegidas', tipo: 'voluntariado', sugerencia: 'Visita un área protegida con tu equipo y apoya su cuidado.', chile: true },
  { mes: 12, dia: 5, nombre: 'Día Mundial del Suelo', tipo: 'areas_verdes', sugerencia: 'Inicia una compostera con los residuos orgánicos de la empresa.' },
  { mes: 12, dia: 11, nombre: 'Día Internacional de las Montañas', tipo: 'limpieza_bosque', sugerencia: 'Limpia un sendero o cerro cercano.' },
  { mes: 12, dia: 12, nombre: 'Aniversario del Acuerdo de París', tipo: 'educacion', sugerencia: 'Revisa el avance de tu empresa en la reducción de emisiones.' }
]
