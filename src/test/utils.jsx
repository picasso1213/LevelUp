import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'

// Usuario de ejemplo con todos los campos que guarda SesionContext.registrar
export const crearUsuario = (cambios = {}) => ({
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
  esDuoc: false,
  descuento: 0,
  preferencias: [],
  codigoReferido: 'AP1234',
  referidoPor: null,
  referidos: [],
  puntosLevelUp: 0,
  canjes: [],
  historialCompras: [],
  fechaRegistro: '2026-01-01T00:00:00.000Z',
  ...cambios,
})

// Abre la aplicación completa en una ruta. "datos" precarga el localStorage
// (usuarios, sesión, carrito y reseñas) antes de montar los proveedores.
export function abrirApp(ruta = '/', datos = {}) {
  const claves = {
    usuarios: 'levelup_usuarios',
    sesion: 'levelup_sesion',
    carrito: 'levelup_carrito',
    resenas: 'levelup_resenas',
  }
  Object.entries(claves).forEach(([campo, clave]) => {
    if (datos[campo] !== undefined) window.localStorage.setItem(clave, JSON.stringify(datos[campo]))
  })
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

// Atajo: usuario con sesión iniciada
export const conSesion = (usuario) => ({ usuarios: [usuario], sesion: { correo: usuario.correo } })
