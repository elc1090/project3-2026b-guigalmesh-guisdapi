import { ref, watch, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'

const cachePerguntas = ref({
    Gobernanza: [],
    Social: [],
    Ambiental: [],
    Económica: []
})

const respostas = ref({})
const statusSalvamento = ref('')
let timeoutId = null

// evita que carregar o rascunho dispare um salvamento logo em seguida
let restaurando = false
// garante que o rascunho é buscado uma única vez por sessão (várias telas chamam)
let promessaRascunho = null

watch(respostas, () => {
  if (restaurando) return

  statusSalvamento.value = 'Guardando...'
  clearTimeout(timeoutId)

  timeoutId = setTimeout(async () => {
    try {
      const res = await apiFetch('/api/diagnostico/rascunho', {
        method: 'PUT',
        body: JSON.stringify({ respostas: respostas.value })
      })
      if (!res.ok) throw new Error('Falha ao guardar o rascunho')

      statusSalvamento.value = '✓ Guardado automáticamente'
      setTimeout(() => { statusSalvamento.value = '' }, 2000)
    } catch (e) {
      console.error(e)
      statusSalvamento.value = 'Error al guardar.'
    }
  }, 500)

}, { deep: true })

export function carregarRascunho() {
  if (!promessaRascunho) {
    promessaRascunho = (async () => {
      const res = await apiFetch('/api/diagnostico/rascunho')
      if (!res.ok) throw new Error('Não foi possível carregar o rascunho')
      const data = await res.json()

      restaurando = true
      respostas.value = data.respostas
      await nextTick()
      restaurando = false
    })().catch((e) => {
      promessaRascunho = null // permite tentar de novo
      restaurando = false
      throw e
    })
  }
  return promessaRascunho
}

// chamar no logout e depois de concluir o diagnóstico
export function limparDiagnostico() {
  clearTimeout(timeoutId)
  promessaRascunho = null
  restaurando = true
  respostas.value = {}
  nextTick(() => { restaurando = false })
}

export function useDiagnostico() {
    const carregando = ref(false)

    const buscarPerguntas = async (categoriaNome) => {
        // sem isso, dar F5 numa dimensão começaria vazio e sobrescreveria o rascunho salvo
        try {
            await carregarRascunho()
        } catch (e) {
            console.error('Erro ao carregar rascunho:', e)
        }

        if (cachePerguntas.value[categoriaNome].length > 0) {
            return cachePerguntas.value[categoriaNome]
        }
        carregando.value = true

        const { data, error } = await supabase
            .from('perguntas')
            .select('*')
            .eq('categoria', categoriaNome)
            .order('ordem', { ascending: true })

        if(!error && data) {
            cachePerguntas.value[categoriaNome] = data
        } else {
            console.error('Erro ao buscar perguntas:', error)
        }

        carregando.value = false

        return cachePerguntas.value[categoriaNome]
    }

    return {
        respostas,
        statusSalvamento,
        carregando,
        buscarPerguntas
    }
}