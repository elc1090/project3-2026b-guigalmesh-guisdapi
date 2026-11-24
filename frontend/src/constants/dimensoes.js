import { ICONE_FOLHA } from './icones'

// Fonte única das 3 dimensões do diagnóstico. A ordem daqui é a ordem das telas
// (cards do menu, radar no sentido horário a partir do topo, barras e cards do resultado).
// - nome: igual à coluna "categoria" da tabela perguntas
// - slug: usado nas rotas /diagnostico/:dimensao e nas chaves do i18n (dimensao.<slug>.nome/resumo/descricao)
export const DIMENSOES = [
  {
    nome: 'Ambiental',
    slug: 'ambiental',
    icone: ICONE_FOLHA
  },
  {
    nome: 'Social',
    slug: 'social',
    icone: [
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75'
    ]
  },
  {
    nome: 'Económica',
    slug: 'economica',
    icone: [
      'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
      'M18.09 10.37A6 6 0 1 1 10.34 18',
      'M7 6h1v4',
      'm16.71 13.88.7.71-2.82 2.82'
    ]
  }
]

export const NOMES_DIMENSOES = DIMENSOES.map((d) => d.nome)
// usado no path do router: :dimensao(ambiental|social|economica)
export const SLUGS_DIMENSOES = DIMENSOES.map((d) => d.slug).join('|')

export const dimensaoPorNome = (nome) => DIMENSOES.find((d) => d.nome === nome)
export const dimensaoPorSlug = (slug) => DIMENSOES.find((d) => d.slug === slug)
