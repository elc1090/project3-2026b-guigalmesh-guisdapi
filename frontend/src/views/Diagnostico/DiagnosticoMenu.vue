<template>
  <div class="flex flex-col gap-8 h-full w-full">
    <div class="grid grid-cols-4 gap-8 flex-1 w-full">
      <CardCategory title="Gobernanza" route="/diagnostico/gobernanza">
        <IconGobernanza class="w-36 h-36 stroke-emerald-800" />
      </CardCategory>

      <CardCategory title="Ambiental" route="/diagnostico/ambiental">
        <IconAmbiental class="w-36 h-36 stroke-emerald-800" />
      </CardCategory>

      <CardCategory title="Social" route="/diagnostico/social">
        <IconSocial class="w-36 h-36 stroke-emerald-800" />
      </CardCategory>

      <CardCategory title="Económica" route="/diagnostico/economica">
        <IconEconomica class="w-36 h-36 stroke-emerald-800" />
      </CardCategory>
    </div>

    <div class="flex items-center justify-between gap-6 pb-2">
      <div>
        <p v-if="totalPerguntas > 0" class="text-slate-600">
          Has respondido {{ respondidas }} de {{ totalPerguntas }} preguntas.
        </p>
        <p v-if="erro" class="text-sm text-red-600 mt-1">{{ erro }}</p>
      </div>

      <button
        @click="finalizar"
        :disabled="!completo || finalizando"
        class="bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer"
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
import { supabase } from '../../lib/supabase'
import { useDiagnostico, carregarRascunho, limparDiagnostico } from '../../composables/useDiagnostico'
import CardCategory from '../../components/CardCategory.vue'
import IconGobernanza from '../../components/ui/IconGobernanza.vue'
import IconEconomica from '../../components/ui/IconEconomica.vue'
import IconAmbiental from '../../components/ui/IconAmbiental.vue'
import IconSocial from '../../components/ui/IconSocial.vue'

const router = useRouter()
const { respostas } = useDiagnostico()

const totalPerguntas = ref(0)
const finalizando = ref(false)
const erro = ref('')

const respondidas = computed(() => Object.keys(respostas.value).length)
const completo = computed(() => totalPerguntas.value > 0 && respondidas.value >= totalPerguntas.value)

onMounted(async () => {
  try {
    await carregarRascunho()
  } catch (e) {
    console.error('Erro ao carregar rascunho:', e)
  }

  const { count, error } = await supabase
    .from('perguntas')
    .select('id', { count: 'exact', head: true })
    .eq('ativo', true)

  if (!error) totalPerguntas.value = count ?? 0
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