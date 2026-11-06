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
  },
  // posição na dimensão, para mostrar "Pregunta 2 de 5"
  numero: { type: Number, default: null },
  total: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

// Computada para ligar o input interno com o v-model do pai
const valorSelecionado = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})
</script>

<template>
  <div
    class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border w-full mb-4 sm:mb-6 transition-colors"
    :class="modelValue != null ? 'border-emerald-200' : 'border-slate-200'"
  >

    <p v-if="numero" class="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1.5">
      Pregunta {{ numero }}<template v-if="total"> de {{ total }}</template>
    </p>

    <!-- Pergunta -->
    <h3 class="text-base sm:text-lg font-semibold text-slate-800 mb-4">
      {{ questao.pergunta }}
    </h3>

    <!-- Renderização condicional: Rádio -->
    <div v-if="questao.tipoResposta === 'radio'" class="flex flex-col space-y-2 sm:space-y-3">

      <!-- O <label> engloba todo o bloco, permitindo que o usuário clique em qualquer lugar da barra -->
      <label
        v-for="(opcao, index) in questao.opcoesResposta"
        :key="index"
        class="flex items-center p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600"
        :class="[
          valorSelecionado === opcao.valor
            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
        ]"
      >
        <input
          type="radio"
          :name="questao.id"
          :value="opcao.valor"
          v-model="valorSelecionado"
          class="w-5 h-5 accent-emerald-700 border-slate-300 focus-visible:outline-none"
        />
        <span class="ml-3 font-medium">{{ opcao.label }}</span>
      </label>

    </div>

    <!-- Se futuramente você tiver perguntas do tipo "texto" ou "checkbox", você só adiciona um v-else-if aqui -->
    <div v-else-if="questao.tipoResposta === 'text'">
      <textarea
        v-model="valorSelecionado"
        class="campo"
        rows="3"
        placeholder="Escribe tu respuesta..."
      ></textarea>
    </div>

  </div>
</template>
