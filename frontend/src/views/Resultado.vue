<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import { useResultadoStore } from '../stores/resultado'
import { useHistoricoStore } from '../stores/historico'
import BotoesAcao from '../components/BotoesAcao.vue'
import GraficoEvolucao from '../components/GraficoEvolucao.vue'
import AnaliseIA from '../components/AnaliseIA.vue'
import { formatarData } from '../lib/datas'
import Icone from '../components/ui/Icone.vue'
import Pagina from '../components/ui/Pagina.vue'
import Esqueleto from '../components/ui/Esqueleto.vue'
import Alerta from '../components/ui/Alerta.vue'
import { DIMENSOES, dimensaoPorNome } from '../constants/dimensoes'
import { nomeDimensao, rotuloNivel, rotuloPrioridade, rotuloEtapa, fmtNumero } from '../i18n/rotulos'
import { classeSeloNivel, classeIconeNivel, classePrioridade } from '../constants/niveis'
import { ICONE_GRAFICO, ICONE_LAMPADA, ICONE_FOLHA, ICONE_CHECK, ICONE_SETA, ICONE_CALENDARIO, ICONE_TENDENCIA } from '../constants/icones'

// registra só o necessário para o radar ('chart.js/auto' trazia todos os tipos de gráfico)
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const resultadoStore = useResultadoStore()
const historicoStore = useHistoricoStore()
const router = useRouter()

const resultado = computed(() => resultadoStore.dado ?? null)
// spinner só se nunca carregou o resultado (sem cache)
const carregando = computed(() => resultadoStore.carregando)
const semDiagnostico = computed(() => resultadoStore.dado === null)
const erro = ref('')

const radarCanvas = ref(null)
let radarChart = null

// Ordem de DIMENSOES: radar (sentido horário a partir do topo), cards e barras
const posicao = (categoria) => {
  const i = DIMENSOES.findIndex((d) => d.nome === categoria)
  return i === -1 ? DIMENSOES.length : i
}

// Posição dos rótulos HTML ao redor do radar: com 3 dimensões o radar é um triângulo
// (vértices no topo, embaixo à direita e embaixo à esquerda, no sentido horário)
const posicoesRotulo = [
  'top-0 left-1/2 -translate-x-1/2',
  'right-0 top-[68%] -translate-y-1/2',
  'left-0 top-[68%] -translate-y-1/2'
]

const dimensoes = computed(() => {
  if (!resultado.value?.dimensoes) return []
  return Object.entries(resultado.value.dimensoes)
    .map(([nome, dados]) => ({ nome, ...(dados || {}) }))
    .sort((a, b) => posicao(a.nome) - posicao(b.nome))
})

const fortalezas = computed(() => resultado.value?.fortalezas ?? [])
const dataDiagnostico = computed(() => formatarData(resultado.value?.concluido_em))
const historico = computed(() => historicoStore.dado ?? [])

// plano de ação: as já realizadas vão para o fim da lista (a ordem de prioridade se mantém)
const recomendacoes = computed(() => {
  const todas = resultado.value?.recomendacoes ?? []
  return [...todas.filter((r) => r.status !== 'realizada'), ...todas.filter((r) => r.status === 'realizada')]
})
const realizadas = computed(() => recomendacoes.value.filter((r) => r.status === 'realizada').length)
const progressoPlano = computed(() =>
  recomendacoes.value.length ? Math.round((realizadas.value / recomendacoes.value.length) * 100) : 0
)

// mostra as principais primeiro; o resto fica atrás do botão "Ver todas"
const LIMITE_RECOMENDACOES = 6
const verTodas = ref(false)
const recomendacoesVisiveis = computed(() =>
  verTodas.value ? recomendacoes.value : recomendacoes.value.slice(0, LIMITE_RECOMENDACOES)
)

// o back-end pode apontar para telas que ainda não existem: só mostra o link se a rota existir
const enlaceValido = (enlace) => !!enlace?.para && router.resolve(enlace.para).matched.length > 0

// fortalezas agrupadas por dimensão, na ordem de DIMENSOES
const fortalezasPorDimensao = computed(() =>
  DIMENSOES
    .map((d) => ({ nome: d.nome, itens: fortalezas.value.filter((f) => f.categoria === d.nome) }))
    .filter((g) => g.itens.length)
)

const pct = (valor) => Math.min(100, Math.max(0, Number(valor) || 0))

const iconeDe = (nome) => dimensaoPorNome(nome)?.icone ?? ICONE_FOLHA
const { t, locale } = useI18n()
const descricaoDe = (nome) => {
  const slug = dimensaoPorNome(nome)?.slug
  return slug ? t(`dimensao.${slug}.descricao`) : ''
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
    const rotulos = dimensoes.value.map((d) => nomeDimensao(d.nome))
    const valores = dimensoes.value.map((d) => d.pontuacao ?? 0)

    radarChart = new Chart(radarCanvas.value, {
      type: 'radar',
      data: {
        labels: rotulos,
        datasets: [{
          label: t('resultado.puntuacion'),
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
            // sem números nos anéis: com 3 eixos eles ficavam por baixo dos pontos, e o valor
            // de cada dimensão já aparece no rótulo ao lado do vértice
            ticks: { stepSize: 25, display: false }
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
  // resultado já em cache: desenha na hora (o canvas já está no DOM)
  if (resultado.value) desenharGraficos()

  // o gráfico de evolução carrega em paralelo e não bloqueia a tela
  historicoStore.carregar().catch((e) => console.error('Erro ao carregar histórico:', e))

  try {
    await resultadoStore.carregar()
  } catch (e) {
    if (e?.status === 401) return // o apiFetch já leva ao login
    console.error('Erro ao buscar resultado:', e)
    if (resultadoStore.dado === undefined) {
      erro.value = e?.status ? 'resultado.erroCargar' : 'comum.conexion'
    }
  }
})

// redesenha quando o resultado chega pela rede (primeira busca ou revalidação em segundo plano)
watch(resultado, async (novo) => {
  if (!novo) {
    destruirGraficos()
    return
  }
  await nextTick()
  desenharGraficos()
})

// o rótulo do tooltip do radar muda com o idioma
watch(locale, () => { if (resultado.value) desenharGraficos() })

onBeforeUnmount(() => {
  destruirGraficos()
})
</script>

<template>
  <Pagina
    largura="larga"
    :icone="ICONE_GRAFICO"
    :titulo="t('resultado.titulo')"
    :subtitulo="t('resultado.subtitulo')"
  >

    <!-- esqueleto com o mesmo desenho da tela (sem "pulo" quando o resultado chega) -->
    <div v-if="carregando" class="grid grid-cols-1 xl:grid-cols-12 gap-6" aria-busy="true">
      <div class="xl:col-span-5 space-y-6">
        <div class="cartao p-6 space-y-4"><Esqueleto class="h-6 w-1/2" /><Esqueleto class="h-72 w-full rounded-full mx-auto max-w-72" /></div>
      </div>
      <div class="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 content-start">
        <div v-for="n in 3" :key="n" class="cartao p-5 space-y-3"><Esqueleto class="h-14 w-14 rounded-full" /><Esqueleto class="h-4 w-full" /><Esqueleto class="h-6 w-24 rounded-full" /></div>
      </div>
      <span class="sr-only" role="status">{{ t('resultado.cargando') }}</span>
    </div>

    <Alerta v-else-if="erro">{{ t(erro) }}</Alerta>

    <div v-else-if="semDiagnostico" class="cartao p-8 text-center">
      <p class="text-slate-700 text-lg mb-4">{{ t('resultado.sinDiagnostico') }}</p>
      <router-link
        to="/#diagnostico"
        class="btn-primario"
      >
        {{ t('resultado.irDiagnostico') }}
      </router-link>
    </div>

    <div v-else-if="resultado && resultado.geral" class="space-y-6">
      <p v-if="dataDiagnostico" class="flex items-center gap-2 text-sm text-slate-500">
        <Icone :d="ICONE_CALENDARIO" class="w-4 h-4 text-emerald-700" />
        {{ t('resultado.ultimo') }} <strong class="text-slate-700">{{ dataDiagnostico }}</strong>
      </p>

      <!-- celular: nota geral no topo (no desktop ela fica no cabeçalho do radar, visível sem rolar) -->
      <p class="xl:hidden flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {{ t('resultado.general') }} <strong class="text-2xl text-slate-800">{{ fmtNumero(resultado.geral.pontuacao) }}</strong> / 100
        <span class="px-3 py-1 text-xs rounded-full font-semibold" :class="classeSeloNivel(resultado.geral.nivel)">{{ rotuloNivel(resultado.geral.nivel) }}</span>
      </p>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Coluna esquerda (no celular vem depois do plano de ação: primeiro o que fazer) -->
        <div class="xl:col-span-5 space-y-6 order-2 xl:order-1">
          <!-- Resumo por dimensão (radar) -->
          <div class="cartao p-5 sm:p-6">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <span class="selo-icone">
                <Icone :d="ICONE_GRAFICO" class="w-5 h-5" />
              </span>
              <h2 class="text-lg font-semibold text-slate-800">{{ t('resultado.resumen') }}</h2>

              <div class="ml-auto flex items-center gap-2">
                <span class="text-sm text-slate-500">
                  {{ t('resultado.general') }} <strong class="text-slate-800">{{ fmtNumero(resultado.geral?.pontuacao) }}</strong> / 100
                </span>
                <span
                  v-if="resultado.geral?.nivel"
                  class="px-3 py-1 text-xs rounded-full font-semibold"
                  :class="classeSeloNivel(resultado.geral.nivel)"
                >
                  {{ rotuloNivel(resultado.geral.nivel) }}
                </span>
              </div>
            </div>

            <div class="relative h-80 sm:h-96">
              <div class="absolute inset-x-16 sm:inset-x-24 xl:inset-x-20 inset-y-14">
                <canvas ref="radarCanvas"></canvas>
              </div>

              <div
                v-for="(dimension, i) in dimensoes.slice(0, 3)"
                :key="dimension.nome"
                class="absolute flex items-center gap-2 whitespace-nowrap"
                :class="posicoesRotulo[i]"
              >
                <span class="hidden sm:flex w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
                  <Icone :d="iconeDe(dimension.nome)" class="w-5 h-5" />
                </span>
                <div class="leading-tight">
                  <p class="text-xs font-semibold text-slate-700">{{ nomeDimensao(dimension.nome) }}</p>
                  <p class="text-sm font-bold text-slate-800">{{ fmtNumero(pct(dimension.pontuacao)) }}%</p>
                </div>
              </div>
            </div>
          </div>


          <!-- Evolução: uma linha por dimensão, um ponto por diagnóstico concluído (só com 2 ou mais) -->
          <div v-if="historico.length >= 2" class="cartao p-5 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="selo-icone">
                <Icone :d="ICONE_TENDENCIA" class="w-5 h-5" />
              </span>
              <div>
                <h2 class="text-lg font-semibold text-slate-800">{{ t('resultado.evolucion') }}</h2>
                <p class="text-sm text-slate-500">{{ t('resultado.evolucionTexto') }}</p>
              </div>
            </div>
            <GraficoEvolucao :historico="historico" />
          </div>
        </div>

        <!-- Coluna direita. Celular: notas, plano de ação, IA, pontos fortes; desktop: ordem do HTML -->
        <div class="xl:col-span-7 flex flex-col gap-6 order-1 xl:order-2">
          <!-- Cards por dimensão -->
          <div class="order-1 xl:order-none grid grid-cols-3 gap-2 sm:gap-6">
            <article
              v-for="dimension in dimensoes"
              :key="dimension.nome"
              class="cartao p-3 sm:p-5 flex flex-col gap-2 sm:gap-3"
            >
              <div class="flex items-start gap-4">
                <span
                  class="hidden sm:flex w-14 h-14 rounded-full items-center justify-center shrink-0"
                  :class="classeIconeNivel(dimension.nivel)"
                >
                  <Icone :d="iconeDe(dimension.nome)" class="w-7 h-7" />
                </span>
                <div class="min-w-0">
                  <p class="text-sm sm:text-base font-semibold text-slate-800 truncate">{{ nomeDimensao(dimension.nome) }}</p>
                  <p class="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">{{ fmtNumero(pct(dimension.pontuacao)) }}%</p>
                </div>
              </div>

              <p class="hidden sm:block text-sm text-slate-500">{{ descricaoDe(dimension.nome) }}</p>

              <div class="mt-auto pt-1">
                <span
                  class="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
                  :class="classeSeloNivel(dimension.nivel)"
                >
                  {{ rotuloNivel(dimension.nivel) }}
                </span>
              </div>
            </article>
          </div>

          <!-- Análise personalizada com IA (Gemini) -->
          <AnaliseIA class="order-3 xl:order-none" :concluido-em="resultado.concluido_em || ''" />

          <!-- Principais oportunidades de melhoria -->
          <div class="order-2 xl:order-none bg-emerald-50/50 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Icone :d="ICONE_LAMPADA" class="w-5 h-5" />
              </span>
              <div>
                <h2 class="text-lg font-semibold text-slate-800">{{ t('resultado.oportunidades') }}</h2>
                <p class="text-sm text-slate-500">{{ t('resultado.oportunidadesTexto') }}</p>
              </div>
            </div>

            <!-- progresso do plano de ação -->
            <div v-if="recomendacoes.length" class="mb-4">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="font-semibold text-slate-700">{{ t('resultado.plan') }}</span>
                <span class="text-slate-500">
                  {{ t('resultado.accionesRealizadas', { n: realizadas, total: recomendacoes.length }) }}
                </span>
              </div>
              <div class="h-2.5 bg-white border border-emerald-100 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="progressoPlano" aria-valuemin="0" aria-valuemax="100" :aria-label="t('resultado.accionesAria')">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" :style="{ width: progressoPlano + '%' }"></div>
              </div>
            </div>

            <div
              v-if="recomendacoes.length === 0"
              class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-center"
            >
              {{ t('resultado.felicitaciones') }}
            </div>

            <ol v-else class="space-y-3">
              <li
                v-for="(rec, index) in recomendacoesVisiveis"
                :key="rec.id"
                class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3 sm:gap-4 transition"
                :class="{ 'opacity-70': rec.status === 'realizada' }"
              >
                <span class="w-8 h-8 rounded-full bg-emerald-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {{ index + 1 }}
                </span>
                <span class="hidden sm:flex w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
                  <Icone :d="iconeDe(rec.categoria)" class="w-5 h-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-800">{{ rec.titulo }}</h3>
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-full border"
                      :class="classePrioridade(rec.prioridade)"
                    >
                      {{ t('resultado.prioridad', { p: rotuloPrioridade(rec.prioridade) }) }}
                    </span>
                  </div>
                  <p v-if="rec.parametro" class="text-xs font-semibold uppercase tracking-wide text-emerald-700 mt-0.5">
                    {{ nomeDimensao(rec.categoria) }} · {{ rec.parametro }}<template v-if="rec.etapa"> · {{ rotuloEtapa(rec.etapa) }}</template>
                  </p>
                  <p class="text-xs sm:text-sm text-slate-500 mt-0.5">{{ rec.descricao }}</p>
                  <p v-if="rec.indicador_sugerido" class="text-xs text-slate-500 mt-1">
                    <span class="font-semibold text-slate-700">{{ t('resultado.indicador') }}</span> {{ rec.indicador_sugerido }}
                  </p>
                  <div v-if="rec.ods?.length || enlaceValido(rec.enlace)" class="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      v-for="n in rec.ods"
                      :key="n"
                      class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                      :title="t('resultado.odsTitulo', { n })"
                    >
                      ODS {{ n }}
                    </span>
                    <router-link
                      v-if="enlaceValido(rec.enlace)"
                      :to="rec.enlace.para"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                    >
                      {{ rec.enlace.rotulo }}
                      <Icone :d="ICONE_SETA" class="w-3.5 h-3.5" />
                    </router-link>
                  </div>
                  <BotoesAcao :recomendacao="rec" class="mt-3" />
                </div>
              </li>
            </ol>

            <button
              v-if="recomendacoes.length > LIMITE_RECOMENDACOES"
              type="button"
              class="mt-4 w-full text-sm font-semibold text-emerald-800 hover:underline cursor-pointer"
              :aria-expanded="verTodas"
              @click="verTodas = !verTodas"
            >
              {{ verTodas ? t('resultado.verMenos') : t('resultado.verTodas', { n: recomendacoes.length }) }}
            </button>
          </div>

          <!-- O que a empresa já faz bem (respostas no nível máximo) -->
          <div v-if="fortalezas.length" class="order-4 xl:order-none cartao p-5 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="selo-icone">
                <Icone :d="ICONE_CHECK" class="w-5 h-5" />
              </span>
              <div>
                <h2 class="text-lg font-semibold text-slate-800">{{ t('resultado.haceBien') }}</h2>
                <p class="text-sm text-slate-500">{{ t('resultado.haceBienTexto') }}</p>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="grupo in fortalezasPorDimensao" :key="grupo.nome">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{{ nomeDimensao(grupo.nome) }}</p>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="f in grupo.itens"
                    :key="f.pergunta_id"
                    class="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200"
                  >
                    <Icone :d="ICONE_CHECK" class="w-3.5 h-3.5 text-emerald-700" />
                    {{ f.parametro }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- secundário: o questionário abre com as respostas atuais, para revisar o que mudou -->
      <p class="text-sm text-slate-500 text-center sm:text-right">
        {{ t('resultado.cambios') }}
        <router-link to="/#diagnostico" class="font-semibold text-emerald-800 hover:underline">{{ t('resultado.actualizar') }}</router-link>
      </p>
    </div>
  </Pagina>
</template>