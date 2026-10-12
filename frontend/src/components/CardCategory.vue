<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  }
})
</script>

<template>
  <router-link
    :to="rota"
    class="shadow-xl rounded-xl h-full flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer text-slate-800 hover:text-brand-900 group"
  >
    <!-- O slot permite injetar o SVG (ícone) diretamente de fora -->
    <div class="mb-4 text-slate-400 group-hover:text-brand-900 transition">
      <slot></slot>
    </div>

    <h2 class="text-xl font-bold">{{ titulo }}</h2>
  </router-link>
</template>
