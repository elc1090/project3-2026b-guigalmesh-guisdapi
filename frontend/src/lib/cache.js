import { ref, computed, watch } from 'vue'
import { sessao } from './sessao'

const PREFIXO = 'cache:'
const recursos = new Set()

export const MINUTO = 60 * 1000
export const HORA = 60 * MINUTO

// Erro com o status HTTP, para as views decidirem (ex.: 401 -> /login)
export class ErroHttp extends Error {
  constructor(status, mensagem = `HTTP ${status}`) {
    super(mensagem)
    this.status = status
  }
}

export const sessaoInvalida = (e) => e?.status === 401 || e?.status === 403

const idUsuario = () => sessao.value?.user?.id ?? null

/**
 * Recurso com cache stale-while-revalidate:
 * - `dado === undefined` significa "nunca carregado" (só aí aparece o spinner);
 * - se há dado em cache, ele é devolvido na hora e, se estiver velho (> ttl),
 *   é revalidado em segundo plano;
 * - chamadas simultâneas compartilham a mesma requisição;
 * - persistido em localStorage, separado por usuário.
 */
export function criarRecurso({ chave, buscar, ttl = 5 * MINUTO }) {
  const dado = ref(undefined)
  const erro = ref(null)
  let atualizadoEm = 0
  let promessa = null
  let usuario = null
  // muda a cada limpeza/troca de usuário; respostas de requisições antigas são descartadas
  let geracao = 0

  const chaveStorage = () => `${PREFIXO}${usuario}:${chave}`

  function hidratar(uid) {
    usuario = uid
    geracao++
    promessa = null
    erro.value = null
    dado.value = undefined
    atualizadoEm = 0
    if (!uid) return
    try {
      const bruto = localStorage.getItem(chaveStorage())
      if (bruto) {
        const salvo = JSON.parse(bruto)
        dado.value = salvo.dado
        atualizadoEm = salvo.em ?? 0
      }
    } catch {
      // cache corrompido: ignora e busca de novo
    }
  }

  watch(idUsuario, (uid) => { if (uid !== usuario) hidratar(uid) }, { immediate: true })

  function definir(valor) {
    const serializado = JSON.stringify({ dado: valor ?? null })
    // revalidação trouxe o mesmo conteúdo: mantém a referência e evita re-render
    if (dado.value === undefined || JSON.stringify({ dado: dado.value ?? null }) !== serializado) {
      dado.value = valor
    }
    erro.value = null
    atualizadoEm = Date.now()
    if (!usuario) return
    try {
      localStorage.setItem(chaveStorage(), JSON.stringify({ dado: valor, em: atualizadoEm }))
    } catch {
      // localStorage cheio/indisponível: segue só com o cache em memória
    }
  }

  function buscarAgora() {
    if (promessa) return promessa
    const minhaGeracao = geracao
    promessa = (async () => {
      try {
        const valor = await buscar()
        if (minhaGeracao === geracao) definir(valor)
        return valor
      } catch (e) {
        if (minhaGeracao === geracao && dado.value === undefined) erro.value = e
        throw e
      } finally {
        if (minhaGeracao === geracao) promessa = null
      }
    })()
    return promessa
  }

  async function carregar({ forcar = false } = {}) {
    // garante o usuário certo mesmo se o watch ainda não rodou
    if (idUsuario() !== usuario) hidratar(idUsuario())
    if (!usuario) return dado.value

    if (forcar || dado.value === undefined) return buscarAgora()

    if (Date.now() - atualizadoEm > ttl) {
      buscarAgora().catch((e) => console.warn(`Falha ao revalidar "${chave}":`, e))
    }
    return dado.value
  }

  // mantém o dado na tela, mas faz a próxima chamada a carregar() revalidar
  function invalidar() {
    atualizadoEm = 0
  }

  function limpar() {
    if (usuario) localStorage.removeItem(chaveStorage())
    hidratar(usuario)
  }

  const carregando = computed(() => dado.value === undefined && !erro.value)

  const recurso = { dado, erro, carregando, carregar, definir, invalidar, limpar }
  recursos.add(recurso)
  return recurso
}

// usado no logout: limpa memória e todas as chaves de cache do navegador
export function limparTodoCache() {
  recursos.forEach((r) => r.limpar())
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignora
  }
}
