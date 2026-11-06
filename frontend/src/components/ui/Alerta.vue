<script setup>
// Mensagem de erro ou sucesso. Uso: <Alerta v-if="erro">{{ erro }}</Alerta>
defineProps({
  tipo: { type: String, default: 'erro' } // 'erro' | 'sucesso'
})

const ESTILOS = {
  erro: 'text-red-700 bg-red-50 border-red-200',
  sucesso: 'text-emerald-800 bg-emerald-50 border-emerald-200'
}
</script>

<template>
  <p
    class="text-sm border rounded-xl px-4 py-3"
    :class="ESTILOS[tipo] ?? ESTILOS.erro"
    :role="tipo === 'erro' ? 'alert' : 'status'"
  >
    <slot />
  </p>
</template>
