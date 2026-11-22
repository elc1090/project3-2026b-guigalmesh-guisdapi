import { defineStore } from 'pinia'
import { apiFetch } from '../lib/api'
import { criarRecurso, ErroHttp, MINUTO } from '../lib/cache'

// dado: [{ data, geral, dimensoes: { nome: pontuacao } }] do diagnóstico mais antigo para o mais novo
export const useHistoricoStore = defineStore('historico', () => {
  const recurso = criarRecurso({
    chave: 'historico',
    ttl: 5 * MINUTO,
    buscar: async () => {
      const res = await apiFetch('/api/diagnostico/historico')
      // 400: sem empresa cadastrada
      if (res.status === 400) return []
      if (!res.ok) throw new ErroHttp(res.status)
      const dados = await res.json()
      return Array.isArray(dados) ? dados : []
    }
  })

  return { ...recurso }
})
