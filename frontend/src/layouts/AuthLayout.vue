<script setup>
import BackgroundWaves from '../components/ui/BackgroundWaves.vue'
import { NOME_APP } from '../constants/marca'

// Moldura das telas de login e cadastro. O formulário vai no slot padrão
// e o link para a outra tela no slot "rodape".
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' }
})
</script>

<template>
  <div class="relative min-h-dvh bg-emerald-800 flex items-center justify-center p-4 overflow-hidden">
    <BackgroundWaves class="absolute inset-0 pointer-events-none select-none opacity-80" />

    <div class="relative z-10 max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
      <div class="text-center mb-8">
        <span class="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-3">
          {{ NOME_APP }}
        </span>
        <h2 class="font-display text-2xl font-bold text-slate-800">{{ titulo }}</h2>
        <p v-if="subtitulo" class="text-sm text-slate-500 mt-1">{{ subtitulo }}</p>
      </div>

      <slot />

      <p v-if="$slots.rodape" class="text-sm text-slate-600 text-center mt-6">
        <slot name="rodape" />
      </p>
    </div>
  </div>
</template>
