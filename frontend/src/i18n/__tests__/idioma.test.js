import { describe, it, expect } from 'vitest'
import { idiomaInicial } from '../idioma'

describe('idiomaInicial', () => {
  it('usa a escolha salva', () => {
    expect(idiomaInicial('pt', 'es-CL')).toBe('pt')
    expect(idiomaInicial('es', 'pt-BR')).toBe('es')
  })

  it('sem escolha salva, segue o navegador', () => {
    expect(idiomaInicial(null, 'pt-BR')).toBe('pt')
    expect(idiomaInicial(null, 'es-CL')).toBe('es')
  })

  it('valor salvo inválido ou navegador desconhecido cai no espanhol', () => {
    expect(idiomaInicial('fr', 'en-US')).toBe('es')
    expect(idiomaInicial(undefined, undefined)).toBe('es')
  })
})
