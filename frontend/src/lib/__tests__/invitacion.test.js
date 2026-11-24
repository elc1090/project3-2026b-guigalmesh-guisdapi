import { describe, it, expect } from 'vitest'
import { textoInvitacion } from '../invitacion'
import { i18n } from '../../i18n'

describe('textoInvitacion', () => {
  it('monta o convite com nome, data local, lugar e o que levar', () => {
    const texto = textoInvitacion(
      { tipo: 'limpieza_playa', titulo: 'Limpieza de playa', fecha: '2026-06-08', lugar: 'Playa La Herradura', notas: 'Nos juntamos a las 9:00.' },
      'Panadería El Trigal'
    )
    expect(texto).toContain('En Panadería El Trigal')
    expect(texto).toContain('*Limpieza de playa*')
    expect(texto).toContain('8 de junio de 2026') // não volta um dia por causa do fuso
    expect(texto).toContain('Playa La Herradura')
    expect(texto).toContain('Qué llevar: guantes')
    expect(texto).toContain('Nos juntamos a las 9:00.')
  })

  it('em português, quando o idioma escolhido é pt', () => {
    i18n.global.locale.value = 'pt'
    try {
      const texto = textoInvitacion({ tipo: 'otra', titulo: 'Ação', fecha: '2026-06-08' }, 'Padaria')
      expect(texto).toContain('Olá, equipe!')
      expect(texto).toContain('Na Padaria')
      expect(texto).toContain('8 de junho de 2026')
      expect(texto).toContain('Local a confirmar')
    } finally {
      i18n.global.locale.value = 'es'
    }
  })

  it('sem lugar e sem empresa', () => {
    const texto = textoInvitacion({ tipo: 'otra', titulo: 'Acción', fecha: '2026-01-02' })
    expect(texto).toContain('Lugar por confirmar')
    expect(texto).not.toContain('Qué llevar')
  })
})
