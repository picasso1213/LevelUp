import { describe, it, expect, vi, afterEach } from 'vitest'
import { AxiosError } from 'axios'
import api, { ApiError, guardarToken, obtenerToken } from './api.js'
import { mensajeDeError } from './errores.js'
import { listarProductos } from './productos.js'

// Se reemplaza el adaptador HTTP de axios: los interceptores y la conversión de errores corren de verdad.
const adaptadorOriginal = api.defaults.adapter
afterEach(() => {
  api.defaults.adapter = adaptadorOriginal
})

const responder = (data, status = 200) =>
  vi.fn(async (config) => {
    const respuesta = { data, status, statusText: '', headers: {}, config, request: {} }
    if (status >= 200 && status < 300) return respuesta
    throw new AxiosError(`status ${status}`, AxiosError.ERR_BAD_RESPONSE, config, {}, respuesta)
  })

describe('services/api (instancia de axios)', () => {
  it('guarda y borra el token en localStorage', () => {
    guardarToken('abc')
    expect(obtenerToken()).toBe('abc')
    guardarToken(null)
    expect(obtenerToken()).toBeNull()
  })

  it('usa la URL base y un timeout', () => {
    expect(api.defaults.baseURL).toMatch(/\/api\/v1$/)
    expect(api.defaults.timeout).toBe(8000)
  })

  it('el interceptor envía el JWT en Authorization y el cuerpo como JSON', async () => {
    const adaptador = responder({ ok: true })
    api.defaults.adapter = adaptador
    guardarToken('mi-token')

    const respuesta = await api.post('/productos', { nombre: 'Mouse' })

    const config = adaptador.mock.calls[0][0]
    expect(config.headers.get('Authorization')).toBe('Bearer mi-token')
    expect(config.headers.get('Content-Type')).toContain('application/json')
    expect(JSON.parse(config.data)).toEqual({ nombre: 'Mouse' })
    expect(respuesta.data).toEqual({ ok: true })
  })

  it('las rutas públicas (autenticada: false) no mandan el token', async () => {
    const adaptador = responder([])
    api.defaults.adapter = adaptador
    guardarToken('mi-token')

    await api.get('/productos', { autenticada: false })

    expect(adaptador.mock.calls[0][0].headers.get('Authorization')).toBeFalsy()
  })

  it('params arma la query string (y omite los valores undefined)', async () => {
    const adaptador = responder([])
    api.defaults.adapter = adaptador

    await listarProductos('Mouses')
    await listarProductos()

    expect(api.getUri(adaptador.mock.calls[0][0])).toMatch(/\/productos\?categoria=Mouses$/)
    expect(api.getUri(adaptador.mock.calls[1][0])).toMatch(/\/productos$/)
  })

  it('una respuesta 204 no trae datos', async () => {
    api.defaults.adapter = responder('', 204)
    const respuesta = await api.delete('/productos/1')
    expect(respuesta.status).toBe(204)
    expect(respuesta.data).toBe('')
  })

  it('un error del servidor se convierte en ApiError con status, mensaje y campos', async () => {
    api.defaults.adapter = responder(
      { status: 409, error: 'Ya existe una cuenta registrada con ese correo.', campos: { correo: 'Ya existe una cuenta registrada con ese correo.' } },
      409,
    )

    const falla = await api.post('/auth/register', {}).catch((e) => e)

    expect(falla).toBeInstanceOf(ApiError)
    expect(falla.status).toBe(409)
    expect(falla.message).toBe('Ya existe una cuenta registrada con ese correo.')
    expect(falla.campos).toEqual({ correo: 'Ya existe una cuenta registrada con ese correo.' })
  })

  it('un error sin cuerpo JSON usa un mensaje genérico con el código HTTP', async () => {
    api.defaults.adapter = responder('<html>', 502)
    const falla = await api.get('/productos').catch((e) => e)
    expect(falla.status).toBe(502)
    expect(falla.message).toContain('502')
  })

  it('si no hay conexión (o se agota el tiempo) lanza ApiError con status 0', async () => {
    api.defaults.adapter = vi.fn().mockRejectedValue(new AxiosError('Network Error', AxiosError.ERR_NETWORK, undefined, {}))
    const falla = await api.get('/productos').catch((e) => e)
    expect(falla).toBeInstanceOf(ApiError)
    expect(falla.status).toBe(0)
    expect(falla.message).toMatch(/No se pudo conectar con el servidor/)
  })
})

describe('services/errores (mensajeDeError)', () => {
  it('cubre los tres tipos de error de axios', () => {
    expect(mensajeDeError({ response: { status: 404, data: { error: 'No existe el producto 9' } } })).toBe('No existe el producto 9')
    expect(mensajeDeError({ response: { status: 500, data: null } })).toContain('500')
    expect(mensajeDeError({ request: {} })).toMatch(/No se pudo conectar/)
    expect(mensajeDeError(new Error('boom'))).toBe('boom')
  })
})
