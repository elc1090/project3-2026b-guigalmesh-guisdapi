<script setup>
// Bloco cinza pulsando no lugar do conteúdo que ainda está carregando (evita o "pulo" de layout
// que o spinner causa). Tamanho e forma vêm do class: <Esqueleto class="h-6 w-40 rounded-lg" />
</script>

<template>
  <div class="bg-slate-200/80 rounded-xl animate-pulse motion-reduce:animate-none" aria-hidden="true"></div>
</template>
