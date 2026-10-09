<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()

const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')

const traduzirErro = (mensagem) => {
  if (mensagem.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (mensagem.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (mensagem.toLowerCase().includes('rate limit')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  return 'No fue posible iniciar sesión. Inténtalo de nuevo.'
}

const entrar = async () => {
  erro.value = ''

  if (!email.value || !senha.value) {
    erro.value = 'Completa tu correo y tu contraseña.'
    return
  }

  carregando.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: senha.value
    })

    if (error) {
      erro.value = traduzirErro(error.message)
      return
    }

    router.push(route.query.redirect || '/diagnostico')
  } catch (e) {
    console.error('Erro ao entrar:', e)
    erro.value = 'No fue posible iniciar sesión. Inténtalo de nuevo.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">

      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">
        Iniciar sesión
      </h2>

      <form class="space-y-4" @submit.prevent="entrar">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="tu@correo.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
          <input
            v-model="senha"
            type="password"
            id="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
        </div>

        <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>

        <button
          type="submit"
          :disabled="carregando"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-2"
        >
          {{ carregando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="text-sm text-gray-600 text-center mt-6">
        ¿Aún no tienes cuenta?
        <router-link to="/cadastro" class="text-blue-600 hover:underline font-medium">Regístrate</router-link>
      </p>

    </div>
  </div>
</template>