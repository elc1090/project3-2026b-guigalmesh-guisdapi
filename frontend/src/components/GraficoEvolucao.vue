<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js'
import { DIMENSOES } from '../constants/dimensoes'
import { formatarDataCurta, formatarDataHora } from '../lib/datas'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip)

// historico: [{ data, geral, dimensoes: { nome: pontuacao } }], do mais antigo para o mais novo
const props = defineProps({
  historico: { type: Array, required: true }
})

// cores fixas por série (a geral mais escura e grossa)
const CORES = {
  General: 'rgb(6, 78, 59)',
  Ambiental: 'rgb(16, 185, 129)',
  Social: 'rgb(14, 165, 233)',
  Económica: 'rgb(245, 158, 11)'
}

const canvas = ref(null)
let grafico = null

// dois diagnósticos no mesmo dia: mostra a hora para os pontos não terem o mesmo rótulo
const rotulos = computed(() => {
  const dias = props.historico.map((h) => formatarDataCurta(h.data))
  const repetido = new Set(dias).size !== dias.length
  return props.historico.map((h) => (repetido ? formatarDataHora(h.data) : formatarDataCurta(h.data)))
})

const series = computed(() => [
  {
    label: 'General',
    data: props.historico.map((h) => h.geral),
    borderColor: CORES.General,
    backgroundColor: CORES.General,
    borderWidth: 3,
    pointRadius: 4
  },
  ...DIMENSOES.map((d) => ({
    label: d.nome,
    data: props.historico.map((h) => h.dimensoes?.[d.nome] ?? null),
    borderColor: CORES[d.nome],
    backgroundColor: CORES[d.nome],
    borderWidth: 2,
    borderDash: [5, 4],
    pointRadius: 3
  }))
])

function destruir() {
  grafico?.destroy()
  grafico = null
}

function desenhar() {
  if (!canvas.value || props.historico.length < 2) return
  destruir()
  grafico = new Chart(canvas.value, {
    type: 'line',
    data: { labels: rotulos.value, datasets: series.value },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, color: '#94a3b8', callback: (v) => `${v}%` },
          grid: { color: 'rgba(6, 95, 70, 0.08)' }
        },
        x: { ticks: { color: '#64748b' }, grid: { display: false } }
      },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
      }
    }
  })
}

onMounted(desenhar)
watch(() => props.historico, async () => {
  await nextTick()
  if (props.historico.length < 2) destruir()
  else desenhar()
})
onBeforeUnmount(destruir)
</script>

<template>
  <div v-if="historico.length >= 2" class="relative h-64 sm:h-72">
    <canvas ref="canvas" role="img" aria-label="Evolución de la puntuación general y por dimensión en cada diagnóstico"></canvas>
  </div>
  <p v-else class="text-sm text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
    Completa otro diagnóstico para ver tu evolución. Cada vez que actualices tus respuestas y finalices,
    tu puntuación quedará registrada aquí.
  </p>
</template>
