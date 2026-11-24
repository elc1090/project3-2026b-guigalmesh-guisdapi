import { i18n } from './index'
import { dimensaoPorNome } from '../constants/dimensoes'

// O back-end e o banco guardam alguns valores como códigos em espanhol (categoria "Económica",
// nível "Básico", prioridade "Media", setor "Construcción"...). Eles continuam iguais no banco;
// aqui viram o rótulo do idioma escolhido.
const t = (...args) => i18n.global.t(...args)
const chave = (texto) => String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const traduzir = (grupo, valor) => {
  const k = `${grupo}.${chave(valor)}`
  return i18n.global.te(k, 'es') ? t(k) : valor
}

export const nomeDimensao = (nome) => {
  const d = dimensaoPorNome(nome)
  return d ? t(`dimensao.${d.slug}.nome`) : nome
}
export const rotuloNivel = (nivel) => traduzir('nivel', nivel)
export const rotuloPrioridade = (prioridade) => traduzir('prioridade', prioridade)
export const rotuloSetor = (setor) => traduzir('setor', setor)
export const rotuloPorte = (porte) => traduzir('porte', porte)
export const rotuloEtapa = (etapa) => traduzir('etapa', etapa)

export const localeData = () => (i18n.global.locale.value === 'pt' ? 'pt-BR' : 'es-CL')
// pontuações com a vírgula decimal do idioma (68,4), no máximo uma casa
export const fmtNumero = (n) => Number(n || 0).toLocaleString(localeData(), { maximumFractionDigits: 1 })
