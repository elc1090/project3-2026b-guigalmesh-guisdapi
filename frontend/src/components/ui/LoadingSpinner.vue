<script setup>
defineProps({
  texto: { type: String, default: 'Cargando...' }
})
</script>

<template>
  <div class="flex justify-center items-center py-12" role="status">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
    <span class="ml-3 text-slate-500 font-medium">{{ texto }}</span>
  </div>
</template>
