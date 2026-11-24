import { describe, it, expect } from 'vitest'
import { dataDaEfemeride, proximasEfemerides, dataLocal, paraTextoData, diasEntre } from '../fechasAmbientales'
import { FECHAS_AMBIENTALES, TIPOS_ACTIVIDAD } from '../../constants/huella'
import * as pt from '../../i18n/conteudo/huella.pt'

const texto = (d) => paraTextoData(d)

describe('dataDaEfemeride', () => {
  it('data fixa', () => {
    expect(texto(dataDaEfemeride({ mes: 6, dia: 8 }, 2026))).toBe('2026-06-08')
  })

  it('datas móveis do Calendario Ambiental 2026', () => {
    // segundo sábado de maio, terceiro sábado de setembro, primeiro sábado de novembro
    expect(texto(dataDaEfemeride({ mes: 5, semana: 2, diaSemana: 6 }, 2026))).toBe('2026-05-09')
    expect(texto(dataDaEfemeride({ mes: 9, semana: 3, diaSemana: 6 }, 2026))).toBe('2026-09-19')
    expect(texto(dataDaEfemeride({ mes: 11, semana: 1, diaSemana: 6 }, 2026))).toBe('2026-11-07')
    // primeira segunda-feira de outubro
    expect(texto(dataDaEfemeride({ mes: 10, semana: 1, diaSemana: 1 }, 2026))).toBe('2026-10-05')
  })

  it('último dia da semana do mês', () => {
    // última sexta-feira de setembro de 2026
    expect(texto(dataDaEfemeride({ mes: 9, semana: -1, diaSemana: 5 }, 2026))).toBe('2026-09-25')
  })
})

describe('proximasEfemerides', () => {
  const lista = [
    { mes: 1, dia: 26, nombre: 'A' },
    { mes: 11, dia: 22, nombre: 'Hoje' },
    { mes: 12, dia: 5, nombre: 'B' }
  ]

  it('inclui hoje, ordena e passa para o ano seguinte o que já passou', () => {
    const proximas = proximasEfemerides(lista, new Date(2026, 10, 22))
    expect(proximas.map((e) => e.nombre)).toEqual(['Hoje', 'B', 'A'])
    expect(proximas.map((e) => e.diasFaltando)).toEqual([0, 13, 65])
    expect(texto(proximas[2].data)).toBe('2027-01-26')
  })

  it('respeita a quantidade', () => {
    expect(proximasEfemerides(lista, new Date(2026, 10, 22), 2)).toHaveLength(2)
  })
})

describe('datas sem fuso', () => {
  it('dataLocal não volta um dia', () => {
    const d = dataLocal('2026-06-08')
    expect(d.getDate()).toBe(8)
    expect(texto(d)).toBe('2026-06-08')
    expect(dataLocal('')).toBeNull()
  })

  it('diasEntre', () => {
    expect(diasEntre(new Date(2026, 0, 1), new Date(2026, 0, 31))).toBe(30)
  })
})

describe('constantes', () => {
  it('toda efeméride tem tipo de atividade válido e data possível', () => {
    const tipos = new Set(TIPOS_ACTIVIDAD.map((t) => t.id))
    for (const e of FECHAS_AMBIENTALES) {
      expect(tipos.has(e.tipo), e.nombre).toBe(true)
      expect(dataDaEfemeride(e, 2026).getMonth(), e.nombre).toBe(e.mes - 1)
    }
  })

  it('a tradução em português tem um item para cada tipo e cada data', () => {
    expect(pt.TIPOS_ACTIVIDAD).toHaveLength(TIPOS_ACTIVIDAD.length)
    expect(pt.FECHAS_AMBIENTALES).toHaveLength(FECHAS_AMBIENTALES.length)
    pt.FECHAS_AMBIENTALES.forEach((e) => expect(e.nombre && e.sugerencia).toBeTruthy())
  })
})
