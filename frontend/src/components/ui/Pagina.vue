<script setup>
import Icone from './Icone.vue'

// Moldura padrão das telas internas: largura máxima, espaçamento vertical e cabeçalho
// (ícone + sobretítulo + título + subtítulo). O <main> do DefaultLayout já cuida do padding lateral.
// Uso:
//   <Pagina :icone="ICONE_X" titulo="Mi empresa" subtitulo="...">
//     <template #lateral>(opcional, à direita do título no desktop)</template>
//     ...conteúdo...
//   </Pagina>
const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  sobretitulo: { type: String, default: '' },
  icone: { type: [Array, String], default: null },
  // estreita: formulários e questionário / normal: a maioria / larga: painéis com gráficos
  largura: { type: String, default: 'normal' }
})

const LARGURAS = { estreita: 'max-w-3xl', normal: 'max-w-6xl', larga: 'max-w-7xl' }
</script>

<template>
  <div class="mx-auto w-full py-1 sm:py-4 space-y-6 sm:space-y-8" :class="LARGURAS[props.largura] ?? LARGURAS.normal">
    <!-- ex.: link "Volver" acima do título -->
    <slot name="antes" />

    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <span
          v-if="icone"
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"
        >
          <Icone :d="icone" class="w-6 h-6 sm:w-7 sm:h-7" />
        </span>
        <div class="min-w-0">
          <p v-if="sobretitulo" class="text-xs font-bold uppercase tracking-wider text-emerald-700">{{ sobretitulo }}</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-emerald-950 text-balance">{{ titulo }}</h1>
          <p v-if="subtitulo || $slots.subtitulo" class="text-slate-500 mt-0.5">
            <slot name="subtitulo">{{ subtitulo }}</slot>
          </p>
        </div>
      </div>

      <div v-if="$slots.lateral" class="shrink-0">
        <slot name="lateral" />
      </div>
    </header>

    <slot />
  </div>
</template>
