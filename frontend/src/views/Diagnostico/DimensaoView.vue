<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CardPergunta from '../../components/CardPergunta.vue'
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue'
import { DIMENSOES, dimensaoPorSlug } from '../../constants/dimensoes'
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
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 relative">
    <div class="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">{{ dimensao.nome }}</h1>
        <p class="text-slate-500 mt-2">
          Responde a las siguientes preguntas de acuerdo con la realidad actual de la empresa.
        </p>
      </div>

      <span
        v-if="statusSalvamento"
        class="text-sm font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap"
      >
        {{ statusSalvamento }}
      </span>
    </div>

    <LoadingSpinner v-if="carregando" texto="Cargando preguntas..." />

    <template v-else>
      <CardPergunta
        v-for="pergunta in perguntasView"
        :key="pergunta.id"
        :questao="pergunta"
        v-model="respostas[pergunta.id]"
      />

      <div class="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <span class="text-sm text-slate-500">{{ statusSalvamento }}</span>
        <router-link
          to="/diagnostico"
          class="w-full sm:w-auto text-center bg-emerald-800 text-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 transition shadow-lg cursor-pointer"
        >
          Volver al diagnóstico
        </router-link>
      </div>
    </template>
  </div>
</template>