import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStorage } from './useStorage.js'

describe('useStorage', () => {
  it('usa el valor inicial si no hay nada guardado', () => {
    const { result } = renderHook(() => useStorage('clave', [1, 2]))
    expect(result.current[0]).toEqual([1, 2])
  })

  it('lee el valor que ya estaba guardado en localStorage', () => {
    window.localStorage.setItem('clave', JSON.stringify({ a: 1 }))
    const { result } = renderHook(() => useStorage('clave', null))
    expect(result.current[0]).toEqual({ a: 1 })
  })

  it('guarda cada cambio de estado en localStorage (useEffect)', () => {
    const { result } = renderHook(() => useStorage('clave', 0))
    act(() => result.current[1](42))
    expect(result.current[0]).toBe(42)
    expect(JSON.parse(window.localStorage.getItem('clave'))).toBe(42)
  })

  it('con tipo "session" usa sessionStorage y no localStorage', () => {
    const { result } = renderHook(() => useStorage('filtro', 'a', 'session'))
    act(() => result.current[1]('b'))
    expect(window.sessionStorage.getItem('filtro')).toBe('"b"')
    expect(window.localStorage.getItem('filtro')).toBeNull()
  })

  it('si el almacenamiento falla (MOCK), la app sigue funcionando', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('cuota llena') })
    const { result } = renderHook(() => useStorage('clave', 0))
    expect(() => act(() => result.current[1](7))).not.toThrow()
    expect(result.current[0]).toBe(7)
  })

  it('si el JSON guardado está corrupto, vuelve al valor inicial', () => {
    window.localStorage.setItem('clave', '{no es json')
    const { result } = renderHook(() => useStorage('clave', 'por-defecto'))
    expect(result.current[0]).toBe('por-defecto')
  })
})
