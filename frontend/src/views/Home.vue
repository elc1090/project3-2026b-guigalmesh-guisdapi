<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmpresaStore } from '../stores/empresa'
import { useResultadoStore } from '../stores/resultado'
import { usePerguntasStore } from '../stores/perguntas'
import { useUsuario } from '../composables/useUsuario'
import { carregarRascunho, useProgressoDiagnostico } from '../composables/useDiagnostico'
import { classeSeloNivel, classePrioridade } from '../constants/niveis'
import { ICONE_LAMPADA } from '../constants/icones'
import Esqueleto from '../components/ui/Esqueleto.vue'
import Icone from '../components/ui/Icone.vue'
import SecaoEmpresa from '../components/inicio/SecaoEmpresa.vue'
import SecaoDiagnostico from '../components/inicio/SecaoDiagnostico.vue'

// Início = antigas telas Início + Mi empresa + Diagnóstico, numa página só:
//  1. cartão com a próxima ação (muda conforme o momento da pessoa);
//  2. seção "Tu empresa" (formulário aberto se ainda não há empresa, resumo se já há);
//  3. seção "Diagnóstico" (as 4 dimensões + finalizar), só depois da empresa cadastrada.
// /empresa e /diagnostico redirecionam para cá (#empresa / #diagnostico).

const route = useRoute()
const empresaStore = useEmpresaStore()
const resultadoStore = useResultadoStore()
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
  const nomes = progresso.faltantes.value.map((d) => d.nome)
  if (nomes.length === 0) return 'Todas las preguntas respondidas: solo falta finalizar.'
  if (nomes.length === 1) return `Falta ${nomes[0]}.`
  return `Faltan ${nomes.slice(0, -1).join(', ')} y ${nomes.at(-1)}.`
})
const recomendacaoPrincipal = computed(() => resultado.value?.recomendacoes?.[0] ?? null)

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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Esqueleto v-for="n in 4" :key="n" class="h-24 sm:h-56 rounded-2xl" />
      </div>
      <span class="sr-only" role="status">Cargando...</span>
    </div>

    <template v-else>
      <!-- 1. próxima ação -->
      <section class="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <p class="text-sm text-emerald-200 truncate">
          Hola, {{ nomeUsuario }}<template v-if="empresa"> · {{ empresa.nome }}</template>
        </p>

        <template v-if="estado === 'sem-empresa'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">Empieza registrando tu empresa</h1>
          <p class="text-emerald-100 mt-2 max-w-xl">
            Completa los datos de abajo (toma menos de un minuto) y después responde el diagnóstico de sostenibilidad en 4 dimensiones.
          </p>
        </template>

        <template v-else-if="estado === 'diagnostico'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">
            {{ emAndamento ? 'Continúa tu diagnóstico' : 'Comienza tu diagnóstico' }}
          </h1>
          <template v-if="emAndamento">
            <p class="text-emerald-100 mt-2">
              {{ progresso.respondidas.value }} de {{ progresso.total.value }} preguntas respondidas. {{ textoFaltantes }}
            </p>
            <div class="h-2 bg-white/20 rounded-full overflow-hidden mt-4 max-w-md" aria-hidden="true">
              <div class="h-full bg-emerald-300 rounded-full transition-all duration-500" :style="{ width: `${progresso.porcentagem.value}%` }"></div>
            </div>
          </template>
          <p v-else class="text-emerald-100 mt-2 max-w-xl">
            {{ progresso.total.value || 'Unas' }} preguntas sobre Gobernanza, Ambiental, Social y Económica. Tu avance se guarda solo: puedes salir y volver cuando quieras.
          </p>

          <router-link
            v-if="progresso.primeiraIncompleta.value"
            :to="`/diagnostico/${progresso.primeiraIncompleta.value.slug}`"
            class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6"
          >
            {{ emAndamento ? `Continuar con ${progresso.primeiraIncompleta.value.nome}` : 'Comenzar diagnóstico' }}
          </router-link>
          <button
            v-else
            type="button"
            @click="irPara('diagnostico')"
            class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6"
          >
            Revisar y finalizar
          </button>
        </template>

        <template v-else>
          <h1 class="sr-only">Resumen de tu diagnóstico</h1>
          <div class="flex flex-wrap items-end gap-x-4 gap-y-2 mt-3">
            <p class="font-display text-5xl font-bold leading-none">
              {{ resultado.geral.pontuacao }}<span class="text-xl text-emerald-200 font-semibold"> / 100</span>
            </p>
            <span class="px-3 py-1 text-sm rounded-full font-semibold" :class="classeSeloNivel(resultado.geral.nivel)">
              Nivel {{ resultado.geral.nivel }}
            </span>
          </div>
          <p class="text-emerald-100 mt-3">Puntuación general de sostenibilidad de tu empresa.</p>
          <router-link to="/resultado" class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6">
            Ver resultados
          </router-link>
        </template>
      </section>

      <!-- recomendação principal (só com resultado) -->
      <section v-if="estado === 'concluido' && recomendacaoPrincipal" class="cartao p-5 flex items-start gap-4">
        <span class="selo-icone">
          <Icone :d="ICONE_LAMPADA" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-700">Tu próxima acción</h2>
          <p class="font-semibold text-slate-800 mt-1">{{ recomendacaoPrincipal.titulo }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ recomendacaoPrincipal.descricao }}</p>
          <span class="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border" :class="classePrioridade(recomendacaoPrincipal.prioridade)">
            {{ recomendacaoPrincipal.categoria }} · Prioridad {{ recomendacaoPrincipal.prioridade }}
          </span>
        </div>
      </section>

      <!-- 2. empresa -->
      <SecaoEmpresa @cadastrada="irPara('diagnostico')" />

      <!-- 3. diagnóstico (depois da empresa) -->
      <SecaoDiagnostico v-if="empresa" :concluido="estado === 'concluido'" />
    </template>
  </div>
</template>
