<script setup>
import { computed } from 'vue'

// Definimos as propriedades que o card vai receber
const props = defineProps({
  questao: {
    type: Object,
    required: true
  },
  // modelValue é a prop padrão do v-model no Vue 3
  modelValue: {
    type: [String, Number, Boolean, null],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// Computada para ligar o input interno com o v-model do pai
const valorSelecionado = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})
</script>

<template>
  <div class="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 w-full mb-6">

    <!-- Pergunta -->
    <h3 class="text-lg font-semibold text-slate-800 mb-4">
      {{ questao.pergunta }}
    </h3>

    <!-- Renderização condicional: Rádio -->
    <div v-if="questao.tipoResposta === 'radio'" class="flex flex-col space-y-3">

      <!-- O <label> engloba todo o bloco, permitindo que o usuário clique em qualquer lugar da barra -->
      <label
        v-for="(opcao, index) in questao.opcoesResposta"
        :key="index"
        class="flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200"
        :class="[
          valorSelecionado === opcao.valor
            ? 'border-emerald-600 bg-emerald-50 text-deeppurple shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
        ]"
      >
        <input
          type="radio"
          :name="questao.id"
          :value="opcao.valor"
          v-model="valorSelecionado"
          class="w-5 h-5 accent-emerald-700 text-deeppurple focus:ring-deeppurple border-slate-300"
        />
        <span class="ml-3 font-medium">{{ opcao.label }}</span>
      </label>

    </div>

    <!-- Se futuramente você tiver perguntas do tipo "texto" ou "checkbox", você só adiciona um v-else-if aqui -->
    <div v-else-if="questao.tipoResposta === 'text'">
      <textarea
        v-model="valorSelecionado"
        class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deeppurple focus:border-deeppurple outline-none"
        rows="3"
        placeholder="Escreva sua resposta..."
      ></textarea>
    </div>

  </div>
</template>
