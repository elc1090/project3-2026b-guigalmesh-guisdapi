import { describe, it, expect } from 'vitest'
import { TEMAS } from '../../constants/educacion'
import { TEMAS as TEMAS_PT } from '../conteudo/educacion.pt'

// a tradução é aplicada por posição: se um item for acrescentado só em espanhol, o teste avisa
describe('tradução dos temas da Educación', () => {
  it('tem a mesma forma do original', () => {
    expect(TEMAS_PT).toHaveLength(TEMAS.length)
    TEMAS.forEach((tema, i) => {
      const pt = TEMAS_PT[i]
      expect(pt.titulo, tema.slug).toBeTruthy()
      expect(pt.bloques?.length ?? 0, tema.slug).toBe(tema.bloques?.length ?? 0)
      expect(pt.pasos?.length ?? 0, tema.slug).toBe(tema.pasos?.length ?? 0)
      expect(pt.acciones?.items.length ?? 0, tema.slug).toBe(tema.acciones?.items.length ?? 0)
      tema.bloques?.forEach((b, j) => expect(pt.bloques[j].items?.length ?? 0, `${tema.slug} ${j}`).toBe(b.items?.length ?? 0))
    })
  })
})
