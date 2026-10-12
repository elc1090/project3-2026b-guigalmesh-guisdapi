import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'

const cachePerguntas = ref({
    Gobernanza: [],
    Social: [],
    Ambiental: [],
    Económica: []
})

const respostas = ref({})
const statusSalvamento = ref('')
let timeoutId = null

watch(respostas, () => {
  statusSalvamento.value = 'Guardando...'
  clearTimeout(timeoutId)

  timeoutId = setTimeout(async () => {
    // const { error } = await supabase.from('diagnostico').upsert({
    //   user_id: 'ID_DO_USUARIO_LOGADO',
    //   respostas: respostas.value,
    //   status: 'rascunho'
    // })

    // Simulando o sucesso para o exemplo:
    const error = false

    if (!error) {
      statusSalvamento.value = '✓ Guardado automaticamente'
      setTimeout(() => { statusSalvamento.value = '' }, 2000)
    } else {
      statusSalvamento.value = 'Erro ao guardar.'
    }
  }, 500)

}, { deep: true })

export function useDiagnostico() {
    const carregando = ref(false)

    const buscarPerguntas = async (categoriaNome) => {
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
