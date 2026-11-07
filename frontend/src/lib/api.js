import { ref } from 'vue'
import { supabase } from './supabase'
import { sessao } from './sessao'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ---------- Servidor lento / "acordando" ----------
// No plano gratuito do Render o back-end dorme depois de um tempo sem uso, e a primeira
// requisição pode levar até ~1 minuto. Quando alguma requisição passa deste limite, o
// AvisoServidor (App.vue) aparece, para a tela não parecer travada.
const LIMITE_LENTO_MS = 2500
let requisicoesLentas = 0
// true enquanto houver alguma requisição demorando mais que o limite
export const servidorLento = ref(false)
// quando a espera atual começou (para o aviso trocar a mensagem se demorar muito)
export const lentoDesde = ref(0)

function marcarLenta() {
  if (requisicoesLentas++ === 0) {
    lentoDesde.value = Date.now() - LIMITE_LENTO_MS
    servidorLento.value = true
  }
}
function desmarcarLenta() {
  if (--requisicoesLentas === 0) servidorLento.value = false
}

// Chamado ao abrir o app: começa a acordar o servidor enquanto a pessoa ainda digita o login.
// Não entra na contagem de "lento" (ninguém está esperando por ela).
export function acordarServidor() {
  fetch(`${API_URL}/health`, { cache: 'no-store' }).catch(() => {})
}

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

let redirecionando = false

// Token recusado pelo back-end (expirou ou foi revogado): encerra a sessão local e leva ao
// login uma vez só, guardando a tela atual para voltar depois. Centralizado aqui para as
// telas não precisarem tratar 401/403 uma por uma.
async function sessaoExpirada() {
  if (redirecionando) return
  redirecionando = true
  try {
    // import dinâmico: o router importa as stores, que importam este arquivo
    const [{ default: router }, { sair }] = await Promise.all([import('../router'), import('./auth')])
    const atual = router.currentRoute.value
    await sair({ salvarAntes: false })
    if (!atual.path.startsWith('/login')) {
      await router.push({ path: '/login', query: { redirect: atual.fullPath, expirou: '1' } })
    }
  } finally {
    redirecionando = false
  }
}

export async function apiFetch(path, options = {}) {
  const token = await obterToken()

  let ficouLenta = false
  const timer = setTimeout(() => { ficouLenta = true; marcarLenta() }, LIMITE_LENTO_MS)
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } finally {
    clearTimeout(timer)
    if (ficouLenta) desmarcarLenta()
  }

  // 401: token inválido. (403 o back-end não usa para sessão; fica com quem chamou.)
  if (res.status === 401 && token) sessaoExpirada()
  return res
}