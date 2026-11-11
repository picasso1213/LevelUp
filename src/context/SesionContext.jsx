import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { guardarToken, obtenerToken } from '../services/api.js'
import { login, registrarUsuario } from '../services/auth.js'
import { actualizarMiPerfil, canjearPuntos, obtenerMiPerfil } from '../services/usuarios.js'
import { crearBoleta, listarMisCompras } from '../services/boletas.js'

const SesionContext = createContext(null)

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
        if ([401, 403, 404].includes(e.status)) guardarToken(null)
      })
      .finally(() => {
        if (activo) setCargandoSesion(false)
      })
    return () => {
      activo = false
    }
  }, [])

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
      guardarToken(respuesta.token)
      setUsuarioActual(respuesta.usuario)
      return { ok: true, usuario: respuesta.usuario, referente: respuesta.conReferido }
    } catch (e) {
      return { ok: false, error: e.message, campos: e.campos || {} }
    }
  }, [])

  // Devuelve { ok, usuario? , error? }
  const iniciarSesion = useCallback(async (correo, password) => {
    try {
      const respuesta = await login(correo, password)
      guardarToken(respuesta.token)
      setUsuarioActual(respuesta.usuario)
      return { ok: true, usuario: respuesta.usuario }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }, [])

  const cerrarSesion = useCallback(() => {
    guardarToken(null)
    setUsuarioActual(null)
    setHistorial([])
  }, [])

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
