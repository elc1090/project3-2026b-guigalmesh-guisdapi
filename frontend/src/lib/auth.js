import { ref } from 'vue'
import { supabase } from './supabase'

export const sessao = ref(null)

export async function iniciarAuth() {
  const { data } = await supabase.auth.getSession()
  sessao.value = data.session

  supabase.auth.onAuthStateChange((_evento, novaSessao) => {
    sessao.value = novaSessao
  })
}

export async function sair() {
  await supabase.auth.signOut()
}