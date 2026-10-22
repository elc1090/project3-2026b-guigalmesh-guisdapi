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

  return { ...recurso }
})
