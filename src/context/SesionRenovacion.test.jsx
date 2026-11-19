import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider, useSesion } from './SesionContext.jsx'
import { crearApiFalsa, crearJwt } from '../test/apiFalsa.js'
import { crearUsuario } from '../test/utils.jsx'

const MIN = 60 * 1000
const CLAVE = 'levelup_token'

function Sonda() {
  const { usuarioActual, cargandoSesion, iniciarSesion, cerrarSesion } = useSesion()
  return (
    <div>
      <p>{cargandoSesion ? 'cargando' : usuarioActual ? `sesion:${usuarioActual.correo}` : 'sin sesion'}</p>
      <button onClick={() => iniciarSesion('ana@gmail.com', '1234')}>entrar</button>
      <button onClick={cerrarSesion}>salir</button>
    </div>
  )
}

const avanzar = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })
// cuenta los intentos de renovación, incluidos los que fallan por red antes de llegar al servidor falso
const refrescos = (api) => api.adaptador.mock.calls.filter(([config]) => config.url === '/auth/refresh').length

// Abre la app con la sesión ya iniciada (token JWT que vence en "venceEnMs") y espera a que cargue el perfil
async function abrir(venceEnMs, extra = {}) {
  const api = crearApiFalsa({ usuarios: [crearUsuario()], ...extra })
  const tokenInicial = crearJwt('ana@gmail.com', venceEnMs)
  window.localStorage.setItem(CLAVE, tokenInicial)
  render(<SesionProvider><Sonda /></SesionProvider>)
  await avanzar(0)
  return { api, tokenInicial }
}

describe('renovación automática del token', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('pide un token nuevo 5 minutos antes de que venza y lo guarda', async () => {
    const { api, tokenInicial } = await abrir(30 * MIN)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()

    await avanzar(24 * MIN)
    expect(refrescos(api)).toBe(0)

    await avanzar(2 * MIN)
    expect(refrescos(api)).toBe(1)
    expect(window.localStorage.getItem(CLAVE)).not.toBe(tokenInicial)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()
  })

  it('sigue renovando mientras la sesión esté abierta', async () => {
    const { api } = await abrir(30 * MIN)
    await avanzar(26 * MIN) // 1.ª renovación: el nuevo token dura 2 h
    await avanzar(2 * 60 * MIN) // pasa la 2.ª
    expect(refrescos(api)).toBe(2)
  })

  it('con un token que ya venció cierra la sesión (el servidor responde 401)', async () => {
    const { api } = await abrir(-MIN)
    await avanzar(1)
    expect(refrescos(api)).toBe(1)
    expect(screen.getByText('sin sesion')).toBeInTheDocument()
    expect(window.localStorage.getItem(CLAVE)).toBeNull()
  })

  it('si falla solo la red, conserva la sesión y reintenta a los 30 segundos', async () => {
    const { api } = await abrir(30 * MIN)
    api.sinConexion()
    await avanzar(26 * MIN)
    expect(refrescos(api)).toBe(1)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()

    await avanzar(29 * 1000)
    expect(refrescos(api)).toBe(1)
    await avanzar(2 * 1000)
    expect(refrescos(api)).toBe(2)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()
  })

  it('al cerrar sesión se cancela la renovación', async () => {
    const { api } = await abrir(30 * MIN)
    await act(async () => { screen.getByText('salir').click() })
    await avanzar(60 * MIN)
    expect(refrescos(api)).toBe(0)
    expect(window.localStorage.getItem(CLAVE)).toBeNull()
  })

  it('al iniciar sesión programa la renovación del token recibido', async () => {
    const api = crearApiFalsa({ usuarios: [crearUsuario()] })
    render(<SesionProvider><Sonda /></SesionProvider>)
    await avanzar(0)
    await act(async () => { screen.getByText('entrar').click() })
    await avanzar(0)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()
    // el servidor falso entrega tokens "tok:correo" (sin vencimiento): no hay renovación que programar
    await avanzar(3 * 60 * MIN)
    expect(refrescos(api)).toBe(0)
  })

  it('un token sin vencimiento legible no se renueva', async () => {
    const api = crearApiFalsa({ usuarios: [crearUsuario()] })
    window.localStorage.setItem(CLAVE, 'tok:ana@gmail.com')
    render(<SesionProvider><Sonda /></SesionProvider>)
    await avanzar(3 * 60 * MIN)
    expect(refrescos(api)).toBe(0)
    expect(screen.getByText('sesion:ana@gmail.com')).toBeInTheDocument()
  })
})
