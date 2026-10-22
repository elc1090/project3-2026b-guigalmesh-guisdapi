import { supabase } from './supabase'
import { sessao } from './sessao'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// margem para não mandar um token que expira durante a requisição
const MARGEM_EXPIRACAO_MS = 30 * 1000

async function obterToken() {
  const atual = sessao.value
  if (atual?.access_token && atual.expires_at * 1000 - Date.now() > MARGEM_EXPIRACAO_MS) {
    return atual.access_token
  }
  // sem sessão em memória (ou quase expirada): deixa o supabase-js ler/renovar
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function apiFetch(path, options = {}) {
  const token = await obterToken()

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}