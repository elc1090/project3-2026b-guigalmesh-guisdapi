<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CardPergunta from '../../components/CardPergunta.vue'
import { useDiagnostico } from '../../composables/useDiagnostico.js'

const route = useRoute()
const { respostas, statusSalvamento, carregando, buscarPerguntas } = useDiagnostico()

const MAPA_CATEGORIAS = {
  ambiental: { categoria: 'Ambiental', titulo: 'Ambiental' },
  social: { categoria: 'Social', titulo: 'Social' },
  economica: { categoria: 'Económica', titulo: 'Económica' },
  gobernanza: { categoria: 'Gobernanza', titulo: 'Gobernanza' }
}

const configAtual = computed(() => MAPA_CATEGORIAS[route.params.dimensao] || MAPA_CATEGORIAS.ambiental)
const perguntasView = ref([])

watch(
  () => configAtual.value.categoria,
  async (novaCategoria) => {
    perguntasView.value = await buscarPerguntas(novaCategoria)
  },
  { immediate: true }
)
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 relative">
    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">{{ configAtual.titulo }}</h1>
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

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando preguntas...</span>
    </div>

    <template v-else>
      <CardPergunta
        v-for="pergunta in perguntasView"
        :key="pergunta.id"
        :questao="pergunta"
        v-model="respostas[pergunta.id]"
      />

      <div class="mt-8 flex items-center justify-between">
        <span class="text-sm text-slate-500">{{ statusSalvamento }}</span>
        <router-link
          to="/diagnostico"
          class="bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 transition shadow-lg cursor-pointer"
        >
          Volver al diagnóstico
        </router-link>
      </div>
    </template>
  </div>
</template>