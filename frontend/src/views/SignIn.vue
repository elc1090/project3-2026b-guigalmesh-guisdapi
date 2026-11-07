<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { emailValido, forcaSenha, focarPrimeiroErro, SENHA_MINIMO } from '../lib/validacao'
import Campo from '../components/ui/Campo.vue'
import CampoSenha from '../components/ui/CampoSenha.vue'
import BotaoPrimario from '../components/ui/BotaoPrimario.vue'
import Alerta from '../components/ui/Alerta.vue'
import Icone from '../components/ui/Icone.vue'
import { ICONE_EMAIL, ICONE_CHECK } from '../constants/icones'

const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')
const tentou = ref(false)
// depois do cadastro (quando o Supabase exige confirmação), mostra a tela "Revisa tu correo"
const aguardandoConfirmacao = ref(false)

const errosCampos = computed(() => ({
  username: !nome.value.trim() ? 'Ingresa tu nombre.' : '',
  email: !email.value.trim()
    ? 'Ingresa tu correo electrónico.'
    : !emailValido(email.value) ? 'Revisa el formato del correo (ej.: tu@empresa.com).' : '',
  password: senha.value.length < SENHA_MINIMO ? `La contraseña debe tener al menos ${SENHA_MINIMO} caracteres.` : ''
}))
const erroDe = (campo) => (tentou.value ? errosCampos.value[campo] : '')

// barra de força da senha (só aparece enquanto a pessoa digita)
const forca = computed(() => forcaSenha(senha.value))
const FORCAS = {
  1: { rotulo: 'Débil', cor: 'bg-red-500', texto: 'text-red-600' },
  2: { rotulo: 'Media', cor: 'bg-amber-500', texto: 'text-amber-700' },
  3: { rotulo: 'Fuerte', cor: 'bg-emerald-600', texto: 'text-emerald-700' }
}
const minimoAtingido = computed(() => senha.value.length >= SENHA_MINIMO)

const traduzirErro = (mensagem) => {
  if (mensagem.includes('already registered')) return 'Este correo ya está registrado.'
  if (mensagem.includes('at least')) return `La contraseña debe tener al menos ${SENHA_MINIMO} caracteres.`
  if (mensagem.toLowerCase().includes('rate limit')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  if (mensagem.toLowerCase().includes('invalid') && mensagem.toLowerCase().includes('email')) return 'El correo electrónico no es válido.'
  return 'No fue posible crear la cuenta. Inténtalo de nuevo.'
}

onMounted(() => {
  if (window.matchMedia('(min-width: 1024px)').matches) document.getElementById('username')?.focus()
})

const cadastrarUsuario = async () => {
  erro.value = ''
  tentou.value = true
  if (Object.values(errosCampos.value).some(Boolean)) {
    focarPrimeiroErro(errosCampos.value)
    return
  }

  carregando.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: senha.value,
      options: { data: { nome: nome.value.trim() } }
    })

    if (error) {
      erro.value = traduzirErro(error.message)
      return
    }

    if (data.session) {
      // await: mantém o botão carregando até a próxima tela abrir
      await router.push('/diagnostico')
    } else {
      aguardandoConfirmacao.value = true
      iniciarEspera()
    }
  } catch (e) {
    console.error('Erro ao cadastrar:', e)
    erro.value = 'No fue posible crear la cuenta. Inténtalo de nuevo.'
  } finally {
    carregando.value = false
  }
}

// ---------- tela "Revisa tu correo": reenviar com espera entre tentativas
const ESPERA_REENVIO_S = 60
const espera = ref(0)
const reenviando = ref(false)
const mensagemReenvio = ref('')
let intervalo = null

function iniciarEspera() {
  espera.value = ESPERA_REENVIO_S
  clearInterval(intervalo)
  intervalo = setInterval(() => {
    espera.value--
    if (espera.value <= 0) clearInterval(intervalo)
  }, 1000)
}
onBeforeUnmount(() => clearInterval(intervalo))

const reenviar = async () => {
  erro.value = ''
  mensagemReenvio.value = ''
  reenviando.value = true
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.value.trim() })
    if (error) {
      erro.value = traduzirErro(error.message)
      return
    }
    mensagemReenvio.value = 'Te enviamos un nuevo correo de confirmación.'
    iniciarEspera()
  } catch (e) {
    console.error('Erro ao reenviar:', e)
    erro.value = 'No fue posible reenviar el correo. Inténtalo de nuevo.'
  } finally {
    reenviando.value = false
  }
}

const trocarEmail = () => {
  aguardandoConfirmacao.value = false
  mensagemReenvio.value = ''
  erro.value = ''
  clearInterval(intervalo)
}
</script>

<template>
  <Transition name="pagina" mode="out-in">
    <!-- depois do cadastro: confirmar o e-mail -->
    <div v-if="aguardandoConfirmacao" key="confirmar" class="text-center">
      <div class="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
        <Icone :d="ICONE_EMAIL" class="w-8 h-8" />
      </div>
      <h1 class="text-3xl font-bold text-slate-800">Revisa tu correo</h1>
      <p class="text-slate-500 mt-2">
        Enviamos un enlace de confirmación a
        <strong class="block my-1 text-slate-800 [overflow-wrap:anywhere]">{{ email.trim() }}</strong>
        Ábrelo para activar tu cuenta.
      </p>
      <p class="text-xs text-slate-400 mt-2">¿No lo encuentras? Revisa también la carpeta de spam.</p>

      <Alerta v-if="mensagemReenvio" tipo="sucesso" class="mt-5 text-left">{{ mensagemReenvio }}</Alerta>
      <Alerta v-if="erro" class="mt-5 text-left">{{ erro }}</Alerta>

      <button
        type="button"
        @click="reenviar"
        :disabled="espera > 0 || reenviando"
        class="mt-6 w-full bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
      >
        {{ reenviando ? 'Reenviando...' : espera > 0 ? `Reenviar correo (${espera}s)` : 'Reenviar correo' }}
      </button>

      <p class="text-sm text-slate-600 mt-5">
        ¿Correo equivocado?
        <button type="button" @click="trocarEmail" class="font-bold text-emerald-800 hover:underline cursor-pointer">Cambiar correo</button>
      </p>
      <p class="text-sm text-slate-600 mt-2">
        ¿Ya confirmaste?
        <router-link to="/login" replace class="font-bold text-emerald-800 hover:underline">Inicia sesión</router-link>
      </p>
    </div>

    <!-- formulário de cadastro -->
    <div v-else key="formulario">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Crea tu cuenta</h1>
        <p class="text-slate-500 mt-1">Comienza a medir la sostenibilidad de tu empresa.</p>
      </div>

      <form class="space-y-5" novalidate @submit.prevent="cadastrarUsuario">
        <Campo id="username" rotulo="Nombre completo" :erro="erroDe('username')">
          <template #default="{ invalido, descricao }">
            <input
              v-model="nome"
              type="text"
              id="username"
              autocomplete="name"
              placeholder="Tu nombre"
              class="campo"
              :aria-invalid="invalido"
              :aria-describedby="descricao"
            >
          </template>
        </Campo>

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
              autocomplete="new-password"
              :placeholder="`Mínimo ${SENHA_MINIMO} caracteres`"
              :aria-invalid="invalido"
              :aria-describedby="descricao ?? 'password-ajuda'"
            />
          </template>

          <template #extra>
            <div v-if="senha" id="password-ajuda" class="mt-2.5">
              <div class="flex gap-1.5" aria-hidden="true">
                <span
                  v-for="n in 3"
                  :key="n"
                  class="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  :class="n <= forca ? FORCAS[forca].cor : 'bg-slate-200'"
                ></span>
              </div>
              <div class="flex items-center justify-between mt-1.5 text-xs">
                <span class="inline-flex items-center gap-1" :class="minimoAtingido ? 'text-emerald-700' : 'text-slate-500'">
                  <Icone v-if="minimoAtingido" :d="ICONE_CHECK" :stroke-width="3" class="w-3.5 h-3.5" />
                  Al menos {{ SENHA_MINIMO }} caracteres
                </span>
                <span class="font-semibold" :class="FORCAS[forca].texto" aria-live="polite">
                  Seguridad: {{ FORCAS[forca].rotulo }}
                </span>
              </div>
            </div>
          </template>
        </Campo>

        <Alerta v-if="erro">{{ erro }}</Alerta>

        <BotaoPrimario :carregando="carregando" texto-carregando="Creando cuenta...">
          Crear cuenta
        </BotaoPrimario>
      </form>

      <p class="text-sm text-slate-600 text-center mt-6">
        ¿Ya tienes una cuenta?
        <router-link to="/login" replace class="text-emerald-800 hover:underline font-bold">Inicia sesión</router-link>
      </p>
    </div>
  </Transition>
</template>
