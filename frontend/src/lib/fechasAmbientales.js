// Cálculo das datas ambientais (fixas e móveis) e utilidades de datas "AAAA-MM-DD" sem fuso horário.

const DIA_MS = 24 * 60 * 60 * 1000

// "2026-06-08" -> Date local à meia-noite. new Date("2026-06-08") seria meia-noite em UTC,
// que no Chile e no Brasil cai no dia anterior.
export function dataLocal(texto) {
  const [ano, mes, dia] = String(texto ?? '').split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}

// Date -> "2026-06-08" (no fuso local)
export function paraTextoData(data) {
  const p = (n) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`
}

export const hojeLocal = () => {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

// dias inteiros de "de" até "ate" (as duas à meia-noite local)
export const diasEntre = (de, ate) => Math.round((ate - de) / DIA_MS)

// data de uma efeméride num ano: { mes, dia } ou { mes, semana (1-4 ou -1 = último), diaSemana (0-6) }
export function dataDaEfemeride(efemeride, ano) {
  const mes = efemeride.mes - 1
  if (efemeride.dia) return new Date(ano, mes, efemeride.dia)

  if (efemeride.semana === -1) {
    const ultimo = new Date(ano, mes + 1, 0)
    const recuo = (ultimo.getDay() - efemeride.diaSemana + 7) % 7
    return new Date(ano, mes, ultimo.getDate() - recuo)
  }
  const primeiro = new Date(ano, mes, 1)
  const avanco = (efemeride.diaSemana - primeiro.getDay() + 7) % 7
  return new Date(ano, mes, 1 + avanco + (efemeride.semana - 1) * 7)
}

// próximas efemérides a partir de hoje (inclusive), em ordem, com a data e os dias que faltam
export function proximasEfemerides(lista, hoje = hojeLocal(), quantidade = Infinity) {
  const ano = hoje.getFullYear()
  return lista
    .map((efemeride) => {
      let data = dataDaEfemeride(efemeride, ano)
      if (data < hoje) data = dataDaEfemeride(efemeride, ano + 1)
      return { ...efemeride, data, diasFaltando: diasEntre(hoje, data) }
    })
    .sort((a, b) => a.data - b.data)
    .slice(0, quantidade)
}

// todas as efemérides de um ano, em ordem de data
export function efemeridesDoAno(lista, ano) {
  return lista
    .map((efemeride) => ({ ...efemeride, data: dataDaEfemeride(efemeride, ano) }))
    .sort((a, b) => a.data - b.data)
}
