import { ICONE_LIVRO, ICONE_CASA, ICONE_TENDENCIA, ICONE_ARVORE } from './icones'

// Itens de navegação do app (barra lateral no desktop e barra inferior no celular), nesta ordem.
// rotulo/rotuloCurto são chaves do i18n (src/i18n).
// rotuloCurto: usado na barra inferior do celular, onde o espaço é pequeno.
// O Início reúne empresa e diagnóstico, então também fica ativo nas telas das dimensões.
export const NAVEGACAO = [
  { para: '/', rotulo: 'nav.inicio', icone: ICONE_CASA, exato: true, tambemEm: ['/diagnostico'] },
  { para: '/resultado', rotulo: 'nav.resultados', icone: ICONE_TENDENCIA },
  { para: '/educacion', rotulo: 'nav.educacion', rotuloCurto: 'nav.educacionCurto', icone: ICONE_LIVRO },
  { para: '/huella-positiva', rotulo: 'nav.huella', rotuloCurto: 'nav.huellaCurto', icone: ICONE_ARVORE }
]

// item ativo para o caminho atual
export function itemAtivo(item, caminho) {
  if (item.tambemEm?.some((prefixo) => caminho.startsWith(prefixo))) return true
  return item.exato ? caminho === item.para : caminho.startsWith(item.para)
}
