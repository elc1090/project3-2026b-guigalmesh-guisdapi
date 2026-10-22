<template>
  <div class="flex flex-col justify-between gap-6 sm:gap-8 min-h-full w-full max-w-6xl mx-auto py-2 sm:py-4">
    <!-- Cabeçalho -->
    <div>
      <h1 class="text-3xl font-bold text-slate-800">Diagnóstico de Sostenibilidad</h1>
      <p class="text-slate-500 mt-1">
        Selecciona cada dimensión para responder las preguntas. Tu avance se guarda automáticamente.
      </p>
    </div>

    <!-- Grid Responsivo das 4 Dimensões -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full">
      <CardCategory
        title="Gobernanza"
        description="Ética, transparencia, toma de decisiones y gestión de reclamos."
        route="/diagnostico/gobernanza"
      >
        <IconGobernanza class="w-14 h-14 sm:w-20 sm:h-20 stroke-emerald-800" />
      </CardCategory>

      <CardCategory
        title="Ambiental"
        description="Impacto ecológico, emisiones, recursos y diseño sostenible."
        route="/diagnostico/ambiental"
      >
        <IconAmbiental class="w-14 h-14 sm:w-20 sm:h-20 stroke-emerald-800" />
      </CardCategory>

      <CardCategory
        title="Social"
        description="Bienestar laboral, conciliación, prevención de acoso y participación."
        route="/diagnostico/social"
      >
        <IconSocial class="w-14 h-14 sm:w-20 sm:h-20 stroke-emerald-800" />
      </CardCategory>

      <CardCategory
        title="Económica"
        description="Metas de mediano plazo, gestión de riesgos, innovación y continuidad."
        route="/diagnostico/economica"
      >
        <IconEconomica class="w-14 h-14 sm:w-20 sm:h-20 stroke-emerald-800" />
      </CardCategory>
    </div>

    <!-- Barra de Progresso e Botão de Finalizar -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="w-full md:max-w-md">
        <div class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
          <span>Progreso del cuestionario</span>
          <span v-if="totalPerguntas > 0">{{ respondidas }} / {{ totalPerguntas }} ({{ porcentagemProgresso }}%)</span>
        </div>
        <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-emerald-700 transition-all duration-300"
            :style="{ width: `${porcentagemProgresso}%` }"
          ></div>
        </div>
        <p v-if="erro" class="text-sm text-red-600 mt-2">{{ erro }}</p>
      </div>

      <button
        @click="finalizar"
        :disabled="!completo || finalizando"
        class="w-full md:w-auto bg-emerald-800 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer whitespace-nowrap"
      >
        {{ finalizando ? 'Calculando...' : 'Finalizar diagnóstico' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../../lib/api'
import { usePerguntasStore } from '../../stores/perguntas'
import { useResultadoStore } from '../../stores/resultado'
import { useDiagnostico, carregarRascunho, limparDiagnostico } from '../../composables/useDiagnostico'
import CardCategory from '../../components/CardCategory.vue'
import IconGobernanza from '../../components/ui/IconGobernanza.vue'
import IconEconomica from '../../components/ui/IconEconomica.vue'
import IconAmbiental from '../../components/ui/IconAmbiental.vue'
import IconSocial from '../../components/ui/IconSocial.vue'

const router = useRouter()
const { respostas } = useDiagnostico()
const perguntasStore = usePerguntasStore()
const resultadoStore = useResultadoStore()

const totalPerguntas = computed(() => perguntasStore.total.dado ?? 0)
const finalizando = ref(false)
const erro = ref('')

const respondidas = computed(() => Object.keys(respostas.value).length)
const completo = computed(() => totalPerguntas.value > 0 && respondidas.value >= totalPerguntas.value)
const porcentagemProgresso = computed(() => {
  if (totalPerguntas.value === 0) return 0
  return Math.min(100, Math.round((respondidas.value / totalPerguntas.value) * 100))
})

onMounted(() => {
  // os dois em paralelo; o total vem do cache se já foi carregado antes
  carregarRascunho().catch((e) => console.error('Erro ao carregar rascunho:', e))
  perguntasStore.total.carregar().catch((e) => console.error('Erro ao contar perguntas:', e))
})

const finalizar = async () => {
  erro.value = ''
  finalizando.value = true

  try {
    const response = await apiFetch('/api/diagnostico/concluir', {
      method: 'POST',
      body: JSON.stringify({ respostas: respostas.value })
    })

    if (response.status === 401 || response.status === 403) {
      router.push('/login')
      return
    }

    if (response.status === 422) {
      erro.value = 'Responde todas las preguntas antes de finalizar.'
      return
    }

    if (!response.ok) {
      console.error('Erro do back-end:', await response.json().catch(() => null))
      erro.value = 'No fue posible finalizar el diagnóstico. Inténtalo de nuevo.'
      return
    }

    // a resposta já é o resultado: a tela de resultados abre sem nova requisição
    resultadoStore.definirResultado(await response.json().catch(() => null))
    limparDiagnostico()
    router.push('/resultado')
  } catch (e) {
    console.error('Erro de comunicação com o Back-end:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    finalizando.value = false
  }
}
</script>