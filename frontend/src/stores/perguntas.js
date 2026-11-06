import { computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { criarRecurso, HORA } from '../lib/cache'

// Uma consulta só traz todas as perguntas ativas; o agrupamento por dimensão
// e a contagem saem daqui. As perguntas quase nunca mudam: TTL longo.
export const usePerguntasStore = defineStore('perguntas', () => {
  const recurso = criarRecurso({
    chave: 'perguntas',
    ttl: HORA,
    buscar: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
      if (error) throw error
      return data ?? []
    }
  })

  const total = computed(() => recurso.dado.value?.length ?? 0)
  const daCategoria = (categoria) => (recurso.dado.value ?? []).filter((p) => p.categoria === categoria)

  return { ...recurso, total, daCategoria }
})
