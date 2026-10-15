<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import BackgroundWaves from '../components/ui/BackgroundWaves.vue'

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
  <div class="relative min-h-dvh bg-emerald-800 flex items-center justify-center p-4 overflow-hidden">
    <BackgroundWaves class="absolute inset-0 pointer-events-none select-none opacity-80" />

    <div class="relative z-10 max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
      <div class="text-center mb-8">
        <span class="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-3">
          SOSTENPYME
        </span>
        <h2 class="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
        <p class="text-sm text-slate-500 mt-1">Accede al diagnóstico de sostenibilidad de tu empresa</p>
      </div>

      <form class="space-y-5" @submit.prevent="entrar">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="tu@empresa.com"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input
            v-model="senha"
            type="password"
            id="password"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
          >
        </div>

        <p v-if="erro" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ erro }}
        </p>

        <button
          type="submit"
          :disabled="carregando"
          class="w-full bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
        >
          {{ carregando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="text-sm text-slate-600 text-center mt-6">
        ¿Aún no tienes cuenta?
        <router-link to="/cadastro" class="text-emerald-800 hover:underline font-bold">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>