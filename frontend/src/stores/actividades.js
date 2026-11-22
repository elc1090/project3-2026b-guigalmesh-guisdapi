import { defineStore } from 'pinia'
import { apiFetch } from '../lib/api'
import { criarRecurso, ErroHttp, MINUTO } from '../lib/cache'

// Empresas que dejan huella positiva.
// dado: { actividades: [...], resumen: {...} } ou null (empresa ainda não cadastrada)
export const useActividadesStore = defineStore('actividades', () => {
  const recurso = criarRecurso({
    chave: 'actividades',
    ttl: 5 * MINUTO,
    buscar: async () => {
      const res = await apiFetch('/api/actividades')
      if (res.status === 400) return null // sem empresa cadastrada
      if (!res.ok) throw new ErroHttp(res.status)
      return res.json()
    }
  })

  // depois de criar/editar/apagar, busca de novo: o resumo é calculado no back-end
  async function enviar(caminho, metodo, corpo) {
    const res = await apiFetch(caminho, {
      method: metodo,
      ...(corpo ? { body: JSON.stringify(corpo) } : {})
    })
    if (!res.ok) {
      const detalhe = await res.json().catch(() => null)
      console.error('Erro do back-end:', detalhe)
      throw new ErroHttp(res.status)
    }
    await recurso.carregar({ forcar: true })
  }

  const criar = (dados) => enviar('/api/actividades', 'POST', dados)
  const atualizar = (id, dados) => enviar(`/api/actividades/${encodeURIComponent(id)}`, 'PUT', dados)
  const apagar = (id) => enviar(`/api/actividades/${encodeURIComponent(id)}`, 'DELETE')

  return { ...recurso, criar, atualizar, apagar }
})
