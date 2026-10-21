<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { apiFetch } from '../lib/api'

const router = useRouter()

const resultado = ref(null)
const carregando = ref(true)
const semDiagnostico = ref(false)
const erro = ref('')

const radarCanvas = ref(null)
let radarChart = null

// Ordem usada no radar (sentido horário a partir do topo), nos cards e nas barras
const ORDEM = ['Gobernanza', 'Ambiental', 'Social', 'Económica']
const posicao = (categoria) => {
  const i = ORDEM.indexOf(categoria)
  return i === -1 ? ORDEM.length : i
}

// Posição dos rótulos HTML ao redor do radar (topo, direita, base, esquerda)
const posicoesRotulo = [
  'top-0 left-1/2 -translate-x-1/2',
  'right-0 top-1/2 -translate-y-1/2',
  'bottom-0 left-1/2 -translate-x-1/2',
  'left-0 top-1/2 -translate-y-1/2'
]

const dimensoes = computed(() => {
  if (!resultado.value?.dimensoes) return []
  return Object.entries(resultado.value.dimensoes)
    .map(([nome, dados]) => ({ nome, ...(dados || {}) }))
    .sort((a, b) => posicao(a.nome) - posicao(b.nome))
})

const recomendacoes = computed(() => resultado.value?.recomendacoes ?? [])

const pct = (valor) => Math.min(100, Math.max(0, Number(valor) || 0))

// Ícones (traçado estilo Lucide, viewBox 24x24)
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
const iconeDe = (nome) => ICONES[nome] || ICONES.Ambiental

const ICONE_GRAFICO = ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3']
const ICONE_LAMPADA = [
  'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
  'M9 18h6',
  'M10 22h4'
]
const ICONE_SETA = ['M5 12h14', 'm12 5 7 7-7 7']

const DESCRICOES = {
  Gobernanza: 'Cumplimiento de prácticas de gobernanza y transparencia.',
  Ambiental: 'Gestión de recursos, impacto ambiental y uso eficiente de los recursos.',
  Social: 'Bienestar de los trabajadores, relación con la comunidad y responsabilidad social.',
  'Económica': 'Viabilidad financiera, eficiencia y generación de valor a largo plazo.'
}

const SLUGS = {
  Gobernanza: 'gobernanza',
  Ambiental: 'ambiental',
  Social: 'social',
  'Económica': 'economica'
}
const rotaDimensao = (nome) => (SLUGS[nome] ? `/diagnostico/${SLUGS[nome]}` : '/diagnostico')

const estiloNivel = {
  'Inicial': 'bg-red-100 text-red-800',
  'Básico': 'bg-amber-100 text-amber-800',
  'Intermedio': 'bg-sky-100 text-sky-800',
  'Avanzado': 'bg-emerald-100 text-emerald-800'
}

const estiloIconeNivel = {
  'Inicial': 'bg-red-100 text-red-700',
  'Básico': 'bg-amber-100 text-amber-700',
  'Intermedio': 'bg-sky-100 text-sky-700',
  'Avanzado': 'bg-emerald-100 text-emerald-700'
}

const estiloPrioridade = {
  'Alta': 'bg-red-100 text-red-800 border-red-200',
  'Media': 'bg-amber-100 text-amber-800 border-amber-200',
  'Baja': 'bg-sky-100 text-sky-800 border-sky-200'
}

const destruirGraficos = () => {
  try {
    if (radarChart) {
      radarChart.destroy()
      radarChart = null
    }
  } catch (e) {
    console.warn('Aviso ao limpar gráficos:', e)
  }
}

const desenharGraficos = () => {
  if (!radarCanvas.value || dimensoes.value.length === 0) return

  destruirGraficos()

  try {
    const rotulos = dimensoes.value.map((d) => d.nome)
    const valores = dimensoes.value.map((d) => d.pontuacao ?? 0)

    radarChart = new Chart(radarCanvas.value, {
      type: 'radar',
      data: {
        labels: rotulos,
        datasets: [{
          label: 'Puntuación',
          data: valores,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          borderColor: 'rgb(6, 95, 70)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(6, 95, 70)',
          pointRadius: 4
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            grid: { circular: true, color: 'rgba(6, 95, 70, 0.15)' },
            angleLines: { color: 'rgba(6, 95, 70, 0.15)' },
            pointLabels: { display: false },
            ticks: {
              stepSize: 25,
              backdropColor: 'transparent',
              color: '#94a3b8',
              font: { size: 9 },
              callback: (v) => `${v}%`
            }
          }
        },
        plugins: { legend: { display: false } }
      }
    })
  } catch (err) {
    console.error('Erro ao renderizar gráficos Chart.js:', err)
  }
}

onMounted(async () => {
  try {
    const response = await apiFetch('/api/diagnostico/resultado')

    if (response.status === 401 || response.status === 403) {
      router.push('/login')
      return
    }

    if (response.status === 404) {
      semDiagnostico.value = true
      return
    }

    if (!response.ok) {
      console.error('Erro do back-end:', await response.json().catch(() => null))
      erro.value = 'No fue posible cargar el resultado. Inténtalo de nuevo.'
      return
    }

    const dados = await response.json()

    if (!dados || !dados.geral || !dados.dimensoes) {
      semDiagnostico.value = true
      return
    }

    resultado.value = dados
  } catch (e) {
    console.error('Erro ao buscar resultado:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    carregando.value = false
  }

  if (resultado.value) {
    await nextTick()
    desenharGraficos()
  }
})

onBeforeUnmount(() => {
  destruirGraficos()
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4">
    <!-- Cabeçalho -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
      <div class="flex items-center gap-4">
        <span class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONE_GRAFICO" :key="i" :d="d" />
          </svg>
        </span>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-emerald-950">Resultados del diagnóstico</h1>
          <p class="text-slate-500 mt-0.5">Nivel de madurez en sostenibilidad de tu empresa</p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 lg:max-w-md">
        <span class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path v-for="(d, i) in ICONES.Ambiental" :key="i" :d="d" />
          </svg>
        </span>
        <p class="text-sm text-slate-600">
          Tus resultados te ayudarán a identificar fortalezas y oportunidades para mejorar tu desempeño sostenible.
        </p>
      </div>
    </div>

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando resultado...</span>
    </div>

    <p v-else-if="erro" class="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">{{ erro }}</p>

    <div v-else-if="semDiagnostico" class="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
      <p class="text-slate-700 text-lg mb-4">Aún no has completado el diagnóstico.</p>
      <router-link
        to="/diagnostico"
        class="inline-block bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 transition shadow-lg"
      >
        Ir al diagnóstico
      </router-link>
    </div>

    <div v-else-if="resultado && resultado.geral" class="space-y-6">
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Coluna esquerda -->
        <div class="xl:col-span-5 space-y-6">
          <!-- Resumo por dimensão (radar) -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_GRAFICO" :key="i" :d="d" />
                </svg>
              </span>
              <h2 class="text-lg font-semibold text-slate-800">Resumen por dimensión</h2>

              <div class="ml-auto flex items-center gap-2">
                <span class="text-sm text-slate-500">
                  General <strong class="text-slate-800">{{ resultado.geral?.pontuacao ?? 0 }}</strong> / 100
                </span>
                <span
                  v-if="resultado.geral?.nivel"
                  class="px-3 py-1 text-xs rounded-full font-semibold"
                  :class="estiloNivel[resultado.geral.nivel] || 'bg-slate-100 text-slate-800'"
                >
                  {{ resultado.geral.nivel }}
                </span>
              </div>
            </div>

            <div class="relative h-80 sm:h-96">
              <div class="absolute inset-x-16 sm:inset-x-24 xl:inset-x-20 inset-y-14">
                <canvas ref="radarCanvas"></canvas>
              </div>

              <div
                v-for="(dimension, i) in dimensoes.slice(0, 4)"
                :key="dimension.nome"
                class="absolute flex items-center gap-2 whitespace-nowrap"
                :class="posicoesRotulo[i]"
              >
                <span class="hidden sm:flex w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path v-for="(d, j) in iconeDe(dimension.nome)" :key="j" :d="d" />
                  </svg>
                </span>
                <div class="leading-tight">
                  <p class="text-xs font-semibold text-slate-700">{{ dimension.nome }}</p>
                  <p class="text-sm font-bold text-slate-800">{{ pct(dimension.pontuacao) }}%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparativo de dimensões -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div class="flex items-center gap-3 mb-5">
              <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_GRAFICO" :key="i" :d="d" />
                </svg>
              </span>
              <h2 class="text-lg font-semibold text-slate-800">Comparativo de dimensiones</h2>
            </div>

            <ul class="space-y-4">
              <li
                v-for="dimension in dimensoes"
                :key="dimension.nome"
                class="flex items-center gap-3"
              >
                <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path v-for="(d, i) in iconeDe(dimension.nome)" :key="i" :d="d" />
                  </svg>
                </span>
                <span class="w-24 sm:w-28 text-sm font-semibold text-slate-700 shrink-0">{{ dimension.nome }}</span>
                <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                    :style="{ width: pct(dimension.pontuacao) + '%' }"
                  ></div>
                </div>
                <span class="w-10 text-right text-sm font-semibold text-slate-700 shrink-0">{{ pct(dimension.pontuacao) }}%</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Coluna direita -->
        <div class="xl:col-span-7 space-y-6">
          <!-- Cards por dimensão -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <router-link
              v-for="dimension in dimensoes"
              :key="dimension.nome"
              :to="rotaDimensao(dimension.nome)"
              class="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-3 hover:shadow-md transition"
            >
              <div class="flex items-start gap-4">
                <span
                  class="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  :class="estiloIconeNivel[dimension.nivel] || 'bg-slate-100 text-slate-700'"
                >
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path v-for="(d, i) in iconeDe(dimension.nome)" :key="i" :d="d" />
                  </svg>
                </span>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-800">{{ dimension.nome }}</p>
                  <p class="text-3xl font-bold text-slate-800 leading-tight">{{ pct(dimension.pontuacao) }}%</p>
                </div>
              </div>

              <p class="text-sm text-slate-500">{{ DESCRICOES[dimension.nome] }}</p>

              <div class="flex items-center justify-between mt-auto pt-1">
                <span
                  class="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
                  :class="estiloNivel[dimension.nivel] || 'bg-slate-100 text-slate-800'"
                >
                  {{ dimension.nivel }}
                </span>
                <svg class="w-5 h-5 text-slate-500 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_SETA" :key="i" :d="d" />
                </svg>
              </div>
            </router-link>
          </div>

          <!-- Principais oportunidades de melhoria -->
          <div class="bg-emerald-50/50 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_LAMPADA" :key="i" :d="d" />
                </svg>
              </span>
              <div>
                <h2 class="text-lg font-semibold text-slate-800">Principales oportunidades de mejora</h2>
                <p class="text-sm text-slate-500">En base a tu diagnóstico, te recomendamos enfocarte en:</p>
              </div>
            </div>

            <div
              v-if="recomendacoes.length === 0"
              class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-center"
            >
              ¡Felicitaciones! Todas las dimensiones de tu empresa se encuentran en nivel <strong>Avanzado</strong>.
            </div>

            <div v-else class="space-y-3">
              <router-link
                v-for="(rec, index) in recomendacoes"
                :key="rec.id"
                :to="rotaDimensao(rec.categoria)"
                class="group bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4 hover:shadow-md transition"
              >
                <span class="w-8 h-8 rounded-full bg-emerald-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {{ index + 1 }}
                </span>
                <span class="hidden sm:flex w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path v-for="(d, i) in iconeDe(rec.categoria)" :key="i" :d="d" />
                  </svg>
                </span>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-800">{{ rec.titulo }}</h3>
                    <span
                      class="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                      :class="estiloPrioridade[rec.prioridade] || 'bg-slate-100 text-slate-700 border-slate-200'"
                    >
                      Prioridad {{ rec.prioridade }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-500 mt-0.5">{{ rec.descricao }}</p>
                  <p v-if="rec.indicador_sugerido" class="text-xs text-slate-500 mt-1">
                    <span class="font-semibold text-slate-700">Indicador sugerido:</span> {{ rec.indicador_sugerido }}
                  </p>
                </div>

                <svg class="w-5 h-5 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path v-for="(d, i) in ICONE_SETA" :key="i" :d="d" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <router-link
          to="/diagnostico"
          class="w-full sm:w-auto text-center bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 transition shadow-lg"
        >
          Nuevo diagnóstico
        </router-link>
      </div>
    </div>
  </div>
</template>