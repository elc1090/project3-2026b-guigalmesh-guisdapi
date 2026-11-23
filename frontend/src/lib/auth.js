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

// Login federado (OAuth) com Google, feito pelo Supabase Auth: o navegador vai para o Google,
// volta para o callback do Supabase e depois para /login com ?code=... A biblioteca troca o
// código pela sessão sozinha; a tela de login, já com sessão, segue para o app.
// A URL de volta precisa estar em Authentication > URL Configuration > Redirect URLs.
export async function entrarComGoogle(redirect = '') {
  const volta = new URL('/login', window.location.origin)
  if (redirect.startsWith('/') && !redirect.startsWith('//')) volta.searchParams.set('redirect', redirect)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: volta.toString(),
      // sempre deixa escolher a conta (útil em computadores compartilhados)
      queryParams: { prompt: 'select_account' }
    }
  })
  if (error) throw error
}

// salvarAntes: false quando o token já foi recusado (salvar daria 401 de novo)
export async function sair({ salvarAntes = true } = {}) {
  // envia a última resposta antes de perder o token (o erro não impede o logout)
  if (salvarAntes) await salvarRascunhoAgora().catch(() => {})
  await supabase.auth.signOut()
  limparDiagnostico()
  limparTodoCache()
}
