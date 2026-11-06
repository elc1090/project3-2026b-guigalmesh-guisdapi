<script setup>
defineProps({
  carregando: { type: Boolean, default: false },
  textoCarregando: { type: String, default: 'Cargando...' },
  type: { type: String, default: 'submit' }
})
</script>

<template>
  <button
    :type="type"
    :disabled="carregando"
    :aria-busy="carregando"
    class="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-75 disabled:cursor-wait text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-900/20 cursor-pointer"
  >
    <span v-if="carregando" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true"></span>
    <template v-if="carregando">{{ textoCarregando }}</template>
    <slot v-else />
  </button>
</template>
