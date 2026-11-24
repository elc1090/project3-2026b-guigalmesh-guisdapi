<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResultadoStore } from '../stores/resultado'
import Icone from './ui/Icone.vue'
import { ICONE_CHECK } from '../constants/icones'

// Botões do plano de ação de uma recomendação: pendiente -> en_progreso -> realizada.
// Usado no Resultado e no cartão "Tu próxima acción" do Início.
const props = defineProps({
  recomendacao: { type: Object, required: true }
})

const { t } = useI18n()
const resultadoStore = useResultadoStore()
const salvando = ref(false)
const erro = ref('')

const status = computed(() => props.recomendacao.status ?? 'pendiente')

async function mudar(novo) {
  if (salvando.value) return
  salvando.value = true
  erro.value = ''
  try {
    await resultadoStore.atualizarStatusAcao(props.recomendacao.id, novo)
  } catch (e) {
    if (e?.status === 401) return // o apiFetch já leva ao login
    erro.value = 'acoes.erro'
  } finally {
    salvando.value = false
  }
}

const base = 'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer disabled:opacity-60 disabled:cursor-wait'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2" :aria-busy="salvando">
    <template v-if="status === 'realizada'">
      <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
        <Icone :d="ICONE_CHECK" class="w-3.5 h-3.5" />
        {{ t('acoes.realizada') }}
      </span>
      <button
        type="button"
        class="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer disabled:opacity-60"
        :disabled="salvando"
        @click="mudar('pendiente')"
      >
        {{ t('acoes.deshacer') }}
      </button>
    </template>

    <template v-else>
      <span
        v-if="status === 'en_progreso'"
        class="text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-100 text-sky-800"
      >
        {{ t('acoes.enProgreso') }}
      </span>
      <button
        v-else
        type="button"
        :class="[base, 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50']"
        :disabled="salvando"
        @click="mudar('en_progreso')"
      >
        {{ t('acoes.empezar') }}
      </button>
      <button
        type="button"
        :class="[base, 'bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-900']"
        :disabled="salvando"
        @click="mudar('realizada')"
      >
        <Icone :d="ICONE_CHECK" class="w-3.5 h-3.5" />
        {{ t('acoes.marcar') }}
      </button>
    </template>

    <p v-if="erro" class="w-full text-xs text-red-700" role="alert">{{ t(erro) }}</p>
  </div>
</template>
