<template>
  <Pagina
    :icone="ICONE_CHECKLIST"
    titulo="Diagnóstico de Sostenibilidad"
    subtitulo="Selecciona cada dimensión para responder las preguntas. Tu avance se guarda automáticamente."
  >
    <!-- Grid responsivo das 4 dimensões -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
      <CardCategory
        v-for="dim in DIMENSOES"
        :key="dim.slug"
        :titulo="dim.nome"
        :descricao="dim.resumo"
        :rota="`/diagnostico/${dim.slug}`"
        v-bind="progressoDe(dim.nome)"
      >
        <Icone :d="dim.icone" :stroke-width="1.25" class="w-9 h-9 sm:w-20 sm:h-20 text-emerald-800" />
      </CardCategory>
    </div>

    <!-- Barra de progresso e botão de finalizar -->
    <div class="cartao p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="w-full md:max-w-md">
        <div class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
          <span>Progreso del cuestionario</span>
          <span v-if="totalPerguntas > 0">{{ respondidas }} / {{ totalPerguntas }} ({{ porcentagemProgresso }}%)</span>
        </div>
        <div
          class="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Progreso del cuestionario"
          :aria-valuenow="porcentagemProgresso"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="h-full bg-emerald-700 transition-all duration-300" :style="{ width: `${porcentagemProgresso}%` }"></div>
        </div>

        <!-- diz o que falta, em vez de só deixar o botão desabilitado -->
        <p v-if="!completo && respondidas > 0 && faltantes.length" class="text-sm text-slate-500 mt-2">
          Faltan respuestas en:
          <template v-for="(f, i) in faltantes" :key="f.slug">
            <router-link :to="`/diagnostico/${f.slug}`" class="font-semibold text-emerald-800 hover:underline">
              {{ f.nome }} ({{ f.faltam }})</router-link><template v-if="i < faltantes.length - 1">, </template>
          </template>
        </p>
        <p v-if="erro" class="text-sm text-red-600 mt-2" role="alert">{{ erro }}</p>
      </div>

      <button
        type="button"
        @click="finalizar"
        :disabled="!completo || finalizando"
        class="btn-primario w-full md:w-auto whitespace-nowrap"
      >
        {{ finalizando ? 'Calculando...' : 'Finalizar diagnóstico' }}
      </button>
    </div>
  </Pagina>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePerguntasStore } from '../../stores/perguntas'
import { carregarRascunho, concluirDiagnostico, mensagemErroConclusao, useProgressoDiagnostico } from '../../composables/useDiagnostico'
import CardCategory from '../../components/CardCategory.vue'
import Icone from '../../components/ui/Icone.vue'
import Pagina from '../../components/ui/Pagina.vue'
import { DIMENSOES } from '../../constants/dimensoes'
import { ICONE_CHECKLIST } from '../../constants/icones'

const router = useRouter()
const perguntasStore = usePerguntasStore()

const finalizando = ref(false)
const erro = ref('')

// progresso geral e por dimensão (cards mostram "3/5" e a barrinha)
const {
  porDimensao, total: totalPerguntas, respondidas, completo, porcentagem: porcentagemProgresso, faltantes
} = useProgressoDiagnostico()
const progressoDe = (nome) => {
  const d = porDimensao.value.find((x) => x.nome === nome)
  return { total: d?.total ?? 0, respondidas: d?.respondidas ?? 0 }
}

onMounted(() => {
  // os dois em paralelo; o total vem do cache se já foi carregado antes
  carregarRascunho().catch((e) => console.error('Erro ao carregar rascunho:', e))
  perguntasStore.carregar().catch((e) => console.error('Erro ao contar perguntas:', e))
  // pré-carrega a tela das dimensões: ao tocar num card ela abre sem esperar o download
  import('./DimensaoView.vue')
})

const finalizar = async () => {
  erro.value = ''
  finalizando.value = true
  try {
    await concluirDiagnostico()
    router.push('/resultado')
  } catch (e) {
    erro.value = mensagemErroConclusao(e)
  } finally {
    finalizando.value = false
  }
}
</script>
