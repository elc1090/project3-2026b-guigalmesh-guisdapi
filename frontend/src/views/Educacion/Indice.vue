<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Icone from '../../components/ui/Icone.vue'
import Pagina from '../../components/ui/Pagina.vue'
import { useResultadoStore } from '../../stores/resultado'
import { temas } from '../../constants/educacion'
import { ICONE_LIVRO, ICONE_SETA } from '../../constants/icones'

// Índice da Educación sostenible: um cartão por tema; cada tema abre em /educacion/<slug>.
const { t } = useI18n()
const resultadoStore = useResultadoStore()

// temas ligados a recomendações ainda não realizadas aparecem como "Recomendado para tu empresa"
const perguntasPendentes = computed(() => new Set(
  (resultadoStore.dado?.recomendacoes ?? [])
    .filter((r) => r.status !== 'realizada')
    .map((r) => r.pergunta_id)
))
const recomendado = (tema) => tema.perguntas.some((id) => perguntasPendentes.value.has(id))

onMounted(() => {
  resultadoStore.carregar().catch((e) => console.error('Erro ao carregar resultado:', e))
})
</script>

<template>
  <Pagina
    :icone="ICONE_LIVRO"
    :titulo="t('educacion.titulo')"
    :subtitulo="t('educacion.subtitulo')"
  >
    <div class="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
      <h2 class="text-xl sm:text-2xl font-bold mb-2">{{ t('educacion.aprende') }}</h2>
      <p class="text-emerald-50/90 max-w-3xl">
        {{ t('educacion.aprendeTexto') }}
      </p>
    </div>

    <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      <li v-for="(tema, i) in temas()" :key="tema.slug">
        <!-- celular: cartão em linha (ícone à esquerda), para a lista de 8 temas não ficar longa demais -->
        <router-link
          :to="`/educacion/${tema.slug}`"
          class="cartao h-full p-4 sm:p-5 flex items-start sm:flex-col gap-4 sm:gap-3 group hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-600/40 transition"
        >
          <span class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition">
            <Icone :d="tema.icone" class="w-6 h-6" />
          </span>
          <div class="min-w-0 flex-1 sm:w-full flex flex-col gap-1.5 sm:gap-3 sm:h-full">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('educacion.tema', { n: i + 1 }) }}</p>
              <h2 class="font-bold text-slate-800 leading-snug group-hover:text-emerald-900">{{ tema.titulo }}</h2>
            </div>
            <p class="text-sm text-slate-500">{{ tema.resumen }}</p>
            <span
              v-if="recomendado(tema)"
              class="self-start whitespace-nowrap text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"
            >
              {{ t('educacion.recomendado') }}
            </span>
            <span class="hidden sm:inline-flex mt-auto items-center gap-1 text-sm font-semibold text-emerald-800">
              {{ t('educacion.leerMas') }}
              <Icone :d="ICONE_SETA" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </router-link>
      </li>
    </ul>

    <p class="text-xs text-slate-500 text-center max-w-3xl mx-auto pb-2">
      {{ t('educacion.aviso') }}
    </p>
  </Pagina>
</template>
