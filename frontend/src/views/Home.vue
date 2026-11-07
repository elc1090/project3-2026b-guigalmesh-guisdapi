<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmpresaStore } from '../stores/empresa'
import { useResultadoStore } from '../stores/resultado'
import { usePerguntasStore } from '../stores/perguntas'
import { useUsuario } from '../composables/useUsuario'
import { carregarRascunho, useProgressoDiagnostico } from '../composables/useDiagnostico'
import { classeSeloNivel, classePrioridade } from '../constants/niveis'
import { ICONE_LIVRO, ICONE_GLOBO, ICONE_CHECK, ICONE_LAMPADA } from '../constants/icones'
import Esqueleto from '../components/ui/Esqueleto.vue'
import Icone from '../components/ui/Icone.vue'

// Início: mostra UMA próxima ação, conforme o momento da pessoa
//  - sem empresa: registrar a empresa
//  - empresa, sem resultado: começar / continuar o diagnóstico (com o progresso)
//  - com resultado: resumo (pontuação, nível, recomendação principal) e ver resultados
// A navegação para as outras telas fica na barra lateral / inferior.

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
  return estado.value === 'diagnostico' && (!rascunhoPronto.value || perguntasStore.dado === undefined)
})

const emAndamento = computed(() => progresso.respondidas.value > 0)
const destinoDiagnostico = computed(() =>
  progresso.primeiraIncompleta.value ? `/diagnostico/${progresso.primeiraIncompleta.value.slug}` : '/diagnostico'
)
const textoFaltantes = computed(() => {
  const nomes = progresso.faltantes.value.map((d) => d.nome)
  if (nomes.length === 0) return 'Todas las preguntas respondidas: solo falta finalizar.'
  if (nomes.length === 1) return `Falta ${nomes[0]}.`
  return `Faltan ${nomes.slice(0, -1).join(', ')} y ${nomes.at(-1)}.`
})

const recomendacaoPrincipal = computed(() => resultado.value?.recomendacoes?.[0] ?? null)

const passos = computed(() => {
  const atual = { 'sem-empresa': 0, diagnostico: 1, concluido: 2 }[estado.value]
  return ['Empresa', 'Diagnóstico', 'Resultados'].map((rotulo, i) => ({
    rotulo,
    situacao: i < atual || estado.value === 'concluido' ? 'feito' : i === atual ? 'atual' : 'pendente'
  }))
})

onMounted(() => {
  empresaStore.carregar().catch((e) => console.error('Erro ao carregar empresa:', e))
  resultadoStore.carregar().catch((e) => console.error('Erro ao carregar resultado:', e))
  perguntasStore.carregar().catch((e) => console.error('Erro ao carregar perguntas:', e))
})
</script>

<template>
  <div class="max-w-3xl mx-auto w-full py-1 sm:py-4 space-y-4 sm:space-y-6">
    <!-- esqueleto com o desenho do cartão principal -->
    <div v-if="carregando" class="space-y-4 sm:space-y-6" aria-busy="true">
      <div class="rounded-2xl sm:rounded-3xl bg-emerald-900/90 p-6 sm:p-8 space-y-4">
        <Esqueleto class="h-4 w-40 bg-white/20!" />
        <Esqueleto class="h-8 w-3/4 bg-white/20!" />
        <Esqueleto class="h-4 w-2/3 bg-white/20!" />
        <Esqueleto class="h-12 w-full sm:w-48 bg-white/20!" />
      </div>
      <Esqueleto class="h-16 w-full rounded-2xl" />
      <span class="sr-only" role="status">Cargando...</span>
    </div>

    <template v-else>
      <!-- cartão principal: saudação + a próxima ação (um botão só) -->
      <section class="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <p class="text-sm text-emerald-200 truncate">
          Hola, {{ nomeUsuario }}<template v-if="empresa"> · {{ empresa.nome }}</template>
        </p>

        <!-- 1. sem empresa -->
        <template v-if="estado === 'sem-empresa'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">Empieza registrando tu empresa</h1>
          <p class="text-emerald-100 mt-2 max-w-xl">
            Con unos pocos datos personalizamos el diagnóstico de sostenibilidad de tu organización. Toma menos de un minuto.
          </p>
          <router-link to="/empresa" class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6">
            Registrar empresa
          </router-link>
        </template>

        <!-- 2. diagnóstico por começar ou em andamento -->
        <template v-else-if="estado === 'diagnostico'">
          <h1 class="text-2xl sm:text-3xl font-bold mt-2 text-balance">
            {{ emAndamento ? 'Continúa tu diagnóstico' : 'Comienza tu diagnóstico' }}
          </h1>
          <template v-if="emAndamento">
            <p class="text-emerald-100 mt-2">
              {{ progresso.respondidas.value }} de {{ progresso.total.value }} preguntas respondidas. {{ textoFaltantes }}
            </p>
            <div
              class="h-2 bg-white/20 rounded-full overflow-hidden mt-4 max-w-md"
              role="progressbar"
              aria-label="Progreso del diagnóstico"
              :aria-valuenow="progresso.porcentagem.value"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="h-full bg-emerald-300 rounded-full transition-all duration-500" :style="{ width: `${progresso.porcentagem.value}%` }"></div>
            </div>
          </template>
          <p v-else class="text-emerald-100 mt-2 max-w-xl">
            {{ progresso.total.value || 'Unas' }} preguntas sobre Gobernanza, Ambiental, Social y Económica. Tu avance se guarda solo: puedes salir y volver cuando quieras.
          </p>
          <router-link
            :to="destinoDiagnostico"
            class="btn-primario bg-white! text-emerald-900! hover:bg-emerald-50! w-full sm:w-auto mt-6"
          >
            {{ emAndamento ? (progresso.completo.value ? 'Revisar y finalizar' : 'Continuar') : 'Comenzar diagnóstico' }}
          </router-link>
        </template>

        <!-- 3. diagnóstico concluído -->
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

      <!-- etapas: só indicam onde a pessoa está (a navegação fica na barra) -->
      <ol class="cartao px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2" aria-label="Etapas">
        <li v-for="(passo, i) in passos" :key="passo.rotulo" class="flex items-center gap-2 min-w-0" :class="i < passos.length - 1 ? 'flex-1' : ''">
          <span
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
            :class="{
              'bg-emerald-100 border-emerald-300 text-emerald-800': passo.situacao === 'feito',
              'bg-emerald-800 border-emerald-800 text-white': passo.situacao === 'atual',
              'bg-white border-slate-300 text-slate-500': passo.situacao === 'pendente'
            }"
            :aria-current="passo.situacao === 'atual' ? 'step' : undefined"
          >
            <Icone v-if="passo.situacao === 'feito'" :d="ICONE_CHECK" :stroke-width="3" class="w-3.5 h-3.5" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="text-sm font-semibold truncate" :class="passo.situacao === 'pendente' ? 'text-slate-400' : 'text-slate-700'">
            {{ passo.rotulo }}<span class="sr-only">{{ { feito: ' (completado)', atual: ' (etapa actual)', pendente: ' (pendiente)' }[passo.situacao] }}</span>
          </span>
          <span v-if="i < passos.length - 1" class="hidden sm:block flex-1 h-px bg-slate-200 mx-2" aria-hidden="true"></span>
        </li>
      </ol>

      <!-- ação secundária, discreta -->
      <p v-if="estado === 'concluido'" class="text-sm text-slate-500 text-center">
        ¿Hubo cambios en tu empresa?
        <router-link to="/diagnostico" class="font-semibold text-emerald-800 hover:underline">Actualizar diagnóstico</router-link>
      </p>

      <!-- conteúdos que no celular ficam escondidos no "Más" -->
      <nav class="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Contenidos">
        <router-link to="/guia" class="cartao p-4 flex items-center gap-3 hover:border-emerald-600/50 hover:shadow-md transition">
          <span class="selo-icone"><Icone :d="ICONE_LIVRO" class="w-5 h-5" /></span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-slate-800">Guía sostenible</span>
            <span class="hidden sm:block text-xs text-slate-500">Acciones e indicadores</span>
          </span>
        </router-link>
        <router-link to="/ods" class="cartao p-4 flex items-center gap-3 hover:border-emerald-600/50 hover:shadow-md transition">
          <span class="selo-icone"><Icone :d="ICONE_GLOBO" class="w-5 h-5" /></span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-slate-800">ODS</span>
            <span class="hidden sm:block text-xs text-slate-500">Agenda 2030</span>
          </span>
        </router-link>
      </nav>
    </template>
  </div>
</template>
