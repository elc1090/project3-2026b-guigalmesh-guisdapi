<script setup>
import { ref, onMounted } from 'vue';
import CardPergunta from '../../components/CardPergunta.vue';
import { useDiagnostico } from '../../composables/useDiagnostico.js';

const { respostas, statusSalvamento, carregando, buscarPerguntas } = useDiagnostico()

const perguntasView = ref([])

onMounted(async () => {
  perguntasView.value = await buscarPerguntas('Ambiental')
})

</script>

<template>
  <div class="max-w-3xl mx-auto py-8 relative">

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-900"></div>
      <span class="ml-3 text-slate-500 font-medium">Carregando perguntas...</span>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800">Ambiental</h1>
      <p class="text-slate-500 mt-2">Responda a las siguientes preguntas de acuerdo con la realidad actual de la empresa.</p>
    </div>

    <CardPergunta
      v-for="pergunta in perguntasView"
      :key="pergunta.id"
      :questao="pergunta"
      v-model="respostas[pergunta.id]"
    />

    <div class="mt-8 flex justify-end">
      <button
        @click="console.log(respostas)"
        class="bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 transition shadow-lg cursor-pointer"
      >
        Guardar Respostas
      </button>
    </div>

  </div>
</template>
