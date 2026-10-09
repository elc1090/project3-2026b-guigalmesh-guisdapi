<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const nome = ref('')
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')
const sucesso = ref('')

const cadastrarUsuario = async () => {
  erro.value = ''
  sucesso.value = ''

  if (!nome.value || !email.value || !senha.value) {
    erro.value = 'Preencha nome, e-mail e senha.'
    return
  }
  if (senha.value.length < 6) {
    erro.value = 'A senha precisa ter pelo menos 6 caracteres.'
    return
  }

  carregando.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: senha.value,
      options: { data: { nome: nome.value } } // guarda o nome nos metadados do usuário
    })

    if (error) {
      erro.value = error.message
      return
    }

    // Com "Confirm email" ligado no Supabase, não vem sessão até o usuário confirmar.
    sucesso.value = data.session
      ? 'Conta criada! Você já está logado.'
      : 'Conta criada! Confira seu e-mail para confirmar o cadastro.'
  } catch (e) {
    console.error('Erro ao cadastrar:', e)
    erro.value = 'Não foi possível criar a conta. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">

      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">
        Criar Conta
      </h2>

      <form class="space-y-4" @submit.prevent="cadastrarUsuario">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Nome:</label>
          <input
            v-model="nome"
            type="text"
            id="username"
            placeholder="Seu nome"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="seu@email.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha:</label>
          <input
            v-model="senha"
            type="password"
            id="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>
        <p v-if="sucesso" class="text-sm text-green-700">{{ sucesso }}</p>

        <button
          type="submit"
          :disabled="carregando"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-2"
        >
          {{ carregando ? 'Criando conta...' : 'Cadastrar' }}
        </button>
      </form>

      <p class="text-sm text-gray-600 text-center mt-6">
        Já tem uma conta?
        <a href="#" class="text-blue-600 hover:underline font-medium">Faça login</a>
      </p>

    </div>
  </div>
</template>