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
const barrasCanvas = ref(null)
let radarChart = null
let barrasChart = null

const ORDEM = ['Ambiental', 'Social', 'Económica', 'Gobernanza']
const posicao = (categoria) => {
  const i = ORDEM.indexOf(categoria)
  return i === -1 ? ORDEM.length : i
}

const dimensoes = computed(() => {
  if (!resultado.value?.dimensoes) return []
  return Object.entries(resultado.value.dimensoes)
    .map(([nome, dados]) => ({ nome, ...(dados || {}) }))
    .sort((a, b) => posicao(a.nome) - posicao(b.nome))
})

const recomendacoes = computed(() => resultado.value?.recomendacoes ?? [])

const estiloNivel = {
  'Inicial': 'bg-red-100 text-red-800',
  'Básico': 'bg-amber-100 text-amber-800',
  'Intermedio': 'bg-sky-100 text-sky-800',
  'Avanzado': 'bg-emerald-100 text-emerald-800'
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
    if (barrasChart) {
      barrasChart.destroy()
      barrasChart = null
    }
  } catch (e) {
    console.warn('Aviso ao limpar gráficos:', e)
  }
}

const desenharGraficos = () => {
  if (!radarCanvas.value || !barrasCanvas.value || dimensoes.value.length === 0) return

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
          backgroundColor: 'rgba(6, 95, 70, 0.2)',
          borderColor: 'rgb(6, 95, 70)',
          pointBackgroundColor: 'rgb(6, 95, 70)'
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
        plugins: { legend: { display: false } }
      }
    })

    barrasChart = new Chart(barrasCanvas.value, {
      type: 'bar',
      data: {
        labels: rotulos,
        datasets: [{
          label: 'Puntuación',
          data: valores,
          backgroundColor: 'rgb(6, 95, 70)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: { x: { min: 0, max: 100 } },
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
  <div class="max-w-5xl mx-auto py-4 sm:py-8 px-1 sm:px-4">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-800">Resultado del diagnóstico</h1>
      <p class="text-slate-500 mt-1 sm:mt-2">Nivel de madurez en sostenibilidad de tu empresa, por dimensión.</p>
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

    <div v-else-if="resultado && resultado.geral" class="space-y-6 sm:space-y-8">
      <!-- Pontuação Geral -->
      <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm sm:text-base text-slate-500">Puntuación general</p>
          <p class="text-4xl sm:text-5xl font-bold text-slate-800 mt-1">
            {{ resultado.geral?.pontuacao ?? 0 }}<span class="text-xl sm:text-2xl text-slate-500"> / 100</span>
          </p>
        </div>
        <span
          v-if="resultado.geral?.nivel"
          class="px-3.5 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full font-semibold shrink-0"
          :class="estiloNivel[resultado.geral.nivel] || 'bg-slate-100 text-slate-800'"
        >
          {{ resultado.geral.nivel }}
        </span>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Perfil por dimensión</h2>
          <div class="relative h-64 sm:h-80">
            <canvas ref="radarCanvas"></canvas>
          </div>
        </div>

        <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Puntuación por dimensión</h2>
          <div class="relative h-64 sm:h-80">
            <canvas ref="barrasCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Detalhe por Dimensão -->
      <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Detalle</h2>
        <ul class="divide-y divide-slate-200">
          <li
            v-for="dimension in dimensoes"
            :key="dimension.nome"
            class="flex items-center justify-between py-3 gap-2"
          >
            <span class="font-medium text-slate-700">{{ dimension.nome }}</span>
            <span class="flex items-center gap-3 sm:gap-4 shrink-0">
              <span class="text-sm sm:text-base text-slate-600">{{ dimension.pontuacao ?? 0 }} / 100</span>
              <span
                class="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
                :class="estiloNivel[dimension.nivel] || 'bg-slate-100 text-slate-800'"
              >
                {{ dimension.nivel }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <!-- Recomendações Priorizadas -->
      <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-slate-800">Acciones recomendadas</h2>
          <p class="text-sm text-slate-500 mt-1">
            Sugerencias ordenadas por prioridad según las dimensiones con menor puntuación.
          </p>
        </div>

        <div
          v-if="recomendacoes.length === 0"
          class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-center"
        >
          ¡Felicitaciones! Todas las dimensiones de tu empresa se encuentran en nivel <strong>Avanzado</strong>.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rec in recomendacoes"
            :key="rec.id"
            class="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                  {{ rec.categoria }} ({{ rec.pontuacao_dimensao }} pts)
                </span>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="estiloPrioridade[rec.prioridade] || 'bg-slate-100 text-slate-700 border-slate-200'"
                >
                  Prioridad {{ rec.prioridade }}
                </span>
              </div>
            </div>
            <h3 class="text-base font-bold text-slate-800 mt-1">{{ rec.titulo }}</h3>
            <p class="text-sm text-slate-600">{{ rec.descricao }}</p>
            <p v-if="rec.indicador_sugerido" class="text-xs text-slate-500 mt-1">
              <span class="font-semibold text-slate-700">Indicador sugerido:</span> {{ rec.indicador_sugerido }}
            </p>
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