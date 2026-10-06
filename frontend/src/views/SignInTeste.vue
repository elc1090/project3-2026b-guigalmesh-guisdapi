<script setup>

const cadastrarUsuario = async () => {
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

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">

      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">
        Criar Conta
      </h2>

      <form class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Nome:</label>
          <input
            type="text"
            id="username"
            placeholder="Seu nome"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail:</label>
          <input
            type="email"
            id="email"
            placeholder="seu@email.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha:</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <button
          type="button"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-2"
        >
          Cadastrar
        </button>
      </form>

      <p class="text-sm text-gray-600 text-center mt-6">
        Já tem uma conta?
        <a href="#" class="text-blue-600 hover:underline font-medium">Faça login</a>
      </p>

    </div>
  </div>
</template>
