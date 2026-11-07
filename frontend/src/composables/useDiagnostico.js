import { ref, computed, watch, nextTick } from 'vue'
import { apiFetch } from '../lib/api'
import { ErroHttp } from '../lib/cache'
import { usePerguntasStore } from '../stores/perguntas'
import { useResultadoStore } from '../stores/resultado'
import { DIMENSOES } from '../constants/dimensoes'

const respostas = ref({})
const statusSalvamento = ref('')
let timeoutId = null
let timeoutStatusId = null
// espera o usuário parar de clicar antes de salvar (cada salvamento é uma requisição)
const ESPERA_SALVAMENTO_MS = 1000

// evita que carregar o rascunho dispare um salvamento logo em seguida
let restaurando = false
// garante que o rascunho é buscado uma única vez por sessão (várias telas chamam)
let promessaRascunho = null

// há respostas alteradas que ainda não foram enviadas ao back-end
let sujo = false
// salvamento em andamento; enquanto ele não termina, novos pedidos só marcam "pendente"
// (assim um PUT antigo nunca chega depois de um mais novo e sobrescreve o rascunho)
let emVoo = null
let pendente = false

const mostrarStatus = (texto, duracaoMs = 0) => {
  clearTimeout(timeoutStatusId)
  statusSalvamento.value = texto
  if (duracaoMs) timeoutStatusId = setTimeout(() => { statusSalvamento.value = '' }, duracaoMs)
}

async function enviar({ keepalive = false } = {}) {
  sujo = false
  try {
    const res = await apiFetch('/api/diagnostico/rascunho', {
      method: 'PUT',
      body: JSON.stringify({ respostas: respostas.value }),
      // keepalive: o navegador termina a requisição mesmo se a aba for fechada
      keepalive
    })
    if (!res.ok) throw new Error(`Falha ao guardar o rascunho (HTTP ${res.status})`)
    if (!sujo) mostrarStatus('✓ Guardado automáticamente', 2000)
  } catch (e) {
    sujo = true // tenta de novo no próximo salvamento
    console.error(e)
    mostrarStatus('Error al guardar.')
  }
}

// envia agora o que estiver pendente (sem esperar o debounce)
export function salvarRascunhoAgora() {
  clearTimeout(timeoutId)
  timeoutId = null
  if (!sujo) return emVoo ?? Promise.resolve()
  if (emVoo) {
    pendente = true
    return emVoo
  }
  emVoo = (async () => {
    try {
      do {
        pendente = false
        await enviar()
      } while (pendente && sujo)
    } finally {
      emVoo = null
    }
  })()
  return emVoo
}

watch(respostas, () => {
  if (restaurando) return

  sujo = true
  mostrarStatus('Guardando...')
  clearTimeout(timeoutId)
  timeoutId = setTimeout(salvarRascunhoAgora, ESPERA_SALVAMENTO_MS)
}, { deep: true })

// aba ficou oculta (troca de app no celular, fechar aba, recarregar): salva na hora.
// No celular o "pagehide" nem sempre dispara, por isso o visibilitychange.
if (typeof document !== 'undefined') {
  const salvarAoSair = () => {
    if (!sujo) return
    clearTimeout(timeoutId)
    timeoutId = null
    enviar({ keepalive: true })
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') salvarAoSair()
  })
  window.addEventListener('pagehide', salvarAoSair)
}

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

// Finaliza o diagnóstico: o back-end calcula e devolve o resultado, que já entra no cache
// (a tela de resultados abre sem nova requisição). Erros HTTP saem como ErroHttp (status 422 =
// faltam respostas).
export async function concluirDiagnostico() {
  // um salvamento de rascunho pendente terminando depois do /concluir criaria um rascunho novo
  await salvarRascunhoAgora()
  const res = await apiFetch('/api/diagnostico/concluir', {
    method: 'POST',
    body: JSON.stringify({ respostas: respostas.value })
  })
  if (!res.ok) {
    console.error('Erro do back-end:', await res.json().catch(() => null))
    throw new ErroHttp(res.status)
  }
  const resultado = await res.json()
  useResultadoStore().definirResultado(resultado)
  limparDiagnostico()
  return resultado
}

// chamar no logout e depois de concluir o diagnóstico
export function limparDiagnostico() {
  clearTimeout(timeoutId)
  timeoutId = null
  sujo = false
  pendente = false
  mostrarStatus('')
  promessaRascunho = null
  restaurando = true
  respostas.value = {}
  nextTick(() => { restaurando = false })
}

export function useDiagnostico() {
    const carregando = ref(false)

    const buscarPerguntas = async (categoriaNome) => {
        const perguntasStore = usePerguntasStore()
        // spinner só se as perguntas nunca foram carregadas (sem cache)
        carregando.value = perguntasStore.dado === undefined

        await Promise.all([
            // sem isso, dar F5 numa dimensão começaria vazio e sobrescreveria o rascunho salvo
            carregarRascunho().catch((e) => console.error('Erro ao carregar rascunho:', e)),
            perguntasStore.carregar().catch((e) => console.error('Erro ao buscar perguntas:', e))
        ])

        carregando.value = false

        return perguntasStore.daCategoria(categoriaNome)
    }

    return {
        respostas,
        statusSalvamento,
        carregando,
        buscarPerguntas
    }
}
// Progresso do questionário (só perguntas ativas; respostas antigas de perguntas desativadas não contam).
// Usado no menu do diagnóstico, na tela das dimensões e no Início.
export function useProgressoDiagnostico() {
  const perguntasStore = usePerguntasStore()

  const porDimensao = computed(() =>
    DIMENSOES.map((d) => {
      const perguntas = perguntasStore.daCategoria(d.nome)
      const respondidas = perguntas.filter((p) => respostas.value[p.id] != null).length
      return { nome: d.nome, slug: d.slug, total: perguntas.length, respondidas, faltam: perguntas.length - respondidas }
    })
  )
  const total = computed(() => perguntasStore.total)
  const respondidas = computed(() => porDimensao.value.reduce((soma, d) => soma + d.respondidas, 0))
  const completo = computed(() => total.value > 0 && respondidas.value >= total.value)
  const porcentagem = computed(() =>
    total.value ? Math.min(100, Math.round((respondidas.value / total.value) * 100)) : 0
  )
  const faltantes = computed(() => porDimensao.value.filter((d) => d.faltam > 0))
  // para onde o "Continuar" leva: a primeira dimensão com perguntas sem resposta
  const primeiraIncompleta = computed(() => faltantes.value[0] ?? null)

  return { porDimensao, total, respondidas, completo, porcentagem, faltantes, primeiraIncompleta }
}

// texto de erro para mostrar quando concluirDiagnostico() falha (401 já leva ao login pelo apiFetch)
export function mensagemErroConclusao(e) {
  if (e?.status === 422) return 'Responde todas las preguntas antes de finalizar.'
  if (e?.status) return 'No fue posible finalizar el diagnóstico. Inténtalo de nuevo.'
  console.error('Erro de comunicação com o Back-end:', e)
  return 'No se pudo conectar con el servidor.'
}
