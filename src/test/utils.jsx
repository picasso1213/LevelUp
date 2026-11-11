import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { crearApiFalsa } from './apiFalsa.js'

// Usuario de ejemplo con la forma que devuelve la API (más la contraseña, que solo conoce el backend falso)
export const crearUsuario = (cambios = {}) => ({
  id: 1,
  nombre: 'Ana',
  apellidos: 'Pérez',
  run: '123456785',
  correo: 'ana@gmail.com',
  password: '1234',
  fechaNacimiento: '2000-01-01',
  telefono: '',
  region: 'Valparaíso',
  comuna: 'Viña del Mar',
  direccion: 'Calle 1 #123',
  rol: 'CLIENTE',
  esDuoc: false,
  descuento: 0,
  preferencias: [],
  codigoReferido: 'AP1234',
  referidoPor: null,
  puntosLevelUp: 0,
  fechaRegistro: '2026-01-01T00:00:00',
  ...cambios,
})

// Boleta de ejemplo (para el historial de compras y las órdenes)
export const crearBoleta = (cambios = {}) => ({
  id: 1,
  fecha: '2026-02-01T10:00:00',
  usuarioId: 1,
  usuarioNombre: 'Ana Pérez',
  usuarioCorreo: 'ana@gmail.com',
  subtotal: 49990,
  descuento: 0,
  total: 49990,
  puntosGanados: 49,
  detalles: [{ productoId: 5, productoNombre: 'Mouse Logitech G502 HERO', cantidad: 1, precioUnitario: 49990, subtotal: 49990 }],
  ...cambios,
})

// Abre la aplicación completa en una ruta con un backend falso en memoria.
//   datos.usuarios / datos.boletas / datos.productos -> contenido del "servidor"
//   datos.sesion = { correo }                         -> deja el token guardado (usuario ya logueado)
//   datos.carrito / datos.resenas                     -> localStorage (se guardan en el navegador)
// Devuelve lo de render() más `api` (estado del servidor falso y las peticiones hechas).
export function abrirApp(ruta = '/', datos = {}) {
  const api = crearApiFalsa({ usuarios: datos.usuarios, boletas: datos.boletas, productos: datos.productos })
  // Simula un servidor apagado en la primera petición (las siguientes sí responden)
  if (datos.primeraPeticionFalla) api.sinConexion()
  if (datos.sesion) window.localStorage.setItem('levelup_token', `tok:${datos.sesion.correo}`)
  if (datos.carrito !== undefined) window.localStorage.setItem('levelup_carrito', JSON.stringify(datos.carrito))
  if (datos.resenas !== undefined) window.localStorage.setItem('levelup_resenas', JSON.stringify(datos.resenas))
  const resultado = render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
  return { ...resultado, api }
}

// Atajo: usuario con sesión iniciada
export const conSesion = (usuario, extra = {}) => ({ usuarios: [usuario], sesion: { correo: usuario.correo }, ...extra })
