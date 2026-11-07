<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardPergunta from '../../components/CardPergunta.vue'
import Esqueleto from '../../components/ui/Esqueleto.vue'
import Pagina from '../../components/ui/Pagina.vue'
import Icone from '../../components/ui/Icone.vue'
import { DIMENSOES, dimensaoPorSlug } from '../../constants/dimensoes'
import { ICONE_SETA } from '../../constants/icones'
import {
  useDiagnostico, useProgressoDiagnostico, concluirDiagnostico, mensagemErroConclusao
} from '../../composables/useDiagnostico.js'

const route = useRoute()
const router = useRouter()
const { respostas, statusSalvamento, carregando, buscarPerguntas } = useDiagnostico()

// o router só aceita slugs válidos, então o fallback é só por segurança
const dimensao = computed(() => dimensaoPorSlug(route.params.dimensao) ?? DIMENSOES[0])
const perguntasView = ref([])

watch(
  () => dimensao.value.nome,
  async (novaCategoria) => {
    perguntasView.value = await buscarPerguntas(novaCategoria)
  },
  { immediate: true }
)

const total = computed(() => perguntasView.value.length)
const respondidas = computed(() => perguntasView.value.filter((p) => respostas.value[p.id] != null).length)
const porcentagem = computed(() => (total.value ? Math.round((respondidas.value / total.value) * 100) : 0))

// próxima dimensão na ordem de DIMENSOES
const proxima = computed(() => {
  const i = DIMENSOES.findIndex((d) => d.slug === dimensao.value.slug)
  return DIMENSOES[i + 1] ?? null
})

// Na última dimensão o rodapé decide a ação:
//  - tudo respondido: finaliza aqui mesmo (sem passar pelo menu);
//  - falta outra dimensão: leva direto para ela;
//  - falta só esta: nenhum botão, só o lembrete (as perguntas estão na tela).
const progressoGeral = useProgressoDiagnostico()
const pendenteEmOutra = computed(() =>
  progressoGeral.faltantes.value.find((d) => d.slug !== dimensao.value.slug) ?? null
)
const finalizando = ref(false)
const erroFinalizar = ref('')

const finalizar = async () => {
  erroFinalizar.value = ''
  finalizando.value = true
  try {
    await concluirDiagnostico()
    router.push('/resultado')
  } catch (e) {
    erroFinalizar.value = mensagemErroConclusao(e)
  } finally {
    finalizando.value = false
  }
}
</script>

<template>
  <Pagina
    largura="estreita"
    :icone="dimensao.icone"
    sobretitulo="Diagnóstico"
    :titulo="dimensao.nome"
    subtitulo="Responde a las siguientes preguntas de acuerdo con la realidad actual de la empresa."
  >
    <template #antes>
      <router-link
        to="/#diagnostico"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline"
      >
        <Icone :d="ICONE_SETA" class="w-4 h-4 rotate-180" />
        Volver al inicio
      </router-link>
    </template>

    <!-- esqueleto no lugar das perguntas enquanto não há cache -->
    <div v-if="carregando" class="space-y-4 sm:space-y-6" aria-busy="true">
      <div v-for="n in 3" :key="n" class="cartao p-4 sm:p-6 space-y-3">
        <Esqueleto class="h-3 w-28" />
        <Esqueleto class="h-6 w-4/5" />
        <Esqueleto v-for="m in 4" :key="m" class="h-12 w-full" />
      </div>
      <span class="sr-only" role="status">Cargando preguntas...</span>
    </div>

    <div v-else>
      <CardPergunta
        v-for="(pergunta, i) in perguntasView"
        :key="pergunta.id"
        :questao="pergunta"
        :numero="i + 1"
        :total="total"
        v-model="respostas[pergunta.id]"
      />

      <!-- rodapé fixo: progresso da dimensão, status do salvamento e próxima dimensão.
           O sticky conta a partir do fim do padding do <main>, não da borda da tela:
           Celular: o padding de baixo é 7rem (+ área segura); -bottom-5 deixa o rodapé a ~92px do fim da tela,
           logo acima da barra de navegação flutuante (BottomNav, topo a ~76px).
           Desktop: -bottom-8 compensa o p-8 e encosta na borda de baixo do <main>. -->
      <div
        class="sticky -bottom-5 md:-bottom-8 z-10 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border border-white/70 md:border-slate-200 md:border-b-0 rounded-2xl md:rounded-b-none shadow-lg px-4 py-3 md:py-4 flex items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 mb-1.5">
            <span class="whitespace-nowrap">{{ respondidas }} de {{ total }} respondidas</span>
            <span v-if="erroFinalizar" role="alert" class="font-medium text-red-600 truncate">{{ erroFinalizar }}</span>
            <span
              v-else
              aria-live="polite"
              class="font-medium truncate"
              :class="statusSalvamento.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'"
            >{{ statusSalvamento }}</span>
          </div>
          <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
            <div class="h-full bg-emerald-600 rounded-full transition-all duration-300" :style="{ width: `${porcentagem}%` }"></div>
          </div>
        </div>

        <router-link v-if="proxima" :to="`/diagnostico/${proxima.slug}`" class="btn-primario btn-compacto shrink-0">
          <span class="sm:hidden">Siguiente</span>
          <span class="hidden sm:inline">Siguiente: {{ proxima.nome }}</span>
          <Icone :d="ICONE_SETA" class="w-4 h-4" />
        </router-link>

        <!-- última dimensão -->
        <button
          v-else-if="progressoGeral.completo.value"
          type="button"
          @click="finalizar"
          :disabled="finalizando"
          :aria-busy="finalizando"
          class="btn-primario btn-compacto shrink-0"
        >
          <span v-if="finalizando" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true"></span>
          {{ finalizando ? 'Calculando...' : 'Finalizar diagnóstico' }}
        </button>
        <router-link
          v-else-if="pendenteEmOutra"
          :to="`/diagnostico/${pendenteEmOutra.slug}`"
          class="btn-secundario btn-compacto shrink-0"
        >
          Falta {{ pendenteEmOutra.nome }}
          <Icone :d="ICONE_SETA" class="w-4 h-4" />
        </router-link>
        <span v-else class="shrink-0 text-xs font-semibold text-slate-500 max-w-[9rem] text-right">
          Responde las preguntas pendientes para finalizar
        </span>
      </div>
    </div>
  </Pagina>
</template>
