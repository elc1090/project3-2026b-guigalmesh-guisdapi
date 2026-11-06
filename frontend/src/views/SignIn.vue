<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AuthLayout from '../layouts/AuthLayout.vue'
import Alerta from '../components/ui/Alerta.vue'

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
  <AuthLayout titulo="Crear cuenta" subtitulo="Comienza a medir la sostenibilidad de tu empresa">
    <form class="space-y-5" @submit.prevent="cadastrarUsuario">
      <div>
        <label for="username" class="rotulo">Nombre completo</label>
        <input v-model="nome" type="text" id="username" autocomplete="name" placeholder="Tu nombre" class="campo">
      </div>

      <div>
        <label for="email" class="rotulo">Correo electrónico</label>
        <input v-model="email" type="email" id="email" autocomplete="email" placeholder="tu@empresa.com" class="campo">
      </div>

      <div>
        <label for="password" class="rotulo">Contraseña</label>
        <input v-model="senha" type="password" id="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres" class="campo">
      </div>

      <Alerta v-if="erro">{{ erro }}</Alerta>
      <Alerta v-if="sucesso" tipo="sucesso">{{ sucesso }}</Alerta>

      <button
        type="submit"
        :disabled="carregando"
        class="w-full bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
      >
        {{ carregando ? 'Creando cuenta...' : 'Registrarse' }}
      </button>
    </form>

    <template #rodape>
      ¿Ya tienes una cuenta?
      <router-link to="/login" class="text-emerald-800 hover:underline font-bold">Inicia sesión</router-link>
    </template>
  </AuthLayout>
</template>
