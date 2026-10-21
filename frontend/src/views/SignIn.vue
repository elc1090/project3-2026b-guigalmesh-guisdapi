<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import BackgroundWaves from '../components/ui/BackgroundWaves.vue'

const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')
const sucesso = ref('')

const traduzirErro = (mensagem) => {
  if (mensagem.includes('already registered')) return 'Este correo ya está registrado.'
  if (mensagem.includes('at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (mensagem.toLowerCase().includes('rate limit')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  if (mensagem.toLowerCase().includes('invalid') && mensagem.toLowerCase().includes('email')) return 'El correo electrónico no es válido.'
  return 'No fue posible crear la cuenta. Inténtalo de nuevo.'
}

const cadastrarUsuario = async () => {
  erro.value = ''
  sucesso.value = ''

  if (!nome.value || !email.value || !senha.value) {
    erro.value = 'Completa nombre, correo y contraseña.'
    return
  }
  if (senha.value.length < 6) {
    erro.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  carregando.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: senha.value,
      options: { data: { nome: nome.value } }
    })

    if (error) {
      erro.value = traduzirErro(error.message)
      return
    }

    if (data.session) {
      router.push('/diagnostico')
    } else {
      sucesso.value = '¡Cuenta creada! Revisa tu correo para confirmar el registro.'
    }
  } catch (e) {
    console.error('Erro ao cadastrar:', e)
    erro.value = 'No fue posible crear la cuenta. Inténtalo de nuevo.'
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
          VERDE IMPULSO
        </span>
        <h2 class="text-2xl font-bold text-slate-800">Crear cuenta</h2>
        <p class="text-sm text-slate-500 mt-1">Comienza a medir la sostenibilidad de tu empresa</p>
      </div>

      <form class="space-y-5" @submit.prevent="cadastrarUsuario">
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
          <input
            v-model="nome"
            type="text"
            id="username"
            placeholder="Tu nombre"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
          >
        </div>

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
            placeholder="Mínimo 6 caracteres"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
          >
        </div>

        <p v-if="erro" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ erro }}
        </p>
        <p v-if="sucesso" class="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {{ sucesso }}
        </p>

        <button
          type="submit"
          :disabled="carregando"
          class="w-full bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
        >
          {{ carregando ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
      </form>

      <p class="text-sm text-slate-600 text-center mt-6">
        ¿Ya tienes una cuenta?
        <router-link to="/login" class="text-emerald-800 hover:underline font-bold">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>