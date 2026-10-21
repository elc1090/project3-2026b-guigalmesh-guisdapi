<script setup>
import { ref, computed } from 'vue'

// ---------- Ícones (traçado estilo Lucide, viewBox 24x24) ----------
const ICONE_GLOBO = [
  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  'M2 12h20',
  'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'
]
const ICONE_FOLHA = [
  'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
  'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'
]
const ICONE_SETA = ['M5 12h14', 'm12 5 7 7-7 7']

// ---------- Filtro por dimensão da guia ----------
const FILTROS = [
  { id: 'todos', etiqueta: 'Todos los ODS' },
  { id: 'Gobernanza', etiqueta: 'Gobernanza' },
  { id: 'Ambiental', etiqueta: 'Ambiental' },
  { id: 'Social', etiqueta: 'Social' },
  { id: 'Económica', etiqueta: 'Económica' }
]
const filtro = ref('todos')

// ---------- Os 17 ODS ----------
// "dimensiones" segue a relação indicada na Guía sostenible (ODS 16 → Gobernanza, etc.)
const ODS = [
  {
    numero: 1,
    nombre: 'Fin de la pobreza',
    descripcion: 'Poner fin a la pobreza en todas sus formas en todo el mundo.',
    color: '#E5243B',
    dimensiones: [],
    icono: [
      'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
      'M18.09 10.37A6 6 0 1 1 10.34 18',
      'M7 6h1v4',
      'm16.71 13.88.7.71-2.82 2.82'
    ]
  },
  {
    numero: 2,
    nombre: 'Hambre cero',
    descripcion: 'Poner fin al hambre, lograr la seguridad alimentaria y promover la agricultura sostenible.',
    color: '#DDA63A',
    dimensiones: [],
    icono: [
      'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
      'M7 2v20',
      'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'
    ]
  },
  {
    numero: 3,
    nombre: 'Salud y bienestar',
    descripcion: 'Garantizar una vida sana y promover el bienestar de todas las personas en todas las edades.',
    color: '#4C9F38',
    dimensiones: ['Social'],
    icono: [
      'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'
    ]
  },
  {
    numero: 4,
    nombre: 'Educación de calidad',
    descripcion: 'Garantizar una educación inclusiva, equitativa y de calidad, y promover oportunidades de aprendizaje durante toda la vida.',
    color: '#C5192D',
    dimensiones: [],
    icono: ['M22 10v6', 'M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5']
  },
  {
    numero: 5,
    nombre: 'Igualdad de género',
    descripcion: 'Lograr la igualdad entre los géneros y empoderar a todas las mujeres y niñas.',
    color: '#FF3A21',
    dimensiones: ['Social'],
    icono: [
      'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
      'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
      'M7 21h10',
      'M12 3v18',
      'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'
    ]
  },
  {
    numero: 6,
    nombre: 'Agua limpia y saneamiento',
    descripcion: 'Garantizar la disponibilidad de agua y su gestión sostenible, y el saneamiento para todos.',
    color: '#26BDE2',
    dimensiones: [],
    icono: [
      'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'
    ]
  },
  {
    numero: 7,
    nombre: 'Energía asequible y no contaminante',
    descripcion: 'Garantizar el acceso a una energía asequible, segura, sostenible y moderna.',
    color: '#FCC30B',
    dimensiones: [],
    icono: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z']
  },
  {
    numero: 8,
    nombre: 'Trabajo decente y crecimiento económico',
    descripcion: 'Promover un crecimiento económico sostenido e inclusivo, el empleo pleno y productivo y el trabajo decente para todos.',
    color: '#A21942',
    dimensiones: ['Social', 'Económica'],
    icono: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6']
  },
  {
    numero: 9,
    nombre: 'Industria, innovación e infraestructura',
    descripcion: 'Construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación.',
    color: '#FD6925',
    dimensiones: ['Económica'],
    icono: [
      'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
      'M9 18h6',
      'M10 22h4'
    ]
  },
  {
    numero: 10,
    nombre: 'Reducción de las desigualdades',
    descripcion: 'Reducir la desigualdad en los países y entre ellos.',
    color: '#DD1367',
    dimensiones: [],
    icono: ['M5 9h14', 'M5 15h14']
  },
  {
    numero: 11,
    nombre: 'Ciudades y comunidades sostenibles',
    descripcion: 'Lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles.',
    color: '#FD9D24',
    dimensiones: [],
    icono: [
      'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z',
      'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2',
      'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2',
      'M10 6h4',
      'M10 10h4',
      'M10 14h4',
      'M10 18h4'
    ]
  },
  {
    numero: 12,
    nombre: 'Producción y consumo responsables',
    descripcion: 'Garantizar modalidades de consumo y producción sostenibles.',
    color: '#BF8B2E',
    dimensiones: ['Ambiental'],
    icono: [
      'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
      'M21 3v5h-5',
      'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
      'M8 16H3v5'
    ]
  },
  {
    numero: 13,
    nombre: 'Acción por el clima',
    descripcion: 'Adoptar medidas urgentes para combatir el cambio climático y sus efectos.',
    color: '#3F7E44',
    dimensiones: ['Ambiental'],
    icono: ['M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z']
  },
  {
    numero: 14,
    nombre: 'Vida submarina',
    descripcion: 'Conservar y utilizar de forma sostenible los océanos, los mares y los recursos marinos.',
    color: '#0A97D9',
    dimensiones: [],
    icono: [
      'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'
    ]
  },
  {
    numero: 15,
    nombre: 'Vida de ecosistemas terrestres',
    descripcion: 'Proteger, restablecer y promover el uso sostenible de los ecosistemas terrestres, gestionar los bosques de forma sostenible y detener la pérdida de biodiversidad.',
    color: '#56C02B',
    dimensiones: [],
    icono: ICONE_FOLHA
  },
  {
    numero: 16,
    nombre: 'Paz, justicia e instituciones sólidas',
    descripcion: 'Promover sociedades pacíficas e inclusivas, facilitar el acceso a la justicia y construir instituciones eficaces, responsables e inclusivas.',
    color: '#00689D',
    dimensiones: ['Gobernanza'],
    icono: ['M3 22h18', 'M6 18v-7', 'M10 18v-7', 'M14 18v-7', 'M18 18v-7', 'M12 2l8 5H4z']
  },
  {
    numero: 17,
    nombre: 'Alianzas para lograr los objetivos',
    descripcion: 'Fortalecer los medios de implementación y revitalizar la alianza mundial para el desarrollo sostenible.',
    color: '#19486A',
    dimensiones: [],
    icono: [
      'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
      'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
    ]
  }
]

const visibles = computed(() =>
  filtro.value === 'todos' ? ODS : ODS.filter((o) => o.dimensiones.includes(filtro.value))
)
</script>

<template>
  <div class="max-w-6xl mx-auto py-4 sm:py-8 px-1 sm:px-4 space-y-6 sm:space-y-8">
    <!-- Cabeçalho -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center gap-4">
        <span class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONE_GLOBO" :key="i" :d="d" />
          </svg>
        </span>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-emerald-950">Objetivos de Desarrollo Sostenible</h1>
          <p class="text-slate-500 mt-0.5">Los 17 objetivos de la Agenda 2030 y su relación con la sostenibilidad de las empresas</p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 lg:max-w-md">
        <span class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONE_FOLHA" :key="i" :d="d" />
          </svg>
        </span>
        <p class="text-sm text-slate-600">
          Las empresas pueden contribuir a estos objetivos con acciones concretas en su gestión diaria.
        </p>
      </div>
    </div>

    <!-- Filtros por dimensão -->
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por dimensión">
        <button
          v-for="f in FILTROS"
          :key="f.id"
          type="button"
          class="px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer"
          :class="filtro === f.id
            ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'"
          :aria-pressed="filtro === f.id"
          @click="filtro = f.id"
        >
          {{ f.etiqueta }}
        </button>
      </div>
      <p class="text-xs sm:text-sm text-slate-500">
        Las etiquetas verdes indican las dimensiones de la Guía sostenible relacionadas con cada ODS.
        Mostrando {{ visibles.length }} de {{ ODS.length }}.
      </p>
    </div>

    <!-- Cards dos ODS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <article
        v-for="o in visibles"
        :key="o.numero"
        class="bg-white rounded-2xl shadow-sm border border-slate-200/80 border-t-4 p-5 flex flex-col gap-3 hover:shadow-md transition"
        :style="{ borderTopColor: o.color }"
      >
        <div class="flex items-center gap-4">
          <span
            class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white"
            :style="{ backgroundColor: o.color }"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path v-for="(d, i) in o.icono" :key="i" :d="d" />
            </svg>
          </span>
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500">ODS {{ o.numero }}</p>
            <h2 class="font-semibold text-slate-800 leading-snug">{{ o.nombre }}</h2>
          </div>
        </div>

        <p class="text-sm text-slate-500">{{ o.descripcion }}</p>

        <div v-if="o.dimensiones.length" class="flex flex-wrap gap-2 mt-auto pt-1">
          <span
            v-for="dim in o.dimensiones"
            :key="dim"
            class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold"
          >
            {{ dim }}
          </span>
        </div>
      </article>
    </div>

    <!-- Ligação com a guia -->
    <section class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-emerald-950">¿Por dónde empezar?</h2>
        <p class="text-slate-600 text-sm sm:text-base mt-1">
          La Guía sostenible propone acciones concretas, ejemplos e indicadores para cada dimensión.
        </p>
      </div>
      <router-link
        to="/guia"
        class="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 transition shadow-lg"
      >
        Ver la guía
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path v-for="(d, i) in ICONE_SETA" :key="i" :d="d" />
        </svg>
      </router-link>
    </section>
  </div>
</template>