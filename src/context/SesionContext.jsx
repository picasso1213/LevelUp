import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { guardarToken, obtenerToken } from '../services/api.js'
import { login, registrarUsuario, renovarToken } from '../services/auth.js'
import { vencimientoDe } from '../services/jwt.js'
import { actualizarMiPerfil, canjearPuntos, obtenerMiPerfil } from '../services/usuarios.js'
import { crearBoleta, listarMisCompras } from '../services/boletas.js'

const SesionContext = createContext(null)

// El token se renueva 5 minutos antes de que venza; si falla solo la red, se reintenta a los 30 segundos.
const ANTICIPO_RENOVACION_MS = 5 * 60 * 1000
const REINTENTO_MS = 30 * 1000

// Boleta del backend -> pedido con el formato que usan las reseñas: { productos: [{ id, cantidad }], total, fecha }
const aPedido = (boleta) => ({
  productos: boleta.detalles.map((d) => ({ id: d.productoId, cantidad: d.cantidad })),
  total: boleta.total,
  fecha: boleta.fecha,
})

// La sesión vive en el backend: aquí solo se guarda el JWT (localStorage) y el usuario que devuelve la API.
// Las funciones que llaman al servidor son async y devuelven { ok, ... } para que los formularios muestren el error.
export function SesionProvider({ children }) {
  const [usuarioBase, setUsuarioActual] = useState(null)
  const [historial, setHistorial] = useState([]) // compras del usuario (para saber quién puede reseñar)
  // JWT vigente: al cambiar (login, registro, renovación, cierre) se reprograma la renovación automática
  const [token, setToken] = useState(() => obtenerToken())
  const [intento, setIntento] = useState(0) // reintentos de renovación por falla de red
  const fijarToken = useCallback((nuevo) => {
    guardarToken(nuevo)
    setToken(nuevo)
    setIntento(0)
  }, [])
  // true mientras se valida el token guardado: evita mandar a /login al recargar una página protegida
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(obtenerToken()))

  useEffect(() => {
    if (!obtenerToken()) return undefined
    let activo = true
    obtenerMiPerfil()
      .then((usuario) => {
        if (activo) setUsuarioActual(usuario)
      })
      .catch((e) => {
        // token vencido o usuario borrado: se descarta. Si solo falló la red, se conserva para reintentar luego.
        if ([401, 403, 404].includes(e.status)) fijarToken(null)
      })
      .finally(() => {
        if (activo) setCargandoSesion(false)
      })
    return () => {
      activo = false
    }
  }, [fijarToken])

  // Renovación automática: pide un token nuevo (POST /auth/refresh) poco antes de que venza el actual.
  // Si el servidor responde 401/403/404 (vencido o usuario eliminado) se cierra la sesión.
  useEffect(() => {
    const vence = vencimientoDe(token)
    if (!vence) return undefined // sin sesión o token sin "exp": no hay nada que programar
    const espera = intento > 0 ? REINTENTO_MS : Math.max(vence - ANTICIPO_RENOVACION_MS - Date.now(), 0)
    let activo = true
    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await renovarToken()
        if (!activo) return
        guardarToken(respuesta.token)
        setToken(respuesta.token)
        setIntento(0)
        if (respuesta.usuario) setUsuarioActual(respuesta.usuario)
      } catch (e) {
        if (!activo) return
        if ([401, 403, 404].includes(e.status)) {
          fijarToken(null)
          setUsuarioActual(null)
          setHistorial([])
        } else {
          setIntento((n) => n + 1) // falla de red o 5xx: reintenta
        }
      }
    }, espera)
    return () => {
      activo = false
      clearTimeout(temporizador)
    }
  }, [token, intento, fijarToken])

  // Al haber sesión, trae las compras del usuario (GET /boletas/mis-compras)
  const idUsuario = usuarioBase?.id
  useEffect(() => {
    if (!idUsuario) return undefined
    let activo = true
    listarMisCompras()
      .then((boletas) => {
        if (activo) setHistorial(boletas.map(aPedido))
      })
      .catch(() => {}) // sin historial solo se oculta el formulario de reseñas
    return () => {
      activo = false
    }
  }, [idUsuario])

  // Usuario de la sesión + su historial de compras
  const usuarioActual = usuarioBase ? { ...usuarioBase, historialCompras: historial } : null

  // Crea la cuenta en el backend. Devuelve { ok, usuario?, referente?, error?, campos? }
  const registrar = useCallback(async (datos) => {
    try {
      const respuesta = await registrarUsuario(datos)
      fijarToken(respuesta.token)
      setUsuarioActual(respuesta.usuario)
      return { ok: true, usuario: respuesta.usuario, referente: respuesta.conReferido }
    } catch (e) {
      return { ok: false, error: e.message, campos: e.campos || {} }
    }
  }, [fijarToken])

  // Devuelve { ok, usuario? , error? }
  const iniciarSesion = useCallback(async (correo, password) => {
    try {
      const respuesta = await login(correo, password)
      fijarToken(respuesta.token)
      setUsuarioActual(respuesta.usuario)
      return { ok: true, usuario: respuesta.usuario }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }, [fijarToken])

  const cerrarSesion = useCallback(() => {
    fijarToken(null)
    setUsuarioActual(null)
    setHistorial([])
  }, [fijarToken])

  // Guarda los datos de contacto en el backend. Devuelve { ok, error? }
  const actualizarPerfil = useCallback(async (cambios) => {
    try {
      setUsuarioActual(await actualizarMiPerfil(cambios))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }, [])

  // El backend descuenta los puntos. Devuelve el canje o null si no alcanzan los puntos / falla.
  const canjear = useCallback(async (idCanje) => {
    try {
      const respuesta = await canjearPuntos(idCanje)
      setUsuarioActual(respuesta.usuario)
      return respuesta.canje
    } catch {
      return null
    }
  }, [])

  // Crea la boleta (el servidor calcula totales, descuenta stock y suma puntos). Lanza ApiError si falla.
  const registrarCompra = useCallback(async (lineas) => {
    const boleta = await crearBoleta(lineas)
    setUsuarioActual((u) => (u ? { ...u, puntosLevelUp: u.puntosLevelUp + boleta.puntosGanados } : u))
    setHistorial((h) => [aPedido(boleta), ...h])
    return boleta
  }, [])

  const valor = { usuarioActual, cargandoSesion, registrar, iniciarSesion, cerrarSesion, actualizarPerfil, canjear, registrarCompra }
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return ctx
}
