import { describe, it, expect } from 'vitest'
import { emailValido, forcaSenha } from '../validacao'

describe('emailValido', () => {
  it('aceita e-mails comuns e ignora espaços nas pontas', () => {
    expect(emailValido('ana@empresa.com')).toBe(true)
    expect(emailValido('  ana@empresa.com ')).toBe(true)
  })

  it('recusa formatos inválidos', () => {
    expect(emailValido('ana@empresa')).toBe(false)
    expect(emailValido('ana empresa@x.com')).toBe(false)
    expect(emailValido('')).toBe(false)
  })
})

describe('forcaSenha', () => {
  it('0 para vazia e 1 abaixo do mínimo', () => {
    expect(forcaSenha('')).toBe(0)
    expect(forcaSenha('abc')).toBe(1)
  })

  it('sobe com tamanho e variedade de caracteres', () => {
    expect(forcaSenha('abcdef')).toBe(1)
    expect(forcaSenha('abcdefghij')).toBe(2)
    expect(forcaSenha('abc123!@#xyz')).toBe(3)
  })
})
