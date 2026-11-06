<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AuthLayout from '../layouts/AuthLayout.vue'
import Alerta from '../components/ui/Alerta.vue'

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
  <AuthLayout titulo="Iniciar sesión" subtitulo="Accede al diagnóstico de sostenibilidad de tu empresa">
    <form class="space-y-5" @submit.prevent="entrar">
      <div>
        <label for="email" class="rotulo">Correo electrónico</label>
        <input v-model="email" type="email" id="email" autocomplete="email" placeholder="tu@empresa.com" class="campo">
      </div>

      <div>
        <label for="password" class="rotulo">Contraseña</label>
        <input v-model="senha" type="password" id="password" autocomplete="current-password" placeholder="••••••••" class="campo">
      </div>

      <Alerta v-if="erro">{{ erro }}</Alerta>

      <button
        type="submit"
        :disabled="carregando"
        class="w-full bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
      >
        {{ carregando ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>
    </form>

    <template #rodape>
      ¿Aún no tienes cuenta?
      <router-link to="/cadastro" class="text-emerald-800 hover:underline font-bold">Regístrate</router-link>
    </template>
  </AuthLayout>
</template>
