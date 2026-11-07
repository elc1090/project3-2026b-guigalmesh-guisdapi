// Cores dos níveis de maturidade (iguais aos nomes devolvidos pelo back-end em services/calculo.py)
// e das prioridades das recomendações. Usar em todas as telas para o mesmo nível ter a mesma cor.
const NEUTRO_SELO = 'bg-slate-100 text-slate-700'
const NEUTRO_ICONE = 'bg-slate-100 text-slate-700'

const SELO_NIVEL = {
  Inicial: 'bg-red-100 text-red-800',
  Básico: 'bg-amber-100 text-amber-800',
  Intermedio: 'bg-sky-100 text-sky-800',
  Avanzado: 'bg-emerald-100 text-emerald-800'
}

const ICONE_NIVEL = {
  Inicial: 'bg-red-100 text-red-700',
  Básico: 'bg-amber-100 text-amber-700',
  Intermedio: 'bg-sky-100 text-sky-700',
  Avanzado: 'bg-emerald-100 text-emerald-700'
}

const SELO_PRIORIDADE = {
  Alta: 'bg-red-100 text-red-800 border-red-200',
  Media: 'bg-amber-100 text-amber-800 border-amber-200',
  Baja: 'bg-sky-100 text-sky-800 border-sky-200'
}

export const classeSeloNivel = (nivel) => SELO_NIVEL[nivel] ?? NEUTRO_SELO
export const classeIconeNivel = (nivel) => ICONE_NIVEL[nivel] ?? NEUTRO_ICONE
export const classePrioridade = (prioridade) => SELO_PRIORIDADE[prioridade] ?? 'bg-slate-100 text-slate-700 border-slate-200'
