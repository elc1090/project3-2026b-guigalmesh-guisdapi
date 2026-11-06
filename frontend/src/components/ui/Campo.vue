<script setup>
// Rótulo + campo (slot) + mensagem de erro ligada ao input por aria-describedby.
// Uso:
//   <Campo id="email" rotulo="Correo" :erro="erro">
//     <template #default="{ invalido, descricao }">
//       <input id="email" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
//     </template>
//   </Campo>
const props = defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, required: true },
  erro: { type: String, default: '' }
})
</script>

<template>
  <div>
    <label :for="id" class="rotulo">{{ rotulo }}</label>
    <slot :invalido="!!erro" :descricao="erro ? `${props.id}-erro` : undefined" />
    <p v-if="erro" :id="`${id}-erro`" class="mt-1.5 text-xs font-medium text-red-600">{{ erro }}</p>
    <slot name="extra" />
  </div>
</template>
