import { supabase } from './supabase'
import { sessao } from './sessao'
import { limparTodoCache } from './cache'
import { limparDiagnostico, salvarRascunhoAgora } from '../composables/useDiagnostico'

export { sessao }

export async function iniciarAuth() {
  const { data } = await supabase.auth.getSession()
  sessao.value = data.session

  supabase.auth.onAuthStateChange((_evento, novaSessao) => {
    sessao.value = novaSessao
  })
}

// salvarAntes: false quando o token já foi recusado (salvar daria 401 de novo)
export async function sair({ salvarAntes = true } = {}) {
  // envia a última resposta antes de perder o token (o erro não impede o logout)
  if (salvarAntes) await salvarRascunhoAgora().catch(() => {})
  await supabase.auth.signOut()
  limparDiagnostico()
  limparTodoCache()
}