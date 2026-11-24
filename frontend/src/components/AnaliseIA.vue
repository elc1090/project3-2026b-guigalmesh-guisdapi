<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '../lib/api'
import { formatarData } from '../lib/datas'
import Icone from './ui/Icone.vue'

// "Análisis con IA" (Gemini como serviço) na tela de Resultados. A análise é gerada pelo
// back-end (POST /api/ia/analisis) e fica salva: ao voltar, aparece sem nova chamada à IA.
const props = defineProps({
  // muda quando a empresa conclui um diagnóstico novo: aí a análise é outra
  concluidoEm: { type: String, default: '' }
})

const ICONE_BRILHO = [
  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  'M20 3v4', 'M22 5h-4'
]

const { t } = useI18n()
const estado = ref('carregando') // carregando | indisponivel | vazio | pronto
const dados = ref(null)
const gerando = ref(false)
const erro = ref('')

async function carregar() {
  estado.value = 'carregando'
  erro.value = ''
  try {
    const res = await apiFetch('/api/ia/analisis')
    if (!res.ok) {
      estado.value = 'indisponivel'
      return
    }
    dados.value = await res.json()
    estado.value = dados.value.analisis ? 'pronto' : 'vazio'
  } catch {
    estado.value = 'indisponivel'
  }
}

async function gerar() {
  if (gerando.value) return
  gerando.value = true
  erro.value = ''
  try {
    const res = await apiFetch('/api/ia/analisis', { method: 'POST' })
    const corpo = await res.json().catch(() => null)
    if (!res.ok) {
      erro.value = corpo?.detail && typeof corpo.detail === 'string'
        ? corpo.detail
        : t('ia.erroGerar')
      return
    }
    dados.value = corpo
    estado.value = 'pronto'
  } catch {
    erro.value = t('ia.erroConexion')
  } finally {
    gerando.value = false
  }
}

watch(() => props.concluidoEm, carregar, { immediate: true })
</script>

<template>
  <section v-if="estado !== 'indisponivel'" class="cartao p-5 sm:p-6 border-violet-200/70" aria-labelledby="titulo-analisis-ia">
    <div class="flex items-center gap-3 mb-4">
      <span class="w-10 h-10 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
        <Icone :d="ICONE_BRILHO" class="w-5 h-5" />
      </span>
      <div class="min-w-0">
        <h2 id="titulo-analisis-ia" class="text-lg font-semibold text-slate-800">{{ t('ia.titulo') }}</h2>
        <p class="text-sm text-slate-500">{{ t('ia.subtitulo') }}</p>
      </div>
    </div>

    <div v-if="estado === 'carregando'" class="h-16 rounded-xl bg-slate-100 animate-pulse" aria-busy="true"></div>

    <!-- gerando (primeira vez ou regenerando) -->
    <p v-else-if="gerando" class="flex items-center gap-3 text-sm text-slate-600 bg-violet-50/60 border border-violet-100 rounded-xl p-4" role="status">
      <span class="w-5 h-5 rounded-full border-2 border-violet-200 border-t-violet-700 animate-spin shrink-0" aria-hidden="true"></span>
      {{ t('ia.analizando') }}
    </p>

    <!-- ainda sem análise -->
    <div v-else-if="estado === 'vazio'" class="space-y-3">
      <p class="text-sm text-slate-600">
        {{ t('ia.intro') }}
      </p>
      <button type="button" class="btn-primario btn-compacto bg-violet-700! hover:bg-violet-800!" @click="gerar">
        <Icone :d="ICONE_BRILHO" class="w-4 h-4" />
        {{ t('ia.generar') }}
      </button>
    </div>

    <!-- análise pronta -->
    <div v-else-if="estado === 'pronto' && dados?.analisis" class="space-y-4">
      <p class="text-slate-700">{{ dados.analisis.resumen }}</p>

      <ol class="space-y-3">
        <li v-for="(p, i) in dados.analisis.prioridades" :key="i" class="flex gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <span class="w-7 h-7 rounded-full bg-violet-700 text-white text-sm font-bold flex items-center justify-center shrink-0">{{ i + 1 }}</span>
          <div class="min-w-0 space-y-1">
            <h3 class="font-semibold text-slate-800">{{ p.titulo }}</h3>
            <p class="text-sm text-slate-600">{{ p.motivo }}</p>
            <p class="text-sm text-slate-600"><strong class="text-slate-800">{{ t('ia.primerPaso') }}</strong> {{ p.primer_paso }}</p>
          </div>
        </li>
      </ol>

      <p v-if="dados.analisis.fortalezas" class="text-sm text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <strong>{{ t('ia.haceBien') }}</strong> {{ dados.analisis.fortalezas }}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p class="text-xs text-slate-500">
          {{ dados.generado_em ? t('ia.generadoEl', { data: formatarData(dados.generado_em) }) : t('ia.generado') }}.
          {{ t('ia.orientativo') }}
        </p>
        <button
          v-if="dados.restantes > 0"
          type="button"
          class="text-sm font-semibold text-violet-700 hover:underline cursor-pointer"
          @click="gerar"
        >
          {{ t('ia.otraVersion', { n: dados.restantes }) }}
        </button>
      </div>
    </div>

    <p v-if="erro" class="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">{{ erro }}</p>
  </section>
</template>
