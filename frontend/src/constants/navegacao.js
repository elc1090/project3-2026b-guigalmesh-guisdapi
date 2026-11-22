import { ICONE_LIVRO, ICONE_CASA, ICONE_TENDENCIA, ICONE_ARVORE } from './icones'

// Itens de navegação do app (barra lateral no desktop e barra inferior no celular), nesta ordem.
// rotuloCurto: usado na barra inferior do celular, onde o espaço é pequeno.
// O Início reúne empresa e diagnóstico, então também fica ativo nas telas das dimensões.
export const NAVEGACAO = [
  { para: '/', rotulo: 'Inicio', icone: ICONE_CASA, exato: true, tambemEm: ['/diagnostico'] },
  { para: '/resultado', rotulo: 'Resultados', icone: ICONE_TENDENCIA },
  { para: '/educacion', rotulo: 'Educación sostenible', rotuloCurto: 'Educación', icone: ICONE_LIVRO },
  { para: '/huella-positiva', rotulo: 'Huella positiva', rotuloCurto: 'Huella', icone: ICONE_ARVORE }
]

// item ativo para o caminho atual
export function itemAtivo(item, caminho) {
  if (item.tambemEm?.some((prefixo) => caminho.startsWith(prefixo))) return true
  return item.exato ? caminho === item.para : caminho.startsWith(item.para)
}
