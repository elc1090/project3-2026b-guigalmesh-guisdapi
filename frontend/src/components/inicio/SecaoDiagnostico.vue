<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { concluirDiagnostico, mensagemErroConclusao, useProgressoDiagnostico } from '../../composables/useDiagnostico'
import CardCategory from '../CardCategory.vue'
import Icone from '../ui/Icone.vue'
import { DIMENSOES } from '../../constants/dimensoes'

// Seção "Diagnóstico" do Início (antiga tela do menu do diagnóstico):
// as 4 dimensões com o progresso de cada uma e o botão de finalizar.
// O rascunho e as perguntas são carregados pelo Início.
const props = defineProps({
  // já existe um resultado: finalizar de novo só atualiza (botão secundário,
  // porque a ação principal da tela passa a ser "Ver resultados")
  concluido: { type: Boolean, default: false }
})

const router = useRouter()
const { porDimensao, total, respondidas, completo, porcentagem, faltantes } = useProgressoDiagnostico()
const progressoDe = (nome) => {
  const d = porDimensao.value.find((x) => x.nome === nome)
  return { total: d?.total ?? 0, respondidas: d?.respondidas ?? 0 }
}

const finalizando = ref(false)
const erro = ref('')

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

// pré-carrega a tela das dimensões: ao tocar num card ela abre sem esperar o download
import('../../views/Diagnostico/DimensaoView.vue')
</script>

<template>
  <section id="diagnostico" class="scroll-mt-6 space-y-4" aria-labelledby="titulo-diagnostico">
    <div>
      <h2 id="titulo-diagnostico" class="text-lg sm:text-xl font-bold text-slate-800">
        {{ props.concluido ? 'Tu diagnóstico' : 'Diagnóstico de sostenibilidad' }}
      </h2>
      <p class="text-sm text-slate-500 mt-0.5">
        {{ props.concluido
          ? 'Puedes revisar tus respuestas y actualizar los resultados cuando haya cambios en tu empresa.'
          : 'Responde las 4 dimensiones en el orden que prefieras. Tu avance se guarda automáticamente.' }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <CardCategory
        v-for="dim in DIMENSOES"
        :key="dim.slug"
        :titulo="dim.nome"
        :descricao="dim.resumo"
        :rota="`/diagnostico/${dim.slug}`"
        v-bind="progressoDe(dim.nome)"
      >
        <Icone :d="dim.icone" :stroke-width="1.25" class="w-9 h-9 sm:w-14 sm:h-14 text-emerald-800" />
      </CardCategory>
    </div>

    <!-- progresso geral + finalizar -->
    <div class="cartao p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="w-full md:max-w-md">
        <div class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
          <span>Progreso</span>
          <span v-if="total > 0">{{ respondidas }} / {{ total }} ({{ porcentagem }}%)</span>
        </div>
        <div
          class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Progreso del diagnóstico"
          :aria-valuenow="porcentagem"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="h-full bg-emerald-700 rounded-full transition-all duration-300" :style="{ width: `${porcentagem}%` }"></div>
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
        :aria-busy="finalizando"
        class="w-full md:w-auto whitespace-nowrap"
        :class="props.concluido ? 'btn-secundario' : 'btn-primario'"
      >
        <span v-if="finalizando" class="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true"></span>
        {{ finalizando ? 'Calculando...' : (props.concluido ? 'Actualizar resultados' : 'Finalizar diagnóstico') }}
      </button>
    </div>
  </section>
</template>
