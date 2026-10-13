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

// ordem de exibição; dimensões que não estiverem aqui vão para o final
const ORDEM = ['Ambiental', 'Social', 'Económica', 'Gobernanza']
const posicao = (categoria) => {
  const i = ORDEM.indexOf(categoria)
  return i === -1 ? ORDEM.length : i
}

const dimensoes = computed(() => {
  if (!resultado.value) return []
  return Object.entries(resultado.value.dimensoes)
    .map(([nome, dados]) => ({ nome, ...dados }))
    .sort((a, b) => posicao(a.nome) - posicao(b.nome))
})

const estiloNivel = {
  'Inicial': 'bg-red-100 text-red-800',
  'Básico': 'bg-amber-100 text-amber-800',
  'Intermedio': 'bg-sky-100 text-sky-800',
  'Avanzado': 'bg-emerald-100 text-emerald-800'
}

const desenharGraficos = () => {
  const rotulos = dimensoes.value.map((d) => d.nome)
  const valores = dimensoes.value.map((d) => d.pontuacao)

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
}

onMounted(async () => {
  try {
    const response = await apiFetch('/api/diagnostico/resultado')

    // Sessão ausente ou expirada: manda para o login
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

    resultado.value = await response.json()
    carregando.value = false

    // espera o Vue renderizar os <canvas> antes de desenhar
    await nextTick()
    desenharGraficos()
  } catch (e) {
    console.error('Erro ao buscar resultado:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    carregando.value = false
  }
})

onBeforeUnmount(() => {
  radarChart?.destroy()
  barrasChart?.destroy()
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 px-4">

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800">Resultado del diagnóstico</h1>
      <p class="text-slate-500 mt-2">Nivel de madurez en sostenibilidad de tu empresa, por dimensión.</p>
    </div>

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando resultado...</span>
    </div>

    <p v-else-if="erro" class="text-red-600">{{ erro }}</p>

    <div v-else-if="semDiagnostico" class="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
      <p class="text-slate-700 text-lg mb-4">Aún no has completado el diagnóstico.</p>
      <router-link
        to="/diagnostico"
        class="inline-block bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 transition shadow-lg"
      >
        Ir al diagnóstico
      </router-link>
    </div>

    <div v-else-if="resultado" class="space-y-8">

      <div class="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p class="text-slate-500">Puntuación general</p>
          <p class="text-5xl font-bold text-slate-800">{{ resultado.geral.pontuacao }}<span class="text-2xl text-slate-500"> / 100</span></p>
        </div>
        <span
          class="px-4 py-2 rounded-full font-semibold"
          :class="estiloNivel[resultado.geral.nivel]"
        >
          {{ resultado.geral.nivel }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Perfil por dimensión</h2>
          <div class="relative h-80">
            <canvas ref="radarCanvas"></canvas>
          </div>
        </div>

        <div class="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Puntuación por dimensión</h2>
          <div class="relative h-80">
            <canvas ref="barrasCanvas"></canvas>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Detalle</h2>
        <ul class="divide-y divide-slate-200">
          <li
            v-for="dimension in dimensoes"
            :key="dimension.nome"
            class="flex items-center justify-between py-3"
          >
            <span class="font-medium text-slate-700">{{ dimension.nome }}</span>
            <span class="flex items-center gap-4">
              <span class="text-slate-600">{{ dimension.pontuacao }} / 100</span>
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="estiloNivel[dimension.nivel]"
              >
                {{ dimension.nivel }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <div class="flex justify-end">
        <router-link
          to="/diagnostico"
          class="bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 transition shadow-lg"
        >
          Nuevo diagnóstico
        </router-link>
      </div>

    </div>
  </div>
</template>