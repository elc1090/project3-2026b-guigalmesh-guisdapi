<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: { type: String, required: true },
  descricao: { type: String, default: 'Evaluar indicadores de esta dimensión' },
  rota: { type: String, required: true },
  // progresso da dimensão (0 de 0 = perguntas ainda carregando: não mostra nada)
  respondidas: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
})

const completa = computed(() => props.total > 0 && props.respondidas >= props.total)
const porcentagem = computed(() => (props.total ? Math.round((props.respondidas / props.total) * 100) : 0))
const chamada = computed(() => (completa.value ? 'Revisar' : props.respondidas ? 'Continuar' : 'Responder'))
</script>

<template>
  <router-link
    :to="rota"
    class="cartao hover:shadow-xl sm:hover:-translate-y-1 hover:border-emerald-600/50 p-4 sm:p-6 flex flex-row sm:flex-col items-center gap-4 sm:gap-0 text-left sm:text-center transition-all duration-200 cursor-pointer group motion-reduce:hover:translate-y-0"
  >
    <div class="sm:mb-5 p-3 sm:p-4 rounded-2xl bg-emerald-50/70 group-hover:bg-emerald-100/80 transition shrink-0">
      <slot></slot>
    </div>

    <div class="flex-1 min-w-0 flex flex-col items-start sm:items-center w-full">
      <span
        v-if="total"
        class="mb-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
        :class="completa
          ? 'bg-emerald-100 text-emerald-800'
          : respondidas ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
      >
        {{ completa ? '✓ Completa' : `${respondidas}/${total}` }}
      </span>

      <h2 class="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-emerald-900 transition">{{ titulo }}</h2>
      <p class="text-xs text-slate-500 mt-1 sm:mt-1.5 sm:max-w-[180px]">{{ descricao }}</p>

      <div v-if="total" class="w-full sm:max-w-[180px] h-1.5 bg-slate-100 rounded-full mt-3 sm:mt-4 overflow-hidden" aria-hidden="true">
        <div class="h-full bg-emerald-600 rounded-full transition-all duration-500" :style="{ width: `${porcentagem}%` }"></div>
      </div>

      <span class="mt-2 sm:mt-4 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
        {{ chamada }} →
      </span>
    </div>
  </router-link>
</template>
