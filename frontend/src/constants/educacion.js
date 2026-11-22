import { ICONE_FOLHA, ICONE_GLOBO, ICONE_BROTO, ICONE_ARVORE } from './icones'

// Conteúdo da tela "Educación sostenible" (pedido da turma do Chile: seções 4 a 10 e 13 da proposta).
// Cada tema vira uma página própria em /educacion/<slug>, na ordem desta lista.
//
// Campos de um tema:
// - slug, titulo, resumen (cartão do índice), icone
// - perguntas: ids das perguntas do diagnóstico ligadas ao tema. Se a empresa tem recomendação
//   pendente de alguma delas, o cartão aparece como "Recomendado para tu empresa".
// - intro: parágrafo de abertura
// - componente: 'ods' mostra o explorador dos 17 ODS (antiga tela ODS)
// - bloques: cartões com { titulo, texto?, items?, ejemplo?, dato? } (dato = caixa "¿Sabías que?")
// - columnas: 3 para mostrar os cartões em 3 colunas (padrão: 2 colunas)
// - pasos: lista numerada { nombre, texto }
// - acciones: { titulo, items } — caixa verde "o que a sua pyme pode fazer"
// - nota: aviso importante no fim
// - fuentes: [{ nombre, url }] — sempre fontes oficiais

const ICONE_NUVEM = ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z']
const ICONE_RECICLAR = [
  'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5',
  'M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12',
  'm14 16-3 3 3 3',
  'M8.293 13.596 7.196 9.5 3.1 10.598',
  'm9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843',
  'm13.378 9.633 4.096 1.098 1.097-4.096'
]
const ICONE_SELO = [
  'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
  'M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z'
]
const ICONE_CRESCIMENTO = ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6']

export const TEMAS = [
  // ------------------------------------------------------------------ 1
  {
    slug: 'sostenibilidad',
    titulo: 'La sostenibilidad y sus tres dimensiones',
    resumen: 'Qué significa ser una empresa sostenible y cómo avanzar paso a paso.',
    icone: ICONE_FOLHA,
    perguntas: [],
    columnas: 3,
    intro:
      'Ser sostenible no significa solamente cuidar el medioambiente. También significa preocuparse por las personas, utilizar responsablemente los recursos económicos y contribuir al bienestar de las comunidades y del planeta. Por eso la sostenibilidad de una empresa se mira en tres dimensiones.',
    bloques: [
      {
        titulo: 'Dimensión ambiental',
        texto:
          'Busca utilizar responsablemente los recursos naturales, reducir los residuos y prevenir los impactos negativos que genera la actividad de la empresa.',
        ejemplo:
          'Una pyme revisa cada mes sus boletas de luz y agua, cambia su iluminación a LED y habilita contenedores para separar el papel y el cartón.'
      },
      {
        titulo: 'Dimensión social',
        texto:
          'Considera el bienestar de los trabajadores, la igualdad de oportunidades, la seguridad laboral y la relación de la empresa con su comunidad.',
        ejemplo:
          'Una pyme organiza reuniones mensuales para escuchar a sus trabajadores, revisar las condiciones de seguridad e identificar mejoras en el ambiente laboral.'
      },
      {
        titulo: 'Dimensión económica',
        texto:
          'Busca que la empresa sea viable en el tiempo, utilice eficientemente sus recursos y tome decisiones que favorezcan su continuidad. También incluye la ética y la gobernanza: cómo se toman las decisiones, cómo se cumplen las obligaciones y cómo se mantiene la confianza de trabajadores, clientes y proveedores.',
        ejemplo:
          'Una pyme lleva un registro mensual de sus ventas, gastos e inventario. Con esta información identifica productos con baja rotación y ajusta sus compras para reducir pérdidas.'
      }
    ],
    pasos: [
      { nombre: 'Evalúa', texto: 'completa el diagnóstico de sostenibilidad de la plataforma.' },
      { nombre: 'Identifica', texto: 'revisa qué dimensiones presentan mayores oportunidades de mejora.' },
      { nombre: 'Prioriza', texto: 'selecciona dos o tres acciones que sean importantes y viables para tu empresa.' },
      { nombre: 'Implementa', texto: 'asigna responsables, recursos y fechas de cumplimiento.' },
      { nombre: 'Mide', texto: 'utiliza indicadores para conocer tus avances.' },
      { nombre: 'Mejora', texto: 'revisa los resultados y ajusta las acciones cuando sea necesario.' }
    ],
    nota:
      'La sostenibilidad no requiere cambiar toda una empresa de un día para otro. Comienza con acciones pequeñas, medibles y constantes: pequeñas acciones, grandes cambios.'
  },

  // ------------------------------------------------------------------ 2
  {
    slug: 'ods',
    titulo: 'Agenda 2030 y los ODS',
    resumen: 'Los 17 Objetivos de Desarrollo Sostenible y cómo tu empresa puede aportar a ellos.',
    icone: ICONE_GLOBO,
    perguntas: [],
    intro:
      'La Agenda 2030 para el Desarrollo Sostenible es un plan de acción adoptado en 2015 por los países miembros de las Naciones Unidas, entre ellos Chile. Reúne 17 Objetivos de Desarrollo Sostenible (ODS) con 169 metas. Las empresas, incluso las más pequeñas, pueden contribuir con acciones concretas en su gestión diaria. Cada recomendación de tu diagnóstico indica a qué ODS aporta.',
    componente: 'ods',
    fuentes: [
      { nombre: 'Agenda 2030 y ODS – Instituto Nacional de Estadísticas (INE)', url: 'https://www.ine.gob.cl/ods' }
    ]
  },

  // ------------------------------------------------------------------ 3
  {
    slug: 'huella-de-carbono',
    titulo: 'Huella de carbono',
    resumen: 'Qué es, por qué medirla y cómo reducir las emisiones de tu empresa.',
    icone: ICONE_NUVEM,
    perguntas: ['q_amb_01', 'q_amb_02', 'q_amb_03'],
    intro:
      'La huella de carbono es la cantidad de gases de efecto invernadero (GEI) que emite una organización, un producto o una actividad. Se expresa en toneladas de CO₂ equivalente (t CO₂e). Estos gases son la principal causa del cambio climático.',
    bloques: [
      {
        titulo: '¿Por qué medirla?',
        items: [
          'Muestra dónde se concentran tus consumos de energía y combustible, que también son costos.',
          'Permite fijar metas de reducción y comprobar si estás avanzando.',
          'Cada vez más clientes, empresas grandes y licitaciones valoran a las empresas que gestionan sus emisiones.',
          'Es una forma concreta de aportar al ODS 13: Acción por el clima.'
        ]
      },
      {
        titulo: '¿De dónde vienen las emisiones de una pyme?',
        items: [
          'Combustibles que usa la propia empresa: vehículos, calderas, generadores, gas.',
          'Electricidad que compra la empresa.',
          'Otras fuentes: transporte de proveedores, viajes de trabajo, traslado de los trabajadores y residuos que se envían a disposición.'
        ]
      },
      {
        titulo: '¿Cómo reducirla?',
        items: [
          'Reducir el consumo de electricidad.',
          'Mejorar la eficiencia de los equipos y hacerles mantención.',
          'Preferir medios de transporte menos contaminantes.',
          'Reducir los desplazamientos innecesarios y planificar rutas.',
          'Utilizar energías renovables cuando sea posible.'
        ]
      },
      {
        titulo: 'Programa HuellaChile',
        texto:
          'Programa del Ministerio del Medio Ambiente que fomenta el cálculo, el reporte y la gestión de los gases de efecto invernadero en organizaciones públicas y privadas. Ofrece una calculadora gratuita y reconoce con sellos a las organizaciones que cuantifican y reducen sus emisiones. La inscripción se realiza en la Ventanilla Única del Ministerio con ClaveÚnica.'
      }
    ],
    acciones: {
      titulo: '¿Por dónde empezar?',
      items: [
        'Reúne las boletas de electricidad y las compras de combustible de los últimos 12 meses.',
        'Anota los kilómetros que recorren los vehículos de la empresa.',
        'Calcula tu huella con una herramienta oficial, como la calculadora de HuellaChile.',
        'Elige una o dos medidas de reducción y repite la medición cada año para ver tu avance.'
      ]
    },
    fuentes: [{ nombre: 'Programa HuellaChile (Ministerio del Medio Ambiente)', url: 'https://huellachile.mma.gob.cl/' }]
  },

  // ------------------------------------------------------------------ 4
  {
    slug: 'ley-rep',
    titulo: 'Ley REP',
    resumen: 'La Ley 20.920 de Responsabilidad Extendida del Productor y la gestión de residuos.',
    icone: ICONE_RECICLAR,
    perguntas: ['q_amb_05', 'q_amb_06'],
    intro:
      'La Ley 20.920, conocida como Ley REP o Ley de Reciclaje, establece la Responsabilidad Extendida del Productor: las empresas que introducen ciertos productos en el mercado deben organizar y financiar la gestión de sus residuos cuando terminan su vida útil. Gestionar bien los residuos es parte de una actividad empresarial responsable.',
    bloques: [
      {
        titulo: 'Productos prioritarios',
        texto: 'La ley define seis productos prioritarios. Cada uno tiene sus propias metas de recolección y valorización, fijadas por decreto:',
        items: [
          'Envases y embalajes',
          'Neumáticos',
          'Aceites lubricantes',
          'Aparatos eléctricos y electrónicos',
          'Pilas',
          'Baterías'
        ],
        dato: 'En 2025 el Ministerio del Medio Ambiente también declaró a los textiles como producto prioritario.'
      },
      {
        titulo: '¿Quién es «productor»?',
        texto:
          'Es quien pone en el mercado nacional un producto prioritario por primera vez: por ejemplo, quien lo fabrica o envasa y lo vende con su marca, o quien lo importa. Una pyme que importa productos envasados también puede ser productora de envases.'
      },
      {
        titulo: 'Obligaciones del productor',
        items: [
          'Inscribirse en el registro de productores del Ministerio del Medio Ambiente.',
          'Organizar y financiar la gestión de los residuos de sus productos.',
          'Cumplir metas de recolección y valorización, de forma individual o a través de un sistema de gestión colectivo.'
        ]
      },
      {
        titulo: 'Si tu empresa no es productora',
        texto: 'Igual puedes contribuir con una buena gestión de tus residuos:',
        items: [
          'Separa y clasifica los residuos en tu empresa.',
          'Entrégalos en puntos limpios o a gestores y recicladores autorizados.',
          'Prefiere proveedores con envases reciclables o retornables.',
          'Reduce los envases y embalajes que compras y usas.'
        ]
      },
      {
        titulo: 'El mejor residuo es el que no se genera',
        texto: 'Antes de reciclar, piensa en este orden:',
        items: [
          'Reducir: comprar y usar solo lo necesario.',
          'Reutilizar: volver a usar envases, cajas y materiales.',
          'Reciclar: transformar el residuo en materia prima.',
          'Valorizar: aprovechar el residuo de otra forma, por ejemplo como energía.'
        ]
      }
    ],
    acciones: {
      titulo: 'Para tu pyme',
      items: [
        'Revisa si fabricas, envasas o importas alguno de los productos prioritarios.',
        'Si es así, consulta tus obligaciones en las fuentes oficiales del Ministerio.',
        'Habilita la separación de residuos y lleva un registro de los kilos que reciclas.'
      ]
    },
    nota:
      'Las obligaciones y metas dependen del decreto de cada producto prioritario. Ante dudas, consulta siempre las fuentes oficiales.',
    fuentes: [
      { nombre: 'Ley 20.920 (Biblioteca del Congreso Nacional)', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1090894' },
      { nombre: 'Economía Circular – Ministerio del Medio Ambiente', url: 'https://economiacircular.mma.gob.cl/' }
    ]
  },

  // ------------------------------------------------------------------ 5
  {
    slug: 'empresas-b-y-certificaciones',
    titulo: 'Empresas B y certificaciones',
    resumen: 'Qué es una Empresa B, qué certificaciones existen y cómo empezar.',
    icone: ICONE_SELO,
    perguntas: ['q_eco_04', 'q_eco_06'],
    intro:
      'Las certificaciones de sostenibilidad son herramientas voluntarias que reconocen a las empresas que gestionan su impacto social y ambiental, además de sus resultados económicos. Ninguna empresa está obligada a certificarse, pero conocerlas ayuda a ordenar el camino.',
    bloques: [
      {
        titulo: '¿Qué es una Empresa B?',
        texto:
          'Es una empresa que busca generar un impacto positivo en las personas y el medioambiente, además de ganancias (lo que se conoce como «triple impacto»). Su evaluación considera a los trabajadores, la comunidad, los clientes, el medioambiente y la gobernanza. En Chile la promueve Sistema B.'
      },
      {
        titulo: '¿Cómo se certifica una Empresa B?',
        items: [
          'Completar la Evaluación de Impacto B, que es gratuita.',
          'Obtener al menos 80 puntos en esa evaluación.',
          'Pasar el proceso de verificación.',
          'Modificar los estatutos para considerar a todos sus grupos de interés.',
          'La certificación dura tres años y su costo depende del tamaño de la empresa. No hay un tamaño mínimo para certificarse.'
        ]
      },
      {
        titulo: 'Acuerdos de Producción Limpia (APL)',
        texto:
          'Son convenios voluntarios entre un sector productivo, sus empresas y organismos públicos, con metas concretas de sostenibilidad. Los coordina la Agencia de Sustentabilidad y Cambio Climático (ASCC), con énfasis en las pymes. Al cumplir las metas, las instalaciones reciben una certificación de cumplimiento.'
      },
      {
        titulo: 'Otras herramientas',
        items: [
          'Sellos HuellaChile: reconocen la medición y la reducción de la huella de carbono.',
          'ISO 14001: norma internacional para sistemas de gestión ambiental, certificada por organismos independientes.'
        ]
      },
      {
        titulo: 'Beneficios de una gestión responsable',
        items: [
          'Genera confianza en clientes, proveedores e inversionistas.',
          'Diferencia a la empresa de su competencia.',
          'Ayuda a atraer y mantener a buenos trabajadores.',
          'Abre puertas en cadenas de suministro y licitaciones que piden criterios de sostenibilidad.'
        ]
      }
    ],
    acciones: {
      titulo: 'Primeros pasos para tu pyme',
      items: [
        'Completa el diagnóstico de esta plataforma y trabaja tu plan de acción.',
        'Haz la Evaluación de Impacto B como autoevaluación, aunque no busques certificarte todavía.',
        'Pregunta a tu gremio o asociación si existe un Acuerdo de Producción Limpia para tu sector.',
        'Mide tu huella de carbono con HuellaChile.'
      ]
    },
    nota:
      'Obtener una certificación requiere cumplir requisitos específicos y, en algunos casos, pagar costos de verificación. No todas las empresas están obligadas a certificarse.',
    fuentes: [
      { nombre: 'Sistema B', url: 'https://www.sistemab.org/' },
      { nombre: 'Agencia de Sustentabilidad y Cambio Climático (ASCC)', url: 'https://ascc.cl/' },
      { nombre: 'Programa HuellaChile', url: 'https://huellachile.mma.gob.cl/' }
    ]
  },

  // ------------------------------------------------------------------ 6
  {
    slug: 'empresas-verdes',
    titulo: 'Empresas verdes',
    resumen: 'Ideas concretas para transformar tu negocio de forma progresiva.',
    icone: ICONE_BROTO,
    perguntas: ['q_amb_03', 'q_amb_04', 'q_amb_07'],
    intro:
      'Una empresa verde es una organización que busca reducir su impacto ambiental mediante acciones concretas. No se trata de hacerlo todo de una vez: cualquier pyme puede avanzar paso a paso.',
    bloques: [
      {
        titulo: '¿Qué hace una empresa verde?',
        items: [
          'Utiliza energías renovables.',
          'Reduce y recicla sus residuos.',
          'Ahorra agua y electricidad.',
          'Utiliza materiales más sostenibles.',
          'Implementa procesos productivos más limpios.',
          'Reduce la contaminación.',
          'Protege los recursos naturales.'
        ]
      },
      {
        titulo: 'Ideas según tu rubro',
        items: [
          'Comercio: bolsas reutilizables, envases retornables y menos embalaje.',
          'Turismo y gastronomía: compostaje de residuos orgánicos y ahorro de agua.',
          'Manufactura: reutilizar recortes y sobrantes, y mantener los equipos.',
          'Servicios y tecnología: documentos digitales y reciclaje de equipos electrónicos.',
          'Construcción: separar escombros y reutilizar materiales.',
          'Agricultura: riego eficiente y protección de los suelos.'
        ]
      },
      {
        titulo: 'Comunica sin exagerar',
        texto:
          'Cuenta a tus clientes lo que realmente haces, con datos concretos. Evita frases como «100 % ecológico» si no puedes demostrarlas: esa práctica se conoce como «greenwashing» y daña la confianza.'
      }
    ],
    pasos: [
      { nombre: 'Mide', texto: 'revisa tus boletas de luz y agua y observa qué residuos generas.' },
      { nombre: 'Ahorra', texto: 'aplica medidas sin costo: apagar equipos, reparar filtraciones, separar residuos.' },
      { nombre: 'Invierte', texto: 'cuando puedas, cambia a iluminación LED, equipos eficientes o energías renovables.' },
      { nombre: 'Comunica', texto: 'comparte tus avances con clientes y trabajadores.' }
    ],
    fuentes: [{ nombre: 'Ministerio del Medio Ambiente', url: 'https://mma.gob.cl/' }]
  },

  // ------------------------------------------------------------------ 7
  {
    slug: 'ecosistemas',
    titulo: 'Ecosistemas y naturaleza',
    resumen: 'Por qué los ecosistemas son importantes y cómo tu empresa puede protegerlos.',
    icone: ICONE_ARVORE,
    perguntas: ['q_amb_08'],
    intro:
      'Los ecosistemas nos proporcionan alimentos, agua, materias primas y otros recursos fundamentales para nuestra supervivencia. Cuidar la naturaleza también significa cuidar nuestra propia calidad de vida y el futuro de las próximas generaciones.',
    bloques: [
      { titulo: 'Bosques', texto: 'Ayudan a capturar carbono, producir oxígeno y proteger los suelos.' },
      { titulo: 'Humedales', texto: 'Contribuyen a regular el agua y sirven de refugio para numerosas especies.' },
      { titulo: 'Ríos y lagos', texto: 'Proporcionan agua dulce y permiten la vida de muchos organismos.' },
      { titulo: 'Océanos', texto: 'Regulan el clima y albergan una enorme biodiversidad.' },
      {
        titulo: '¿Cómo puede afectarlos una empresa?',
        items: [
          'Residuos mal dispuestos que llegan a ríos, playas o bosques.',
          'Uso excesivo de agua o descargas contaminadas.',
          'Intervención de suelos y vegetación nativa.',
          'Ruido y luz que alteran a la fauna.'
        ]
      },
      {
        titulo: 'Ir más allá: dejar una huella positiva',
        texto: 'Además de reducir sus impactos, las empresas pueden participar activamente en la protección y recuperación de la naturaleza:',
        items: [
          'Jornadas de limpieza de playas, ríos, canales y humedales.',
          'Recolección de residuos en bosques, parques y espacios naturales.',
          'Reforestación y plantación de árboles nativos.',
          'Recuperación y mantención de áreas verdes.',
          'Educación ambiental y voluntariado en proyectos de conservación.'
        ]
      }
    ],
    nota:
      'Las actividades en espacios naturales deben realizarse de manera segura, con autorización cuando corresponda y siguiendo las recomendaciones de las autoridades ambientales. En reforestación, prefiere siempre especies nativas.',
    fuentes: [{ nombre: 'Ministerio del Medio Ambiente', url: 'https://mma.gob.cl/' }]
  },

  // ------------------------------------------------------------------ 8
  {
    slug: 'competitividad',
    titulo: 'Sostenibilidad y competitividad',
    resumen: 'Cómo la sostenibilidad se convierte en valor agregado y en ventaja para tu negocio.',
    icone: ICONE_CRESCIMENTO,
    perguntas: ['q_eco_01', 'q_eco_03'],
    intro:
      'La sostenibilidad no es un gasto innecesario ni una moda: es una oportunidad para mejorar el negocio, reducir costos, generar valor para las personas y ser más competitivos.',
    bloques: [
      {
        titulo: 'Un valor agregado para tu negocio',
        texto: 'Una empresa que reduce sus residuos, cuida a sus trabajadores y trabaja responsablemente puede:',
        items: [
          'Mejorar su imagen empresarial.',
          'Generar confianza en sus clientes.',
          'Diferenciarse de otras empresas.',
          'Atraer consumidores que valoran la sostenibilidad.',
          'Fortalecer su reputación.',
          'Generar nuevas oportunidades comerciales.'
        ]
      },
      {
        titulo: 'Una empresa más competitiva',
        items: [
          'Reduce costos gracias al ahorro de agua y electricidad.',
          'Atrae nuevos clientes y accede a nuevas oportunidades de negocio.',
          'Mejora la relación con proveedores y clientes.',
          'Se adapta a las nuevas exigencias del mercado.',
          'Innova y mejora sus procesos productivos.'
        ]
      },
      {
        titulo: 'Ejemplo',
        texto:
          'Una panadería cambia su iluminación a LED, repara las filtraciones de agua y separa el cartón para reciclaje. Sus cuentas bajan cada mes, y al contarlo en sus redes sociales atrae a clientes que valoran estas prácticas.'
      }
    ],
    acciones: {
      titulo: 'Para tu pyme',
      items: [
        'Registra cuánto ahorras con cada medida sostenible: es la mejor forma de demostrar que conviene.',
        'Identifica qué valoran tus clientes y comunícales tus avances con datos reales.',
        'Revisa si tus clientes más grandes piden criterios de sostenibilidad a sus proveedores.'
      ]
    }
  }
]

export const SLUGS_TEMAS = TEMAS.map((t) => t.slug).join('|')
export const temaPorSlug = (slug) => TEMAS.find((t) => t.slug === slug)
