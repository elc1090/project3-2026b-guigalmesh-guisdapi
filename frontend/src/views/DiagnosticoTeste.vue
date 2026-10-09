<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Prueba de flujo: Diagnóstico</h2>

    <!-- Pergunta 1 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        1. ¿Cómo gestiona la empresa sus residuos?
      </label>
      <select v-model="respostas.pergunta1" class="w-full border border-gray-300 rounded-md p-2">
        <option value="1">Basura común (1 pt)</option>
        <option value="2">Reciclaje básico (2 pts)</option>
        <option value="3">Gestión sostenible (3 pts)</option>
      </select>
    </div>

    <!-- Pergunta 2 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        2. ¿La empresa realiza acciones sociales?
      </label>
      <select v-model="respostas.pergunta2" class="w-full border border-gray-300 rounded-md p-2">
        <option value="1">Ninguna acción (1 pt)</option>
        <option value="2">Acciones esporádicas (2 pts)</option>
        <option value="3">Programa estructurado (3 pts)</option>
      </select>
    </div>

    <!-- Botão de Envio -->
    <button
      @click="enviarRespostas"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
    >
      Enviar a la API
    </button>

    <p v-if="erro" class="mt-4 text-sm text-red-600">{{ erro }}</p>

    <!-- Exibição do Resultado -->
    <div v-if="resultado" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
      <h3 class="text-green-800 font-bold">¡Resultado guardado!</h3>
      <p class="text-green-700">Puntaje total: {{ resultado.pontuacao }}</p>
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
const erro = ref('')

// Função que envia o JSON para o FastAPI
const enviarRespostas = async () => {
  erro.value = ''
  resultado.value = null

  try {
    const response = await fetch('http://localhost:8000/api/diagnostico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(respostas.value)
    })

    const data = await response.json()

    // Só mostra "guardado" se o back-end respondeu com sucesso
    if (!response.ok) {
      console.error('Erro do back-end:', data)
      erro.value = 'No fue posible guardar el resultado. Inténtalo de nuevo.'
      return
    }

    resultado.value = data
  } catch (e) {
    console.error('Erro de comunicação com o Back-end:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  }
}
</script>