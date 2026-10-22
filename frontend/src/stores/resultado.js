import { defineStore } from 'pinia'
import { apiFetch } from '../lib/api'
import { criarRecurso, ErroHttp, MINUTO } from '../lib/cache'

const resultadoValido = (dados) => (dados && dados.geral && dados.dimensoes ? dados : null)

// dado: resultado do último diagnóstico, ou null se ainda não há diagnóstico concluído
export const useResultadoStore = defineStore('resultado', () => {
  const recurso = criarRecurso({
    chave: 'resultado',
    ttl: 5 * MINUTO,
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

  // /concluir devolve o resultado no mesmo formato, então já entra no cache
  const definirResultado = (dados) => recurso.definir(resultadoValido(dados))

  return { ...recurso, definirResultado }
})
