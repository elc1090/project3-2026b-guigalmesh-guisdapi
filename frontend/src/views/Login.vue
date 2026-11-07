<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { servidorLento } from '../lib/api'
import { emailValido, focarPrimeiroErro } from '../lib/validacao'
import Campo from '../components/ui/Campo.vue'
import CampoSenha from '../components/ui/CampoSenha.vue'
import BotaoPrimario from '../components/ui/BotaoPrimario.vue'
import Alerta from '../components/ui/Alerta.vue'

const route = useRoute()
const router = useRouter()

const email = ref('')
const senha = ref('')
const carregando = ref(false)
// veio do apiFetch depois de um 401: avisa em vez de só mostrar o login
const sessaoExpirou = computed(() => route.query.expirou === '1')
const erro = ref('')
// os erros dos campos só aparecem depois da primeira tentativa de enviar
const tentou = ref(false)

const errosCampos = computed(() => ({
  email: !email.value.trim()
    ? 'Ingresa tu correo electrónico.'
    : !emailValido(email.value) ? 'Revisa el formato del correo (ej.: tu@empresa.com).' : '',
  password: !senha.value ? 'Ingresa tu contraseña.' : ''
}))
const erroDe = (campo) => (tentou.value ? errosCampos.value[campo] : '')

const traduzirErro = (mensagem) => {
  if (mensagem.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (mensagem.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (mensagem.toLowerCase().includes('rate limit')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  return 'No fue posible iniciar sesión. Inténtalo de nuevo.'
}

// no desktop já abre com o cursor no e-mail (no celular isso abriria o teclado sem pedir)
onMounted(() => {
  if (window.matchMedia('(min-width: 1024px)').matches) document.getElementById('email')?.focus()
})

const entrar = async () => {
  erro.value = ''
  tentou.value = true
  if (Object.values(errosCampos.value).some(Boolean)) {
    focarPrimeiroErro(errosCampos.value)
    return
  }

  carregando.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: senha.value
    })
    if (error) {
      erro.value = traduzirErro(error.message)
      return
    }
    // await: o botão continua em "Ingresando..." até a próxima tela abrir (o guard da rota
    // pode esperar o back-end acordar para conferir a empresa)
    await router.push(route.query.redirect || '/')
  } catch (e) {
    console.error('Erro ao entrar:', e)
    erro.value = 'No fue posible iniciar sesión. Inténtalo de nuevo.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-800">Bienvenido de nuevo</h1>
      <p class="text-slate-500 mt-1">Accede al diagnóstico de sostenibilidad de tu empresa.</p>
    </div>

    <Alerta v-if="sessaoExpirou && !erro" tipo="aviso" class="mb-5">Tu sesión expiró. Inicia sesión nuevamente para continuar.</Alerta>

    <form class="space-y-5" novalidate @submit.prevent="entrar">
      <Campo id="email" rotulo="Correo electrónico" :erro="erroDe('email')">
        <template #default="{ invalido, descricao }">
          <input
            v-model="email"
            type="email"
            id="email"
            autocomplete="email"
            placeholder="tu@empresa.com"
            class="campo"
            :aria-invalid="invalido"
            :aria-describedby="descricao"
          >
        </template>
      </Campo>

      <Campo id="password" rotulo="Contraseña" :erro="erroDe('password')">
        <template #default="{ invalido, descricao }">
          <CampoSenha
            v-model="senha"
            id="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :aria-invalid="invalido"
            :aria-describedby="descricao"
          />
        </template>
      </Campo>

      <Alerta v-if="erro">{{ erro }}</Alerta>

      <BotaoPrimario :carregando="carregando" :texto-carregando="servidorLento ? 'Conectando con el servidor...' : 'Ingresando...'">
        Iniciar sesión
      </BotaoPrimario>
    </form>

    <p class="text-sm text-slate-600 text-center mt-6">
      ¿Aún no tienes cuenta?
      <router-link to="/cadastro" replace class="text-emerald-800 hover:underline font-bold">Regístrate</router-link>
    </p>
  </div>
</template>
