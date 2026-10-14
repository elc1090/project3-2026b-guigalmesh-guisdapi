<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Evaluar indicadores de esta dimensión'
  },
  route: {
    type: String,
    required: true
  }
})
</script>

<template>
  <router-link
    :to="route"
    class="bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-emerald-600/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group"
  >
    <div class="mb-5 p-4 rounded-2xl bg-emerald-50/70 group-hover:bg-emerald-100/80 transition">
      <slot></slot>
    </div>
    <h2 class="text-xl font-bold text-slate-800 group-hover:text-emerald-900 transition">{{ title }}</h2>
    <p class="text-xs text-slate-500 mt-1.5 max-w-[180px]">{{ description }}</p>
    <span class="mt-4 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
      Responder →
    </span>
  </router-link>
</template>