import { describe, it, expect } from 'vitest'
import { sobrepor, noIdioma } from '../conteudo'
import { i18n } from '../index'

const base = [
  { id: 'a', nombre: 'Playa', icone: ['M1'], consejos: ['uno', 'dos'], url: 'https://x' },
  { id: 'b', nombre: 'Bosque', icone: ['M2'], consejos: [] }
]

describe('sobrepor', () => {
  it('troca só os textos e mantém o resto', () => {
    const r = sobrepor(base, [{ nombre: 'Praia', consejos: ['um', 'dois'] }])
    expect(r[0]).toEqual({ id: 'a', nombre: 'Praia', icone: ['M1'], consejos: ['um', 'dois'], url: 'https://x' })
    expect(r[1]).toBe(base[1]) // sem tradução: o original
  })

  it('não altera o original', () => {
    sobrepor(base, [{ nombre: 'Praia' }])
    expect(base[0].nombre).toBe('Playa')
  })
})

describe('noIdioma', () => {
  it('usa a tradução do idioma atual e o original em espanhol', () => {
    const traducoes = { pt: [{ nombre: 'Praia' }] }
    expect(noIdioma(base, traducoes)[0].nombre).toBe('Playa')
    i18n.global.locale.value = 'pt'
    try {
      expect(noIdioma(base, traducoes)[0].nombre).toBe('Praia')
    } finally {
      i18n.global.locale.value = 'es'
    }
  })
})
