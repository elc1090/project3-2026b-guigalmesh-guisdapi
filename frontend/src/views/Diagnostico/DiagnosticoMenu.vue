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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePerguntasStore } from '../../stores/perguntas'
import { useDiagnostico, carregarRascunho, concluirDiagnostico } from '../../composables/useDiagnostico'
import CardCategory from '../../components/CardCategory.vue'
import Icone from '../../components/ui/Icone.vue'
import Pagina from '../../components/ui/Pagina.vue'
import { DIMENSOES } from '../../constants/dimensoes'
import { ICONE_CHECKLIST } from '../../constants/icones'

const router = useRouter()
const { respostas } = useDiagnostico()
const perguntasStore = usePerguntasStore()

const totalPerguntas = computed(() => perguntasStore.total)
const finalizando = ref(false)
const erro = ref('')

// { respondidas, total } de uma dimensão, para o card mostrar "3/5" e a barrinha
const progressoDe = (categoria) => {
  const perguntas = perguntasStore.daCategoria(categoria)
  return {
    total: perguntas.length,
    respondidas: perguntas.filter((p) => respostas.value[p.id] != null).length
  }
}

const progressoPorDimensao = computed(() =>
  DIMENSOES.map((d) => ({ nome: d.nome, slug: d.slug, ...progressoDe(d.nome) }))
)
// conta só as perguntas ativas (respostas antigas de perguntas desativadas não entram)
const respondidas = computed(() => progressoPorDimensao.value.reduce((soma, d) => soma + d.respondidas, 0))
const faltantes = computed(() =>
  progressoPorDimensao.value
    .map((d) => ({ ...d, faltam: d.total - d.respondidas }))
    .filter((d) => d.faltam > 0)
)
const completo = computed(() => totalPerguntas.value > 0 && respondidas.value >= totalPerguntas.value)
const porcentagemProgresso = computed(() => {
  if (totalPerguntas.value === 0) return 0
  return Math.min(100, Math.round((respondidas.value / totalPerguntas.value) * 100))
})

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
    // 401/403 já levam ao login pelo apiFetch
    if (e?.status === 422) erro.value = 'Responde todas las preguntas antes de finalizar.'
    else if (e?.status) erro.value = 'No fue posible finalizar el diagnóstico. Inténtalo de nuevo.'
    else {
      console.error('Erro de comunicação com o Back-end:', e)
      erro.value = 'No se pudo conectar con el servidor.'
    }
  } finally {
    finalizando.value = false
  }
}
</script>
