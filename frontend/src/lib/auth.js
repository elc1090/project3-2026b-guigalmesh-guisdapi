import { supabase } from './supabase'
import { sessao } from './sessao'
import { limparTodoCache } from './cache'
import { limparDiagnostico } from '../composables/useDiagnostico'

export { sessao }

export async function iniciarAuth() {
  const { data } = await supabase.auth.getSession()
  sessao.value = data.session

  supabase.auth.onAuthStateChange((_evento, novaSessao) => {
    sessao.value = novaSessao
  })
}

export async function sair() {
  await supabase.auth.signOut()
  limparDiagnostico()
  limparTodoCache()
}