<script setup>
import { ref, watch } from 'vue'
import { sessao } from '../lib/auth'

// ---------- Navegação interna ----------
const SECCIONES = [
  { id: 'gobernanza', etiqueta: 'Gobernanza' },
  { id: 'ambiental', etiqueta: 'Ambiental' },
  { id: 'social', etiqueta: 'Social' },
  { id: 'economica', etiqueta: 'Económica' },
  { id: 'plan', etiqueta: 'Plan de acción' },
  { id: 'verificacion', etiqueta: 'Lista de verificación' },
  { id: 'comenzar', etiqueta: '¿Cómo comenzar?' }
]

const irA = (id) => {
  document.getElementById(`guia-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---------- Ícones (traçado estilo Lucide, viewBox 24x24) ----------
const ICONES = {
  Gobernanza: ['M3 22h18', 'M6 18v-7', 'M10 18v-7', 'M14 18v-7', 'M18 18v-7', 'M12 2l8 5H4z'],
  Ambiental: [
    'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
    'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'
  ],
  Social: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75'
  ],
  'Económica': [
    'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
    'M18.09 10.37A6 6 0 1 1 10.34 18',
    'M7 6h1v4',
    'm16.71 13.88.7.71-2.82 2.82'
  ]
}
const ICONE_LIVRO = [
  'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
  'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
]
const ICONE_LAMPADA = [
  'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
  'M9 18h6',
  'M10 22h4'
]
const ICONE_GRAFICO = ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3']
const ICONE_CHECK = ['M20 6 9 17l-5-5']
const ICONE_SETA = ['M5 12h14', 'm12 5 7 7-7 7']

// ---------- Conteúdo da guia ----------
const DIMENSIONES = [
  {
    id: 'gobernanza',
    nombre: 'Gobernanza',
    lema: 'Gestionar con responsabilidad, transparencia y ética.',
    descripcion:
      'La gobernanza se relaciona con la forma en que una empresa toma decisiones, cumple sus obligaciones y mantiene relaciones de confianza con sus trabajadores, clientes y proveedores.',
    acciones: [
      { titulo: 'Promueve la transparencia', texto: 'informa claramente los precios, las condiciones de venta y las políticas de tu empresa.' },
      { titulo: 'Define responsabilidades', texto: 'establece quién se encarga de las tareas y decisiones importantes.' },
      { titulo: 'Actúa con ética', texto: 'evita los conflictos de interés, la discriminación y las prácticas deshonestas.' },
      { titulo: 'Cumple las normas', texto: 'mantén actualizados los permisos, registros y obligaciones que correspondan a tu actividad.' },
      { titulo: 'Protege la información', texto: 'cuida los datos personales de tus clientes y trabajadores.' },
      { titulo: 'Escucha a tus grupos de interés', texto: 'recibe sugerencias y reclamos, y busca soluciones oportunas.' }
    ],
    ejemplo:
      'Una pequeña empresa crea un procedimiento para registrar los reclamos de sus clientes, responderlos oportunamente y utilizar esa información para mejorar sus servicios.',
    indicadores: [
      'Porcentaje de reclamos respondidos.',
      'Número de procedimientos internos documentados.',
      'Porcentaje de obligaciones revisadas y cumplidas.'
    ],
    ods: [{ numero: 16, nombre: 'Paz, justicia e instituciones sólidas' }]
  },
  {
    id: 'ambiental',
    nombre: 'Ambiental',
    lema: 'Reducir el impacto ambiental de las actividades empresariales.',
    descripcion:
      'La gestión ambiental busca utilizar responsablemente los recursos naturales, reducir los residuos y prevenir los impactos negativos que genera la actividad de una empresa.',
    acciones: [
      { titulo: 'Ahorra energía', texto: 'apaga las luces y los equipos que no se estén utilizando.' },
      { titulo: 'Reduce el consumo de agua', texto: 'repara las filtraciones y evita el desperdicio.' },
      { titulo: 'Separa los residuos', texto: 'habilita recipientes para papel, cartón, vidrio y otros materiales que puedan reciclarse según las alternativas disponibles.' },
      { titulo: 'Reduce los plásticos', texto: 'utiliza envases reutilizables cuando sea posible.' },
      { titulo: 'Evita el desperdicio', texto: 'compra los materiales necesarios y aprovecha los recursos disponibles.' },
      { titulo: 'Prefiere alternativas sostenibles', texto: 'evalúa productos duraderos, reciclables o con menor impacto ambiental.' },
      { titulo: 'Mide tus consumos', texto: 'revisa periódicamente las cuentas de agua y electricidad para detectar oportunidades de ahorro.' }
    ],
    ejemplo:
      'Un almacén reemplaza parte de sus ampolletas por iluminación LED, separa el cartón de los residuos comunes y registra mensualmente su consumo de electricidad.',
    indicadores: [
      'Consumo mensual de electricidad en kWh.',
      'Consumo mensual de agua en m³.',
      'Cantidad de residuos reciclados.',
      'Reducción porcentual del consumo de recursos.'
    ],
    ods: [
      { numero: 12, nombre: 'Producción y consumo responsables' },
      { numero: 13, nombre: 'Acción por el clima' }
    ]
  },
  {
    id: 'social',
    nombre: 'Social',
    lema: 'Construir un entorno de trabajo seguro, inclusivo y respetuoso.',
    descripcion:
      'La dimensión social considera el bienestar de los trabajadores, la igualdad de oportunidades, la seguridad laboral y la relación de la empresa con su comunidad.',
    acciones: [
      { titulo: 'Cuida la seguridad laboral', texto: 'identifica riesgos y aplica medidas preventivas adecuadas.' },
      { titulo: 'Promueve el respeto', texto: 'establece reglas claras contra el acoso, la discriminación y el maltrato.' },
      { titulo: 'Fomenta la igualdad de oportunidades', texto: 'aplica criterios justos en la contratación, capacitación y desarrollo profesional.' },
      { titulo: 'Capacita a tus trabajadores', texto: 'entrega conocimientos que les permitan mejorar sus habilidades.' },
      { titulo: 'Escucha a tu equipo', texto: 'realiza reuniones breves para conocer inquietudes y propuestas.' },
      { titulo: 'Respeta los derechos laborales', texto: 'cumple las obligaciones aplicables a las condiciones de trabajo.' },
      { titulo: 'Apoya a tu comunidad', texto: 'considera iniciativas locales, proveedores cercanos y actividades de colaboración cuando sean pertinentes.' }
    ],
    ejemplo:
      'Una pyme organiza reuniones mensuales para escuchar a sus trabajadores, revisar las condiciones de seguridad e identificar mejoras en el ambiente laboral.',
    indicadores: [
      'Número de capacitaciones realizadas.',
      'Porcentaje de trabajadores capacitados.',
      'Número de incidentes laborales registrados.',
      'Nivel de satisfacción de los trabajadores.'
    ],
    ods: [
      { numero: 3, nombre: 'Salud y bienestar' },
      { numero: 5, nombre: 'Igualdad de género' },
      { numero: 8, nombre: 'Trabajo decente y crecimiento económico' }
    ]
  },
  {
    id: 'economica',
    nombre: 'Económica',
    lema: 'Crecer de manera responsable y mantener la estabilidad financiera.',
    descripcion:
      'La sostenibilidad económica busca que la empresa sea viable en el tiempo, utilice eficientemente sus recursos y tome decisiones que favorezcan su continuidad y crecimiento.',
    acciones: [
      { titulo: 'Controla tus gastos', texto: 'registra los costos fijos y variables para identificar oportunidades de ahorro.' },
      { titulo: 'Planifica tus ingresos', texto: 'elabora un presupuesto mensual y compara los resultados reales con lo planificado.' },
      { titulo: 'Administra tu inventario', texto: 'evita las compras excesivas, las pérdidas y los productos vencidos.' },
      { titulo: 'Mejora tus procesos', texto: 'identifica actividades que consumen demasiado tiempo o recursos.' },
      { titulo: 'Evalúa a tus proveedores', texto: 'compara calidad, precio, cumplimiento y condiciones de pago.' },
      { titulo: 'Invierte con planificación', texto: 'analiza los costos, beneficios y riesgos antes de realizar inversiones.' },
      { titulo: 'Fortalece la relación con tus clientes', texto: 'escucha sus necesidades y mejora la calidad de tus productos o servicios.' }
    ],
    ejemplo:
      'Una pequeña empresa lleva un registro mensual de sus ventas, gastos e inventario. Con esta información identifica productos con baja rotación y ajusta sus compras para reducir pérdidas.',
    indicadores: [
      'Variación mensual de los gastos.',
      'Margen de ganancia.',
      'Porcentaje de pérdidas de inventario.',
      'Nivel de satisfacción y retención de clientes.'
    ],
    ods: [
      { numero: 8, nombre: 'Trabajo decente y crecimiento económico' },
      { numero: 9, nombre: 'Industria, innovación e infraestructura' }
    ]
  }
]

// Nome com acento usado nos mapas de ícones
const nombreIcono = (id) => DIMENSIONES.find((d) => d.id === id)?.nombre

const PLAN_ACCION = [
  { accion: 'Revisar el consumo de electricidad', responsable: 'Administración', plazo: '30 días', indicador: 'kWh mensuales' },
  { accion: 'Implementar separación de residuos', responsable: 'Encargado de operaciones', plazo: '30 días', indicador: 'Residuos separados' },
  { accion: 'Realizar una reunión con trabajadores', responsable: 'Jefatura', plazo: '30 días', indicador: 'Reuniones realizadas' },
  { accion: 'Revisar el presupuesto mensual', responsable: 'Administración o finanzas', plazo: 'Mensual', indicador: 'Variación de gastos' },
  { accion: 'Revisar las prácticas de transparencia', responsable: 'Gerencia', plazo: '60 días', indicador: 'Procedimientos revisados' }
]

const VERIFICACION = [
  {
    id: 'gobernanza',
    items: [
      'La empresa tiene responsabilidades claramente definidas.',
      'Existen procedimientos para atender reclamos.',
      'Se revisan las obligaciones legales aplicables.',
      'Se protege la información de clientes y trabajadores.'
    ]
  },
  {
    id: 'ambiental',
    items: [
      'Se controla el consumo de electricidad y agua.',
      'Se separan los residuos cuando existen alternativas adecuadas.',
      'Se toman medidas para reducir desperdicios.',
      'Se revisa periódicamente el consumo de recursos.'
    ]
  },
  {
    id: 'social',
    items: [
      'Se identifican y previenen riesgos laborales.',
      'Se promueve un ambiente de respeto.',
      'Se escucha a los trabajadores.',
      'Se ofrecen oportunidades de capacitación.'
    ]
  },
  {
    id: 'economica',
    items: [
      'Se registran los ingresos y gastos.',
      'Se controla el inventario.',
      'Se revisan los resultados financieros.',
      'Se evalúan los costos y beneficios de las inversiones.'
    ]
  }
]

const PASOS = [
  { nombre: 'Evalúa', texto: 'completa el diagnóstico de sostenibilidad de Verde Impulso.' },
  { nombre: 'Identifica', texto: 'revisa qué dimensiones presentan mayores oportunidades de mejora.' },
  { nombre: 'Prioriza', texto: 'selecciona dos o tres acciones que sean importantes y viables para tu empresa.' },
  { nombre: 'Implementa', texto: 'asigna responsables, recursos y fechas de cumplimiento.' },
  { nombre: 'Mide', texto: 'utiliza indicadores para conocer los avances.' },
  { nombre: 'Mejora', texto: 'revisa los resultados y ajusta las acciones cuando sea necesario.' }
]

// ---------- Lista de verificação (marcações salvas por usuário no navegador) ----------
const chaveStorage = () => `guia-verificacion-${sessao.value?.user?.id || 'anon'}`

const carregarMarcados = () => {
  try {
    return JSON.parse(localStorage.getItem(chaveStorage())) || {}
  } catch {
    return {}
  }
}

const marcados = ref(carregarMarcados())

watch(
  marcados,
  (valor) => {
    try {
      localStorage.setItem(chaveStorage(), JSON.stringify(valor))
    } catch {
      /* sem armazenamento disponível: a lista funciona apenas na sessão */
    }
  },
  { deep: true }
)

const idItem = (grupo, indice) => `${grupo}-${indice}`
const totalMarcados = (grupo) => grupo.items.filter((_, i) => marcados.value[idItem(grupo.id, i)]).length
const porcentaje = (grupo) => Math.round((totalMarcados(grupo) / grupo.items.length) * 100)
</script>

<template>
  <div class="max-w-6xl mx-auto py-4 sm:py-8 px-1 sm:px-4 space-y-6 sm:space-y-8">
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4">
      <span class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path v-for="(d, i) in ICONE_LIVRO" :key="i" :d="d" />
        </svg>
      </span>
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">Verde Impulso</p>
        <h1 class="text-2xl sm:text-3xl font-bold text-emerald-950">Guía sostenible</h1>
        <p class="text-slate-500 mt-0.5">Pequeñas acciones, grandes cambios</p>
      </div>
    </div>

    <!-- Boas-vindas -->
    <div class="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
      <h2 class="text-xl sm:text-2xl font-bold mb-3">Bienvenido a tu guía de sostenibilidad</h2>
      <p class="text-emerald-50/90 mb-3">
        La sostenibilidad permite que las empresas crezcan de manera responsable, cuiden el medioambiente, promuevan el bienestar de las personas y administren mejor sus recursos.
      </p>
      <p class="text-emerald-50/90 mb-5">
        Esta guía te ayudará a identificar oportunidades de mejora e implementar acciones concretas en tu empresa, independientemente de su tamaño o actividad económica.
      </p>
      <div class="bg-white/10 rounded-xl p-4 text-sm sm:text-base">
        <span class="font-bold">Objetivo:</span>
        entregar recomendaciones prácticas para mejorar la sostenibilidad empresarial y avanzar hacia una gestión más responsable.
      </div>
    </div>

    <!-- Atalhos para as seções -->
    <nav class="flex flex-wrap gap-2" aria-label="Secciones de la guía">
      <button
        v-for="seccion in SECCIONES"
        :key="seccion.id"
        type="button"
        class="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
        @click="irA(seccion.id)"
      >
        {{ seccion.etiqueta }}
      </button>
    </nav>

    <!-- 1 a 4: Dimensões -->
    <section
      v-for="(dim, idx) in DIMENSIONES"
      :id="'guia-' + dim.id"
      :key="dim.id"
      class="scroll-mt-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7"
    >
      <div class="flex items-start gap-4 mb-4">
        <span class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONES[dim.nombre]" :key="i" :d="d" />
          </svg>
        </span>
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {{ idx + 1 }}. Dimensión de {{ dim.nombre }}
          </p>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800">{{ dim.lema }}</h2>
        </div>
      </div>

      <p class="text-slate-600 mb-6">{{ dim.descripcion }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3">
          <h3 class="font-semibold text-slate-800 mb-3">¿Qué puedes hacer en tu empresa?</h3>
          <ul class="space-y-3">
            <li v-for="accion in dim.acciones" :key="accion.titulo" class="flex gap-3">
              <span class="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_CHECK" :key="i" :d="d" />
                </svg>
              </span>
              <p class="text-sm text-slate-600">
                <strong class="text-slate-800">{{ accion.titulo }}:</strong> {{ accion.texto }}
              </p>
            </li>
          </ul>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div class="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2 text-amber-800">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path v-for="(d, i) in ICONE_LAMPADA" :key="i" :d="d" />
              </svg>
              <h3 class="font-semibold">Ejemplo práctico</h3>
            </div>
            <p class="text-sm text-slate-600">{{ dim.ejemplo }}</p>
          </div>

          <div class="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2 text-emerald-800">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path v-for="(d, i) in ICONE_GRAFICO" :key="i" :d="d" />
              </svg>
              <h3 class="font-semibold">Indicadores que puedes utilizar</h3>
            </div>
            <ul class="space-y-1.5">
              <li v-for="indicador in dim.indicadores" :key="indicador" class="flex gap-2 text-sm text-slate-600">
                <span class="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                {{ indicador }}
              </li>
            </ul>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {{ dim.ods.length > 1 ? 'ODS relacionados' : 'ODS relacionado' }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="o in dim.ods"
                :key="o.numero"
                class="px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-xs sm:text-sm text-sky-900"
              >
                <strong>ODS {{ o.numero }}</strong> · {{ o.nombre }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5: Plano de ação -->
    <section id="guia-plan" class="scroll-mt-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7">
      <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">5. Plan de acción sostenible</p>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mt-1 mb-2">De las recomendaciones a los resultados</h2>
      <p class="text-slate-600 mb-5">
        Para transformar las recomendaciones en resultados, es importante definir acciones concretas, responsables y plazos.
      </p>

      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full min-w-[36rem] text-sm text-left">
          <thead class="bg-emerald-50 text-emerald-900">
            <tr>
              <th class="px-4 py-3 font-semibold">Acción</th>
              <th class="px-4 py-3 font-semibold">Responsable</th>
              <th class="px-4 py-3 font-semibold">Plazo sugerido</th>
              <th class="px-4 py-3 font-semibold">Indicador</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-600">
            <tr v-for="fila in PLAN_ACCION" :key="fila.accion" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ fila.accion }}</td>
              <td class="px-4 py-3">{{ fila.responsable }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ fila.plazo }}</td>
              <td class="px-4 py-3">{{ fila.indicador }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs sm:text-sm text-slate-500 mt-3">
        Los plazos son orientativos y pueden adaptarse a las necesidades, recursos y tamaño de cada empresa.
      </p>
    </section>

    <!-- 6: Lista de verificação -->
    <section id="guia-verificacion" class="scroll-mt-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7">
      <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">6. Lista de verificación de sostenibilidad</p>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mt-1 mb-2">Identifica oportunidades de mejora</h2>
      <p class="text-slate-600 mb-5">Utiliza esta lista para comenzar a identificar oportunidades de mejora.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div
          v-for="grupo in VERIFICACION"
          :key="grupo.id"
          class="border border-slate-200 rounded-xl p-4 sm:p-5"
        >
          <div class="flex items-center gap-3 mb-3">
            <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path v-for="(d, i) in ICONES[nombreIcono(grupo.id)]" :key="i" :d="d" />
              </svg>
            </span>
            <h3 class="font-semibold text-slate-800">{{ nombreIcono(grupo.id) }}</h3>
            <span class="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
              {{ totalMarcados(grupo) }} / {{ grupo.items.length }}
            </span>
          </div>

          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              :style="{ width: porcentaje(grupo) + '%' }"
            ></div>
          </div>

          <ul class="space-y-2">
            <li v-for="(item, i) in grupo.items" :key="i">
              <label class="flex items-start gap-3 cursor-pointer rounded-lg p-1.5 hover:bg-slate-50">
                <input
                  v-model="marcados[idItem(grupo.id, i)]"
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 shrink-0 accent-emerald-700 cursor-pointer"
                />
                <span
                  class="text-sm"
                  :class="marcados[idItem(grupo.id, i)] ? 'text-slate-400 line-through' : 'text-slate-600'"
                >
                  {{ item }}
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 7: Como começar -->
    <section id="guia-comenzar" class="scroll-mt-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7">
      <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">7. ¿Cómo comenzar?</p>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mt-1 mb-5">Seis pasos para avanzar</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(paso, i) in PASOS"
          :key="paso.nombre"
          class="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4"
        >
          <span class="w-9 h-9 rounded-full bg-emerald-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
            {{ i + 1 }}
          </span>
          <p class="text-sm text-slate-600">
            <strong class="block text-slate-800 text-base">Paso {{ i + 1 }}. {{ paso.nombre }}</strong>
            {{ paso.texto }}
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <router-link
          to="/diagnostico"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 transition shadow-lg"
        >
          Ir al diagnóstico
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONE_SETA" :key="i" :d="d" />
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Compromisso -->
    <section class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8 text-center">
      <h2 class="text-xl sm:text-2xl font-bold text-emerald-950 mb-2">Nuestro compromiso</h2>
      <p class="text-slate-600 max-w-2xl mx-auto">
        La sostenibilidad no requiere cambiar toda una empresa de un día para otro. Comienza con acciones pequeñas, medibles y constantes.
      </p>
      <p class="font-semibold text-emerald-800 mt-3">Verde Impulso: pequeñas acciones, grandes cambios.</p>
    </section>

    <p class="text-xs text-slate-500 text-center max-w-3xl mx-auto pb-2">
      Esta guía tiene fines orientativos. Las acciones deben adaptarse a la actividad, tamaño y obligaciones aplicables a cada empresa. Los indicadores sugeridos son ejemplos y no constituyen una certificación de sostenibilidad.
    </p>
  </div>
</template>