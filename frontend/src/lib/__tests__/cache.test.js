import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { sessao } from '../sessao'
import { criarRecurso, limparTodoCache } from '../cache'

const logar = (id) => { sessao.value = { user: { id }, access_token: `tok-${id}` } }

describe('criarRecurso (stale-while-revalidate)', () => {
  beforeEach(() => {
    localStorage.clear()
    logar('u1')
  })

  it('busca na primeira vez e depois serve do cache sem nova requisição', async () => {
    const buscar = vi.fn().mockResolvedValue({ n: 1 })
    const r = criarRecurso({ chave: 't1', buscar })

    expect(r.carregando.value).toBe(true)
    expect(await r.carregar()).toEqual({ n: 1 })
    expect(r.carregando.value).toBe(false)

    await r.carregar()
    expect(buscar).toHaveBeenCalledTimes(1)
  })

  it('chamadas simultâneas compartilham a mesma requisição', async () => {
    const buscar = vi.fn().mockResolvedValue('x')
    const r = criarRecurso({ chave: 't2', buscar })
    await Promise.all([r.carregar(), r.carregar(), r.carregar()])
    expect(buscar).toHaveBeenCalledTimes(1)
  })

  it('dado velho volta na hora e é revalidado em segundo plano', async () => {
    const buscar = vi.fn().mockResolvedValueOnce('velho').mockResolvedValueOnce('novo')
    const r = criarRecurso({ chave: 't3', buscar, ttl: 1000 })
    const agora = Date.now()
    const relogio = vi.spyOn(Date, 'now').mockReturnValue(agora)
    try {
      await r.carregar()

      relogio.mockReturnValue(agora + 2000) // passa do ttl (sem depender do relógio real)
      expect(await r.carregar()).toBe('velho')
      await vi.waitFor(() => expect(r.dado.value).toBe('novo'))
    } finally {
      relogio.mockRestore()
    }
  })

  it('persiste por usuário e não mostra o cache de outro usuário', async () => {
    const r = criarRecurso({ chave: 't4', buscar: vi.fn().mockResolvedValue('do-u1') })
    await r.carregar()
    expect(localStorage.getItem('cache:u1:t4')).toContain('do-u1')

    logar('u2')
    await nextTick()
    expect(r.dado.value).toBeUndefined()
  })

  it('limparTodoCache apaga memória e localStorage', async () => {
    const r = criarRecurso({ chave: 't5', buscar: vi.fn().mockResolvedValue(1) })
    await r.carregar()
    limparTodoCache()
    expect(r.dado.value).toBeUndefined()
    expect(Object.keys(localStorage).some((k) => k.startsWith('cache:'))).toBe(false)
  })
})
