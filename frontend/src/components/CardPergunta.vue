<script setup>
import { computed } from 'vue'

const props = defineProps({
  questao: { type: Object, required: true },
  // modelValue é a prop padrão do v-model no Vue 3
  modelValue: { type: [String, Number, Boolean, null], default: null },
  // posição na dimensão, para mostrar "Pregunta 2 de 5"
  numero: { type: Number, default: null },
  total: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

// liga o input interno com o v-model do pai
const valorSelecionado = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})

const idTitulo = computed(() => `pergunta-${props.questao.id}`)
</script>

<template>
  <!-- fieldset + legend: o leitor de tela anuncia a pergunta junto com cada opção -->
  <fieldset
    class="cartao p-4 sm:p-6 w-full min-w-0 mb-4 sm:mb-6 transition-colors"
    :class="modelValue != null ? '!border-emerald-200' : ''"
  >
    <!-- float: tira a legend da borda do fieldset (posição padrão do navegador) -->
    <legend class="float-left w-full">
      <span v-if="numero" class="block text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1.5">
        Pregunta {{ numero }}<template v-if="total"> de {{ total }}</template>
      </span>
      <span :id="idTitulo" class="block text-base sm:text-lg font-semibold text-slate-800 mb-4">
        {{ questao.pergunta }}
      </span>
    </legend>

    <div v-if="questao.tipoResposta === 'radio'" class="clear-both flex flex-col space-y-2 sm:space-y-3">
      <!-- o <label> engloba o bloco todo: dá para tocar em qualquer lugar da barra -->
      <label
        v-for="(opcao, index) in questao.opcoesResposta"
        :key="index"
        class="flex items-center p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600"
        :class="valorSelecionado === opcao.valor
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'"
      >
        <input
          type="radio"
          :name="questao.id"
          :value="opcao.valor"
          v-model="valorSelecionado"
          class="w-5 h-5 shrink-0 accent-emerald-700 border-slate-300 focus-visible:outline-none"
        />
        <span class="ml-3 font-medium">{{ opcao.label }}</span>
      </label>
    </div>

    <!-- outros tipos de resposta entram aqui com v-else-if -->
    <div v-else-if="questao.tipoResposta === 'text'" class="clear-both">
      <textarea
        v-model="valorSelecionado"
        class="campo"
        rows="3"
        placeholder="Escribe tu respuesta..."
        :aria-labelledby="idTitulo"
      ></textarea>
    </div>
  </fieldset>
</template>
