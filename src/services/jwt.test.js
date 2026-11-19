import { describe, expect, it } from 'vitest'
import { leerPayload, vencimientoDe } from './jwt.js'

const base64url = (obj) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const jwt = (payload) => `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.firma`

describe('jwt', () => {
  it('lee el payload de un token válido', () => {
    expect(leerPayload(jwt({ sub: 'ana@gmail.com', exp: 123 }))).toEqual({ sub: 'ana@gmail.com', exp: 123 })
  })

  it('lee caracteres con tilde y base64url sin relleno', () => {
    expect(leerPayload(jwt({ nombre: 'Matías ñandú ??>>' })).nombre).toBe('Matías ñandú ??>>')
  })

  it('devuelve el vencimiento en milisegundos', () => {
    expect(vencimientoDe(jwt({ exp: 1800000000 }))).toBe(1800000000 * 1000)
  })

  it('devuelve null si no es un JWT o no trae exp', () => {
    expect(vencimientoDe(null)).toBeNull()
    expect(vencimientoDe(undefined)).toBeNull()
    expect(vencimientoDe('tok:ana@gmail.com')).toBeNull()
    expect(vencimientoDe('a.b.c')).toBeNull()
    expect(vencimientoDe(jwt({ sub: 'ana' }))).toBeNull()
    expect(vencimientoDe(jwt({ exp: 'mañana' }))).toBeNull()
    expect(leerPayload(`x.${base64url(['no', 'objeto'])}.y`)).toEqual(['no', 'objeto'])
  })
})
