import { vi } from 'vitest'
import { AxiosError } from 'axios'
import api from '../services/api.js'
import { PRODUCTOS } from '../data/productos.js'

// Backend falso en memoria para las pruebas: reemplaza el adaptador HTTP de axios y responde con las mismas rutas,
// formatos y mensajes de error que la API real (Spring Boot). Así los tests no necesitan servidor.

const CANJES = {
  cupon5: { id: 'cupon5', nombre: 'Cupón 5% de descuento', costo: 100 },
  cupon10: { id: 'cupon10', nombre: 'Cupón 10% de descuento', costo: 250 },
  mouse: { id: 'mouse', nombre: 'Mouse Logitech G502 HERO gratis', costo: 400 },
  polera: { id: 'polera', nombre: 'Polera Personalizada Level-Up gratis', costo: 600 },
}

const CATEGORIAS = [...new Set(PRODUCTOS.map((p) => p.categoria))]

// Catálogo con la forma de ProductoDto (incluye categoriaId)
export const productosApi = () =>
  PRODUCTOS.map((p) => ({ ...p, categoriaId: CATEGORIAS.indexOf(p.categoria) + 1 }))

const json = (cuerpo, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })
const error = (status, mensaje, campos) => json({ status, error: mensaje, ...(campos ? { campos } : {}) }, status)

// UsuarioDto: el hash/contraseña nunca sale del servidor
const dto = (u, estado) => {
  const { password, ...resto } = u // eslint-disable-line no-unused-vars
  return { ...resto, cantidadReferidos: estado.usuarios.filter((x) => x.referidoPor === u.correo).length }
}

// Crea el estado en memoria y la función que atiende cada petición.
export function crearApiFalsa({ productos = productosApi(), usuarios = [], boletas = [] } = {}) {
  const estado = { productos, usuarios, boletas, peticiones: [] }

  const usuarioDe = (token) => {
    const correo = token?.replace('tok:', '')
    return estado.usuarios.find((u) => u.correo.toLowerCase() === correo?.toLowerCase())
  }

  async function atender(url, opciones = {}) {
    const ruta = new URL(url).pathname.replace(/^\/api\/v1/, '')
    const metodo = opciones.method || 'GET'
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined
    const token = opciones.headers?.Authorization?.replace('Bearer ', '')
    const yo = usuarioDe(token)
    estado.peticiones.push({ metodo, ruta, cuerpo })

    const exigirSesion = () => (yo ? null : error(401, 'Debes iniciar sesión.'))
    const exigirRol = (...roles) => exigirSesion() || (roles.includes(yo.rol) ? null : error(403, 'No tienes permiso para realizar esta acción.'))

    // --- Catálogo (público) ---
    if (metodo === 'GET' && ruta === '/productos') return json(estado.productos)
    if (metodo === 'GET' && ruta === '/categorias') return json(CATEGORIAS.map((nombre, i) => ({ id: i + 1, nombre })))
    let m = ruta.match(/^\/productos\/(\d+)$/)
    if (m) {
      const p = estado.productos.find((x) => x.id === Number(m[1]))
      if (metodo === 'GET') return p ? json(p) : error(404, `No existe el producto ${m[1]}`)
      const prohibido = exigirRol('ADMIN')
      if (prohibido) return prohibido
      if (metodo === 'PUT') {
        Object.assign(p, cuerpo, { categoria: CATEGORIAS[cuerpo.categoriaId - 1] })
        return json(p)
      }
      if (metodo === 'DELETE') {
        estado.productos = estado.productos.filter((x) => x.id !== p.id)
        return new Response(null, { status: 204 })
      }
    }
    if (metodo === 'POST' && ruta === '/productos') {
      const prohibido = exigirRol('ADMIN')
      if (prohibido) return prohibido
      const nuevo = { id: Math.max(0, ...estado.productos.map((p) => p.id)) + 1, ...cuerpo, categoria: CATEGORIAS[cuerpo.categoriaId - 1] }
      estado.productos.push(nuevo)
      return json(nuevo, 201)
    }

    // --- Autenticación ---
    if (metodo === 'POST' && ruta === '/auth/login') {
      const u = estado.usuarios.find((x) => x.correo.toLowerCase() === cuerpo.correo.toLowerCase())
      if (!u || u.password !== cuerpo.password) return error(401, 'Correo o contraseña incorrectos.')
      return json({ token: `tok:${u.correo}`, usuario: dto(u, estado), conReferido: false })
    }
    if (metodo === 'POST' && ruta === '/auth/register') {
      if (estado.usuarios.some((u) => u.correo.toLowerCase() === cuerpo.correo.toLowerCase())) {
        return error(409, 'Ya existe una cuenta registrada con ese correo.', { correo: 'Ya existe una cuenta registrada con ese correo.' })
      }
      const codigo = (cuerpo.codigoReferido || '').toUpperCase()
      const referente = codigo ? estado.usuarios.find((u) => u.codigoReferido === codigo) : null
      if (codigo && !referente) return error(400, 'Hay datos inválidos en la petición.', { codigoReferido: 'Ese código de referido no existe.' })
      const esDuoc = /@(profesor\.)?duoc\.cl$/i.test(cuerpo.correo)
      const { password, codigoReferido, ...datos } = cuerpo // eslint-disable-line no-unused-vars
      const nuevo = {
        id: estado.usuarios.length + 1, ...datos, password, rol: 'CLIENTE', esDuoc, descuento: esDuoc ? 20 : 0,
        preferencias: [], codigoReferido: `NU${String(estado.usuarios.length + 1).padStart(4, '0')}`,
        referidoPor: referente ? referente.correo : null, puntosLevelUp: referente ? 20 : 0, fechaRegistro: '2026-11-10T12:00:00',
      }
      if (referente) referente.puntosLevelUp += 50
      estado.usuarios.push(nuevo)
      return json({ token: `tok:${nuevo.correo}`, usuario: dto(nuevo, estado), conReferido: Boolean(referente) }, 201)
    }

    // --- Perfil ---
    if (ruta === '/usuarios/me') {
      const sinSesion = exigirSesion()
      if (sinSesion) return sinSesion
      if (metodo === 'PUT') Object.assign(yo, cuerpo)
      return json(dto(yo, estado))
    }
    if (metodo === 'POST' && ruta === '/usuarios/me/canjes') {
      const sinSesion = exigirSesion()
      if (sinSesion) return sinSesion
      const canje = CANJES[cuerpo.idCanje]
      if (!canje) return error(404, 'No existe ese canje.')
      if (yo.puntosLevelUp < canje.costo) return error(400, 'No tienes puntos suficientes para este canje.')
      yo.puntosLevelUp -= canje.costo
      return json({ canje, usuario: dto(yo, estado) })
    }

    // --- Administración de usuarios ---
    if (metodo === 'GET' && ruta === '/usuarios') {
      const prohibido = exigirRol('ADMIN')
      return prohibido || json(estado.usuarios.map((u) => dto(u, estado)))
    }
    m = ruta.match(/^\/usuarios\/(\d+)\/rol$/)
    if (metodo === 'PUT' && m) {
      const prohibido = exigirRol('ADMIN')
      if (prohibido) return prohibido
      const objetivo = estado.usuarios.find((u) => u.id === Number(m[1]))
      objetivo.rol = cuerpo.rol
      return json(dto(objetivo, estado))
    }

    // --- Boletas ---
    if (metodo === 'POST' && ruta === '/boletas') {
      const sinSesion = exigirSesion()
      if (sinSesion) return sinSesion
      const detalles = []
      for (const item of cuerpo.items) {
        const p = estado.productos.find((x) => x.id === item.productoId)
        if (!p) return error(404, `No existe el producto ${item.productoId}`)
        if (p.stock < item.cantidad) return error(409, `Stock insuficiente para ${p.nombre} (disponible: ${p.stock}).`)
        detalles.push({ productoId: p.id, productoNombre: p.nombre, cantidad: item.cantidad, precioUnitario: p.precio, subtotal: p.precio * item.cantidad })
      }
      detalles.forEach((d) => { estado.productos.find((p) => p.id === d.productoId).stock -= d.cantidad })
      const subtotal = detalles.reduce((s, d) => s + d.subtotal, 0)
      const descuento = Math.floor((subtotal * yo.descuento + 50) / 100)
      const total = subtotal - descuento
      const boleta = {
        id: estado.boletas.length + 1, fecha: '2026-11-10T12:00:00', usuarioId: yo.id, usuarioNombre: `${yo.nombre} ${yo.apellidos}`,
        usuarioCorreo: yo.correo, subtotal, descuento, total, puntosGanados: Math.floor(total / 1000), detalles,
      }
      yo.puntosLevelUp += boleta.puntosGanados
      estado.boletas.push(boleta)
      return json(boleta, 201)
    }
    if (metodo === 'GET' && ruta === '/boletas/mis-compras') {
      const sinSesion = exigirSesion()
      return sinSesion || json(estado.boletas.filter((b) => b.usuarioCorreo === yo.correo).reverse())
    }
    if (metodo === 'GET' && ruta === '/boletas') {
      const prohibido = exigirRol('ADMIN', 'VENDEDOR')
      return prohibido || json([...estado.boletas].reverse())
    }

    return error(404, `Ruta no simulada: ${metodo} ${ruta}`)
  }

  // Adaptador de axios: recibe la petición ya armada (baseURL, params, JWT del interceptor), la atiende con
  // el backend falso y responde como lo haría axios (rechaza con AxiosError si el status no es 2xx).
  const adaptador = vi.fn(async (config) => {
    const respuesta = await atender(api.getUri(config), {
      method: config.method.toUpperCase(),
      body: config.data,
      headers: { Authorization: config.headers.get('Authorization') },
    })
    const texto = await respuesta.text()
    const resultado = {
      data: texto ? JSON.parse(texto) : '',
      status: respuesta.status,
      statusText: '',
      headers: {},
      config,
      request: {},
    }
    if (respuesta.status >= 200 && respuesta.status < 300) return resultado
    throw new AxiosError(`Request failed with status code ${respuesta.status}`, AxiosError.ERR_BAD_REQUEST, config, {}, resultado)
  })
  const adaptadorOriginal = api.defaults.adapter
  api.defaults.adapter = adaptador
  restaurarAdaptador = () => { api.defaults.adapter = adaptadorOriginal }
  return { estado, adaptador, sinConexion: () => adaptador.mockRejectedValueOnce(new AxiosError('Network Error', AxiosError.ERR_NETWORK, undefined, {})) }
}

// setup.js la llama después de cada prueba para devolver a axios su adaptador real
let restaurarAdaptador = () => {}
export const quitarApiFalsa = () => restaurarAdaptador()
