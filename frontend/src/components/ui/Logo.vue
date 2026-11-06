<script setup>
import Icone from './Icone.vue'
import { ICONE_BROTO } from '../../constants/icones'
import { NOME_APP, SLOGAN } from '../../constants/marca'

// compacto: só o nome, sem o slogan (cabeçalho do celular)
defineProps({
  compacto: { type: Boolean, default: false }
})
</script>

<template>
  <div class="flex items-center" :class="compacto ? 'gap-2.5' : 'gap-3'">
    <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner">
      <Icone :d="ICONE_BROTO" class="w-5 h-5" />
    </div>
    <span v-if="compacto" class="font-extrabold tracking-wider text-white text-base">{{ NOME_APP }}</span>
    <div v-else>
      <span class="font-extrabold tracking-wider text-white text-lg block leading-none">{{ NOME_APP }}</span>
      <span class="text-[11px] text-emerald-200/80 tracking-wide">{{ SLOGAN }}</span>
    </div>
  </div>
</template>
