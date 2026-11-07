import {
  ICONE_LIVRO, ICONE_CASA, ICONE_EMPRESA, ICONE_CHECKLIST, ICONE_TENDENCIA, ICONE_GLOBO
} from './icones'

// Itens de navegação do app, na ordem do menu lateral (desktop).
// exato: só fica ativo na rota exata (senão "/" ficaria ativo em todas as telas)
// rotuloCurto: usado na barra inferior do celular, onde o espaço é pequeno
export const NAVEGACAO = [
  { para: '/', rotulo: 'Inicio', icone: ICONE_CASA, exato: true },
  { para: '/guia', rotulo: 'Guía sostenible', icone: ICONE_LIVRO },
  { para: '/empresa', rotulo: 'Mi empresa', rotuloCurto: 'Empresa', icone: ICONE_EMPRESA },
  { para: '/diagnostico', rotulo: 'Diagnóstico', icone: ICONE_CHECKLIST },
  { para: '/resultado', rotulo: 'Resultados del diagnóstico', rotuloCurto: 'Resultados', icone: ICONE_TENDENCIA },
  { para: '/ods', rotulo: 'Objetivos de Desarrollo Sostenible', icone: ICONE_GLOBO }
]

// Barra inferior do celular: os 4 principais, nesta ordem; o resto vai para "Más"
const ORDEM_PRINCIPAL = ['/', '/diagnostico', '/resultado', '/empresa']
export const NAV_PRINCIPAL = ORDEM_PRINCIPAL.map((para) => NAVEGACAO.find((item) => item.para === para))
export const NAV_SECUNDARIA = NAVEGACAO.filter((item) => !ORDEM_PRINCIPAL.includes(item.para))
