import { createContext, useCallback, useContext, useMemo } from 'react'
import { useStorage } from '../hooks/useStorage.js'
import { CANJES_LEVELUP, PUNTOS_BONUS_REFERIDO_NUEVO, PUNTOS_POR_REFERIDO } from '../data/fidelizacion.js'
import { esCorreoDuoc } from '../utils/validaciones.js'
import { generarCodigoReferido } from '../utils/fidelizacion.js'

const SesionContext = createContext(null)

// Usuarios y sesión persistidos en localStorage (no hay backend)
export function SesionProvider({ children }) {
  const [usuarios, setUsuarios] = useStorage('levelup_usuarios', [])
  const [sesion, setSesion] = useStorage('levelup_sesion', null)

  const usuarioActual = useMemo(
    () => (sesion ? usuarios.find((u) => u.correo === sesion.correo) || null : null),
    [sesion, usuarios],
  )

  // Crea la cuenta (los datos ya vienen validados). Devuelve { ok, error?, usuario?, referente? }
  const registrar = useCallback((datos, codigoReferido = '') => {
    const codigo = codigoReferido.trim().toUpperCase()
    const referente = codigo ? usuarios.find((u) => u.codigoReferido === codigo) : null
    if (codigo && !referente) return { ok: false, error: 'Ese código de referido no existe.' }

    const esDuoc = esCorreoDuoc(datos.correo)
    const nuevo = {
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      run: datos.run.trim().toUpperCase(),
      correo: datos.correo.trim(),
      password: datos.password,
      fechaNacimiento: datos.fechaNacimiento,
      telefono: (datos.telefono || '').trim(),
      region: datos.region,
      comuna: datos.comuna,
      direccion: datos.direccion.trim(),
      esDuoc,
      descuento: esDuoc ? 20 : 0,
      preferencias: [],
      codigoReferido: generarCodigoReferido(datos.nombre.trim(), datos.apellidos.trim()),
      referidoPor: referente ? referente.correo : null,
      referidos: [],
      puntosLevelUp: referente ? PUNTOS_BONUS_REFERIDO_NUEVO : 0,
      canjes: [],
      historialCompras: [],
      fechaRegistro: new Date().toISOString(),
    }

    // Se crea un arreglo nuevo (sin mutar el anterior)
    setUsuarios((actual) => [
      ...actual.map((u) =>
        referente && u.correo === referente.correo
          ? { ...u, puntosLevelUp: u.puntosLevelUp + PUNTOS_POR_REFERIDO, referidos: [...(u.referidos || []), nuevo.correo] }
          : u,
      ),
      nuevo,
    ])
    setSesion({ correo: nuevo.correo })
    return { ok: true, usuario: nuevo, referente }
  }, [usuarios, setUsuarios, setSesion])

  const iniciarSesion = useCallback((correo, password) => {
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password,
    )
    if (!usuario) return false
    setSesion({ correo: usuario.correo })
    return true
  }, [usuarios, setSesion])

  const cerrarSesion = useCallback(() => setSesion(null), [setSesion])

  const actualizarPerfil = useCallback((cambios) => {
    if (!sesion) return
    setUsuarios((actual) => actual.map((u) => (u.correo === sesion.correo ? { ...u, ...cambios } : u)))
  }, [sesion, setUsuarios])

  // Descuenta puntos y registra el canje. Devuelve el canje o null si no alcanzan los puntos.
  const canjear = useCallback((idCanje) => {
    const canje = CANJES_LEVELUP.find((c) => c.id === idCanje)
    if (!canje || !usuarioActual || usuarioActual.puntosLevelUp < canje.costo) return null
    setUsuarios((actual) => actual.map((u) =>
      u.correo === usuarioActual.correo
        ? {
            ...u,
            puntosLevelUp: u.puntosLevelUp - canje.costo,
            canjes: [...(u.canjes || []), { id: canje.id, nombre: canje.nombre, fecha: new Date().toISOString() }],
          }
        : u,
    ))
    return canje
  }, [usuarioActual, setUsuarios])

  // Registra la compra en el historial y suma los puntos ganados
  const registrarCompra = useCallback((lineas, total, puntos) => {
    if (!usuarioActual) return
    setUsuarios((actual) => actual.map((u) =>
      u.correo === usuarioActual.correo
        ? {
            ...u,
            puntosLevelUp: u.puntosLevelUp + puntos,
            historialCompras: [
              ...(u.historialCompras || []),
              { productos: lineas.map((l) => ({ id: l.id, cantidad: l.cantidad })), total, fecha: new Date().toISOString() },
            ],
          }
        : u,
    ))
  }, [usuarioActual, setUsuarios])

  const valor = { usuarios, usuarioActual, registrar, iniciarSesion, cerrarSesion, actualizarPerfil, canjear, registrarCompra }
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return ctx
}
