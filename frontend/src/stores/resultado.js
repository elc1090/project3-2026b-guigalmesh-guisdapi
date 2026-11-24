import { defineStore } from 'pinia'
import { apiFetch } from '../lib/api'
import { criarRecurso, ErroHttp, MINUTO } from '../lib/cache'
import { useHistoricoStore } from './historico'

const resultadoValido = (dados) => (dados && dados.geral && dados.dimensoes ? dados : null)

// dado: resultado do último diagnóstico, ou null se ainda não há diagnóstico concluído
export const useResultadoStore = defineStore('resultado', () => {
  const recurso = criarRecurso({
    chave: 'resultado-v2', // v2: recomendações por pergunta + fortalezas
    ttl: 5 * MINUTO,
    porIdioma: true, // recomendações e fortalezas vêm no idioma escolhido
    buscar: async () => {
      const res = await apiFetch('/api/diagnostico/resultado')
      // 404: sem diagnóstico concluído / 400: sem empresa cadastrada
      if (res.status === 404 || res.status === 400) return null
      if (!res.ok) {
        console.error('Erro do back-end:', await res.json().catch(() => null))
        throw new ErroHttp(res.status)
      }
      return resultadoValido(await res.json())
    }
  })

  // /concluir devolve o resultado no mesmo formato, então já entra no cache.
  // O histórico ganhou um ponto novo: marca como velho para o gráfico buscar de novo.
  const definirResultado = (dados) => {
    recurso.definir(resultadoValido(dados))
    useHistoricoStore().invalidar()
  }

  // troca o status de uma recomendação no resultado em cache (sem buscar tudo de novo)
  const comStatus = (recomendacaoId, status) => {
    const atual = recurso.dado.value
    if (!atual?.recomendacoes) return
    recurso.definir({
      ...atual,
      recomendacoes: atual.recomendacoes.map((r) => (r.id === recomendacaoId ? { ...r, status } : r))
    })
  }

  // Plano de ação: muda na tela na hora (otimista) e volta ao status anterior se o back-end recusar.
  async function atualizarStatusAcao(recomendacaoId, status) {
    const anterior = recurso.dado.value?.recomendacoes?.find((r) => r.id === recomendacaoId)?.status ?? 'pendiente'
    comStatus(recomendacaoId, status)
    let res = null
    try {
      res = await apiFetch(`/api/acoes/${encodeURIComponent(recomendacaoId)}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
    } catch {
      // sem conexão: cai no erro abaixo
    }
    if (!res?.ok) {
      comStatus(recomendacaoId, anterior)
      throw new ErroHttp(res?.status ?? 0)
    }
  }

  return { ...recurso, definirResultado, atualizarStatusAcao }
})
