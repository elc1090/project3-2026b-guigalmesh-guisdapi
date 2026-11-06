<script setup>
// Ícone em traçado (viewBox 24x24). "d" é um caminho SVG ou uma lista deles.
// Tamanho e cor vêm do class de quem usa, ex.: <Icone :d="ICONE_SETA" class="w-5 h-5 text-slate-500" />
defineProps({
  d: { type: [Array, String], required: true },
  strokeWidth: { type: [Number, String], default: 2 }
})
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(caminho, i) in [].concat(d)" :key="i" :d="caminho" />
  </svg>
</template>
