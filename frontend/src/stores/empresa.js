import { defineStore } from 'pinia'
import { apiFetch } from '../lib/api'
import { criarRecurso, ErroHttp, MINUTO } from '../lib/cache'

// dado: objeto da empresa, ou null se o usuário ainda não cadastrou
export const useEmpresaStore = defineStore('empresa', () => {
  const recurso = criarRecurso({
    chave: 'empresa',
    ttl: 5 * MINUTO,
    buscar: async () => {
      const res = await apiFetch('/api/empresa')
      if (!res.ok) throw new ErroHttp(res.status)
      return await res.json()
    }
  })

  // cria (POST) ou atualiza (PUT) e já guarda a resposta no cache
  async function salvar(dados) {
    const jaExiste = !!recurso.dado.value
    const res = await apiFetch('/api/empresa', {
      method: jaExiste ? 'PUT' : 'POST',
      body: JSON.stringify(dados)
    })
    if (!res.ok) {
      console.error('Erro do back-end:', await res.json().catch(() => null))
      throw new ErroHttp(res.status)
    }
    const empresa = await res.json()
    recurso.definir(empresa)
    return empresa
  }

  return { ...recurso, salvar }
})
