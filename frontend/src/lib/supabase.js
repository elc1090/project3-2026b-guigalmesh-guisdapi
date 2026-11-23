import { createClient } from '@supabase/supabase-js'

// Usa só a chave pública (anon / publishable). A secret key fica apenas no back-end.
// flowType 'pkce' no login com Google: o Supabase devolve um código de uso único na URL
// (?code=...) e a biblioteca o troca pela sessão usando um segredo guardado neste navegador,
// então um código interceptado não serve em outro lugar (o mesmo papel do "state" no OAuth).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { flowType: 'pkce' } }
)
