<script setup>
import { ref } from 'vue'
import { entrarComGoogle } from '../../lib/auth'

// Login federado: botão "Continuar con Google" + separador "o", usado no Login e no Cadastro.
// O Supabase Auth faz o fluxo OAuth com o Google (redireciona, recebe o retorno, valida o
// ID token e cria o usuário); o app só inicia o fluxo e recebe a sessão de volta em /login.
const props = defineProps({
  // para onde ir depois do login (ex.: ?redirect= da tela de login)
  redirect: { type: String, default: '' }
})

const carregando = ref(false)
const erro = ref('')

async function continuar() {
  erro.value = ''
  carregando.value = true
  try {
    // em caso de sucesso o navegador sai do app e vai para o Google
    await entrarComGoogle(props.redirect)
  } catch (e) {
    console.error('Erro ao iniciar login com Google:', e)
    erro.value = 'No fue posible conectar con Google. Inténtalo de nuevo.'
    carregando.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3 my-5" aria-hidden="true">
      <span class="h-px flex-1 bg-slate-200"></span>
      <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">o</span>
      <span class="h-px flex-1 bg-slate-200"></span>
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl shadow-xs transition cursor-pointer hover:bg-slate-50 disabled:opacity-60 disabled:cursor-wait"
      :disabled="carregando"
      :aria-busy="carregando"
      @click="continuar"
    >
      <span v-if="carregando" class="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" aria-hidden="true"></span>
      {{ carregando ? 'Conectando con Google...' : 'Continuar con Google' }}
    </button>

    <p v-if="erro" class="mt-2 text-sm text-red-700" role="alert">{{ erro }}</p>
  </div>
</template>
