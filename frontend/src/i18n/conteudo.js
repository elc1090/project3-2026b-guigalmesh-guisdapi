import { i18n } from './index'

// Conteúdo longo (temas da Educación, ODS, Huella positiva) fica em espanhol nos arquivos de
// constants/. A tradução é uma "camada" com a mesma forma, só com os textos: ela é aplicada por
// cima do original, e o que não estiver na tradução (ícones, URLs, ids) continua igual.
const ehObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function sobrepor(base, traducao) {
  if (traducao === undefined || traducao === null) return base
  if (Array.isArray(base) && Array.isArray(traducao)) {
    return base.map((item, i) => sobrepor(item, traducao[i]))
  }
  if (ehObjeto(base) && ehObjeto(traducao)) {
    const resultado = { ...base }
    for (const chave of Object.keys(traducao)) resultado[chave] = sobrepor(base[chave], traducao[chave])
    return resultado
  }
  return traducao
}

// versão do conteúdo no idioma atual; reativo quando usado em computed/template
const cache = new WeakMap()
export function noIdioma(base, traducoes) {
  const idioma = i18n.global.locale.value
  const traducao = traducoes[idioma]
  if (!traducao) return base
  let porIdioma = cache.get(base)
  if (!porIdioma) cache.set(base, (porIdioma = {}))
  return (porIdioma[idioma] ??= sobrepor(base, traducao))
}
