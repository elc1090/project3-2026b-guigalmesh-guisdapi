<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEmpresaStore } from '../stores/empresa'
import { useResultadoStore } from '../stores/resultado'
import { useActividadesStore } from '../stores/actividades'
import { FECHAS_AMBIENTALES } from '../constants/huella'
import { proximasEfemerides, dataLocal, hojeLocal } from '../lib/fechasAmbientales'
import { usePerguntasStore } from '../stores/perguntas'
import { useUsuario } from '../composables/useUsuario'
import { carregarRascunho, useProgressoDiagnostico } from '../composables/useDiagnostico'
import { classeSeloNivel, classePrioridade } from '../constants/niveis'
import { ICONE_LAMPADA, ICONE_ARVORE, ICONE_SETA } from '../constants/icones'
import Esqueleto from '../components/ui/Esqueleto.vue'
import Icone from '../components/ui/Icone.vue'
import SecaoEmpresa from '../components/inicio/SecaoEmpresa.vue'
import SecaoDiagnostico from '../components/inicio/SecaoDiagnostico.vue'
import BotoesAcao from '../components/BotoesAcao.vue'
import { formatarData } from '../lib/datas'
import { nomeDimensao, rotuloNivel, rotuloPrioridade, localeData } from '../i18n/rotulos'

// Início = antigas telas Início + Mi empresa + Diagnóstico, numa página só:
//  1. cartão com a próxima ação (muda conforme o momento da pessoa);
//  2. seção "Tu empresa" (formulário aberto se ainda não há empresa, resumo se já há);
//  3. seção "Diagnóstico" (as 3 dimensões + finalizar), só depois da empresa cadastrada.
// /empresa e /diagnostico redirecionam para cá (#empresa / #diagnostico).

const route = useRoute()
const { t } = useI18n()
const empresaStore = useEmpresaStore()
const resultadoStore = useResultadoStore()
const actividadesStore = useActividadesStore()
const perguntasStore = usePerguntasStore()
const { nome: nomeUsuario } = useUsuario()
const progresso = useProgressoDiagnostico()

const empresa = computed(() => empresaStore.dado ?? null)
const resultado = computed(() => resultadoStore.dado ?? null)

// o rascunho só existe depois do cadastro da empresa (antes disso o back-end responde 400)
const rascunhoPronto = ref(false)
watch(
  () => empresaStore.dado,
  (emp) => {
    if (!emp || rascunhoPronto.value) return
    carregarRascunho()
      .catch((e) => console.error('Erro ao carregar rascunho:', e))
      .finally(() => { rascunhoPronto.value = true })
  },
  { immediate: true }
)

const estado = computed(() => {
  if (!empresa.value) return 'sem-empresa'
  if (resultado.value) return 'concluido'
  return 'diagnostico'
})

// esqueleto até saber em qual estado a pessoa está (evita mostrar "Comenzar" e trocar para "Continuar")
const carregando = computed(() => {
  if (empresaStore.carregando || resultadoStore.carregando) return true
  return !!empresa.value && (!rascunhoPronto.value || perguntasStore.dado === undefined)
})

const emAndamento = computed(() => progresso.respondidas.value > 0)
const textoFaltantes = computed(() => {
  const nomes = progresso.faltantes.value.map((d) => nomeDimensao(d.nome))
  if (nomes.length === 0) return t('inicio.todasRespondidas')
  if (nomes.length === 1) return t('inicio.falta', { nome: nomes[0] })
  return t('inicio.faltan', { lista: nomes.slice(0, -1).join(', '), ultimo: nomes.at(-1) })
})
// próxima ação = a primeira recomendação (mais prioritária) que ainda não foi realizada
const recomendacoes = computed(() => resultado.value?.recomendacoes ?? [])
const recomendacaoPrincipal = computed(() => recomendacoes.value.find((r) => r.status !== 'realizada') ?? null)
const realizadas = computed(() => recomendacoes.value.filter((r) => r.status === 'realizada').length)
const planoConcluido = computed(() => recomendacoes.value.length > 0 && realizadas.value === recomendacoes.value.length)
const dataDiagnostico = computed(() => formatarData(resultado.value?.concluido_em))

// cartão "Tu huella positiva": totais + próxima atividade planejada (ou a próxima data ambiental)
const huella = computed(() => actividadesStore.dado ?? null)
const proximaActividad = computed(() => {
  const hoje = hojeLocal()
  return (huella.value?.actividades ?? [])
    .filter((a) => a.estado === 'planificada' && dataLocal(a.fecha) >= hoje)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0] ?? null
})
const proximaFecha = proximasEfemerides(FECHAS_AMBIENTALES, hojeLocal(), 1)[0]
const fmtNum = (n) => Number(n || 0).toLocaleString(localeData(), { maximumFractionDigits: 1 })
const diaMes = (data) => data?.toLocaleDateString(localeData(), { day: 'numeric', month: 'long' }) ?? ''
const fechaCurta = (texto) => diaMes(dataLocal(texto))

// rola até uma seção (links /#diagnostico vindos de outras telas, ou depois de cadastrar a empresa)
const irPara = async (id) => {
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(
  [carregando, () => route.hash],
  ([ocupado, hash]) => { if (!ocupado && hash) irPara(hash.slice(1)) },
  { immediate: true }
)

onMounted(() => {
  empresaStore.carregar().catch((e) => console.error('Erro ao carregar empresa:', e))
  resultadoStore.carregar().catch((e) => console.error('Erro ao carregar resultado:', e))
  actividadesStore.carregar().catch((e) => console.error('Erro ao carregar atividades:', e))
  perguntasStore.carregar().catch((e) => console.error('Erro ao carregar perguntas:', e))
})
</script>

<template>
  <div class="max-w-5xl mx-auto w-full py-1 sm:py-4 space-y-6 sm:space-y-8">
    <!-- esqueleto com o desenho da página -->
    <div v-if="carregando" class="space-y-6" aria-busy="true">
      <div class="rounded-2xl sm:rounded-3xl bg-emerald-900/90 p-6 sm:p-8 space-y-4">
        <Esqueleto class="h-4 w-40 bg-white/20!" />
        <Esqueleto class="h-8 w-3/4 bg-white/20!" />
        <Esqueleto class="h-4 w-2/3 bg-white/20!" />
      </div>
      <Esqueleto class="h-20 w-full rounded-2xl" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Esqueleto v-for="n in 3" :key="n" class="h-24 sm:h-56 rounded-2xl" />
      </div>
      <span class="sr-only" role="status">{{ t('comum.cargando') }}</span>
    </div>

    <template v-else>
      <!-- 1. próxima ação -->
      <section class="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <p class="text-sm text-emerald-200 truncate">
          {{ t('inicio.hola', { nome: nomeUsuario }) }}<template v-if="empresa"> · {{ empresa.nome }}</template>
        </p>

        <template v-if="estado === 'sem-empresa'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">{{ t('inicio.semEmpresaTitulo') }}</h1>
          <p class="text-emerald-100 mt-2 max-w-xl">
            {{ t('inicio.semEmpresaTexto') }}
          </p>
        </template>

        <template v-else-if="estado === 'diagnostico'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">
            {{ emAndamento ? t('inicio.continua') : t('inicio.comienza') }}
          </h1>
          <template v-if="emAndamento">
            <p class="text-emerald-100 mt-2">
              {{ t('inicio.respondidas', { n: progresso.respondidas.value, total: progresso.total.value }) }} {{ textoFaltantes }}
            </p>
            <div class="h-2 bg-white/20 rounded-full overflow-hidden mt-4 max-w-md" aria-hidden="true">
              <div class="h-full bg-emerald-300 rounded-full transition-all duration-500" :style="{ width: `${progresso.porcentagem.value}%` }"></div>
            </div>
          </template>
          <p v-else class="text-emerald-100 mt-2 max-w-xl">
            {{ t('inicio.introPreguntas', { n: progresso.total.value || t('inicio.unas') }) }}
          </p>

          <router-link
            v-if="progresso.primeiraIncompleta.value"
            :to="`/diagnostico/${progresso.primeiraIncompleta.value.slug}`"
            class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6"
          >
            {{ emAndamento ? t('inicio.continuarCon', { nome: nomeDimensao(progresso.primeiraIncompleta.value.nome) }) : t('inicio.comenzar') }}
          </router-link>
          <button
            v-else
            type="button"
            @click="irPara('diagnostico')"
            class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6"
          >
            {{ t('inicio.revisarFinalizar') }}
          </button>
        </template>

        <template v-else>
          <h1 class="sr-only">{{ t('inicio.resumenSr') }}</h1>
          <div class="flex flex-wrap items-end gap-x-4 gap-y-2 mt-3">
            <p class="font-display text-5xl font-bold leading-none">
              {{ resultado.geral.pontuacao }}<span class="text-xl text-emerald-200 font-semibold"> / 100</span>
            </p>
            <span class="px-3 py-1 text-sm rounded-full font-semibold" :class="classeSeloNivel(resultado.geral.nivel)">
              {{ t('inicio.nivel', { nivel: rotuloNivel(resultado.geral.nivel) }) }}
            </span>
          </div>
          <p class="text-emerald-100 mt-3">{{ t('inicio.puntuacion') }}</p>
          <p v-if="dataDiagnostico" class="text-emerald-200 text-sm mt-1">{{ t('inicio.ultimo', { data: dataDiagnostico }) }}</p>
          <router-link to="/resultado" class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6">
            {{ t('inicio.verResultados') }}
          </router-link>
        </template>
      </section>

      <!-- recomendação principal (só com resultado) -->
      <section v-if="estado === 'concluido' && recomendacaoPrincipal" class="cartao p-5 flex items-start gap-4">
        <span class="selo-icone">
          <Icone :d="ICONE_LAMPADA" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-700">{{ t('inicio.proximaAccion') }}</h2>
          <p class="font-semibold text-slate-800 mt-1">{{ recomendacaoPrincipal.titulo }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ recomendacaoPrincipal.descricao }}</p>
          <span class="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border" :class="classePrioridade(recomendacaoPrincipal.prioridade)">
            {{ nomeDimensao(recomendacaoPrincipal.categoria) }} · {{ t('inicio.prioridad', { p: rotuloPrioridade(recomendacaoPrincipal.prioridade) }) }}
          </span>
          <BotoesAcao :recomendacao="recomendacaoPrincipal" class="mt-3" />
          <p class="text-xs text-slate-500 mt-3">
            {{ t('inicio.accionesRealizadas', { n: realizadas, total: recomendacoes.length }) }} ·
            <router-link to="/resultado" class="font-semibold text-emerald-800 hover:underline">{{ t('inicio.verPlan') }}</router-link>
          </p>
        </div>
      </section>

      <!-- todas as recomendações realizadas: hora de medir de novo -->
      <section v-else-if="estado === 'concluido' && planoConcluido" class="cartao p-5 flex items-start gap-4">
        <span class="selo-icone">
          <Icone :d="ICONE_LAMPADA" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-700">{{ t('inicio.planCompletado') }}</h2>
          <p class="font-semibold text-slate-800 mt-1">{{ t('inicio.realizaste', { n: recomendacoes.length }) }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ t('inicio.actualizaTexto') }}</p>
          <button type="button" class="btn-primario w-full sm:w-auto mt-3" @click="irPara('diagnostico')">{{ t('inicio.actualizar') }}</button>
        </div>
      </section>

      <!-- huella positiva: totais das atividades ambientais (só depois de cadastrar a empresa) -->
      <section v-if="empresa" class="cartao p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <span class="selo-icone">
          <Icone :d="ICONE_ARVORE" class="w-5 h-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-700">{{ t('inicio.tuHuella') }}</h2>
          <p v-if="huella?.resumen?.actividades_realizadas" class="font-semibold text-slate-800 mt-1">
            {{ t('inicio.actividadesRealizadas', { n: huella.resumen.actividades_realizadas }, huella.resumen.actividades_realizadas) }}
            · {{ t('inicio.kgResiduos', { n: fmtNum(huella.resumen.kg_residuos) }) }}
            · {{ t('inicio.arboles', { n: fmtNum(huella.resumen.arboles_plantados) }) }}
          </p>
          <p v-else class="font-semibold text-slate-800 mt-1">{{ t('inicio.organiza') }}</p>
          <p class="text-sm text-slate-500 mt-1">
            <template v-if="proximaActividad">{{ t('inicio.proximaActividad') }} <strong class="text-slate-700">{{ proximaActividad.titulo }}</strong>, {{ fechaCurta(proximaActividad.fecha) }}.</template>
            <template v-else-if="proximaFecha">{{ t('inicio.proximaFecha') }} <strong class="text-slate-700">{{ proximaFecha.nombre }}</strong>, {{ diaMes(proximaFecha.data) }}.</template>
          </p>
        </div>
        <router-link to="/huella-positiva" class="btn-secundario btn-compacto shrink-0">
          {{ t('inicio.verHuella') }}
          <Icone :d="ICONE_SETA" class="w-4 h-4" />
        </router-link>
      </section>

      <!-- 2. empresa -->
      <SecaoEmpresa @cadastrada="irPara('diagnostico')" />

      <!-- 3. diagnóstico (depois da empresa) -->
      <SecaoDiagnostico v-if="empresa" :concluido="estado === 'concluido'" />
    </template>
  </div>
</template>
