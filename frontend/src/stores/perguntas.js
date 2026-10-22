import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { criarRecurso, HORA } from '../lib/cache'

export const CATEGORIAS = ['Gobernanza', 'Social', 'Ambiental', 'Económica']

// As perguntas quase nunca mudam: TTL longo, mas ainda revalida em segundo plano
export const usePerguntasStore = defineStore('perguntas', () => {
  const porCategoria = Object.fromEntries(CATEGORIAS.map((categoria) => [
    categoria,
    criarRecurso({
      chave: `perguntas:${categoria}`,
      ttl: HORA,
      buscar: async () => {
        const { data, error } = await supabase
          .from('perguntas')
          .select('*')
          .eq('categoria', categoria)
          .order('ordem', { ascending: true })
        if (error) throw error
        return data ?? []
      }
    })
  ]))

  const total = criarRecurso({
    chave: 'perguntas:total',
    ttl: HORA,
    buscar: async () => {
      const { count, error } = await supabase
        .from('perguntas')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true)
      if (error) throw error
      return count ?? 0
    }
  })

  return { porCategoria, total }
})
