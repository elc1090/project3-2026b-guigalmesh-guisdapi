<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CardPergunta from '../../components/CardPergunta.vue'
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue'
import Icone from '../../components/ui/Icone.vue'
import { DIMENSOES, dimensaoPorSlug } from '../../constants/dimensoes'
import { ICONE_SETA } from '../../constants/icones'
import { useDiagnostico } from '../../composables/useDiagnostico.js'

const route = useRoute()
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

// próxima dimensão na ordem de DIMENSOES; depois da última, volta ao menu para finalizar
const proxima = computed(() => {
  const i = DIMENSOES.findIndex((d) => d.slug === dimensao.value.slug)
  return DIMENSOES[i + 1] ?? null
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-2 sm:py-6">
    <router-link
      to="/diagnostico"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline mb-4"
    >
      <Icone :d="ICONE_SETA" class="w-4 h-4 rotate-180" />
      Volver al diagnóstico
    </router-link>

    <div class="mb-5 sm:mb-8">
      <h1 class="text-3xl font-bold text-slate-800">{{ dimensao.nome }}</h1>
      <p class="text-slate-500 mt-2">
        Responde a las siguientes preguntas de acuerdo con la realidad actual de la empresa.
      </p>
    </div>

    <LoadingSpinner v-if="carregando" texto="Cargando preguntas..." />

    <template v-else>
      <CardPergunta
        v-for="(pergunta, i) in perguntasView"
        :key="pergunta.id"
        :questao="pergunta"
        :numero="i + 1"
        :total="total"
        v-model="respostas[pergunta.id]"
      />

      <!-- rodapé fixo: progresso da dimensão, status do salvamento e próxima dimensão -->
      <div
        class="sticky -bottom-7 md:-bottom-8 z-10 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border border-white/70 md:border-slate-200 md:border-b-0 rounded-2xl md:rounded-b-none shadow-lg px-4 py-3 md:py-4 flex items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 mb-1.5">
            <span class="whitespace-nowrap">{{ respondidas }} de {{ total }} respondidas</span>
            <span aria-live="polite" class="text-emerald-700 font-medium truncate">{{ statusSalvamento }}</span>
          </div>
          <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-600 rounded-full transition-all duration-300" :style="{ width: `${porcentagem}%` }"></div>
          </div>
        </div>

        <router-link
          :to="proxima ? `/diagnostico/${proxima.slug}` : '/diagnostico'"
          class="shrink-0 inline-flex items-center gap-1.5 bg-emerald-800 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-950 transition shadow-md"
        >
          <template v-if="proxima">
            <span class="sm:hidden">Siguiente</span>
            <span class="hidden sm:inline">Siguiente: {{ proxima.nome }}</span>
          </template>
          <span v-else>Ir a finalizar</span>
          <Icone :d="ICONE_SETA" class="w-4 h-4" />
        </router-link>
      </div>
    </template>
  </div>
</template>
