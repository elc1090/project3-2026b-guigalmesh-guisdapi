<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Teste de Fluxo: Diagnóstico</h2>

    <!-- Pergunta 1 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        1. Como a empresa descarta o lixo?
      </label>
      <select v-model="respostas.pergunta1" class="w-full border border-gray-300 rounded-md p-2">
        <option value="1">Lixo comum (1 pt)</option>
        <option value="2">Reciclagem básica (2 pts)</option>
        <option value="3">Gestão sustentável (3 pts)</option>
      </select>
    </div>

    <!-- Pergunta 2 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        2. A empresa possui ações sociais?
      </label>
      <select v-model="respostas.pergunta2" class="w-full border border-gray-300 rounded-md p-2">
        <option value="1">Nenhuma ação (1 pt)</option>
        <option value="2">Ações esporádicas (2 pts)</option>
        <option value="3">Programa estruturado (3 pts)</option>
      </select>
    </div>

    <!-- Botão de Envio -->
    <button 
      @click="enviarRespostas" 
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
    >
      Enviar para a API
    </button>

    <!-- Exibição do Resultado -->
    <div v-if="resultado" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
      <h3 class="text-green-800 font-bold">Resultado Salvo!</h3>
      <p class="text-green-700">Pontuação Total: {{ resultado.pontuacao }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// O "ref" torna as variáveis reativas. Se elas mudarem, a tela atualiza na hora.
const respostas = ref({
  pergunta1: '1',
  pergunta2: '1'
})

const resultado = ref(null)

// Função que envia o JSON para o FastAPI
const enviarRespostas = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/diagnostico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(respostas.value)
    })
    
    // Captura a resposta do back-end e atualiza a tela
    const data = await response.json()
    resultado.value = data
    
  } catch (erro) {
    console.error("Erro de comunicação com o Back-end:", erro)
  }
}
</script>