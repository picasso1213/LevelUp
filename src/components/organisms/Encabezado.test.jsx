import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Encabezado from './Encabezado.jsx'

function Destino() {
  const { pathname } = useLocation()
  return <p data-testid="destino">{pathname}</p>
}

// El encabezado usa <NavLink>, así que necesita un router (MemoryRouter: uno falso, solo para pruebas)
const dibujar = (props, ruta = '/') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Encabezado cantidadCarrito={0} haySesion={false} onCerrarSesion={vi.fn()} {...props} />
      <Destino />
    </MemoryRouter>,
  )

describe('<Encabezado />', () => {
  it('muestra los enlaces principales de navegación', () => {
    dibujar()
    for (const nombre of ['Inicio', 'Productos', 'Nosotros', 'Blog', 'Contacto']) {
      expect(screen.getByRole('link', { name: nombre })).toBeInTheDocument()
    }
  })

  it('muestra la cantidad del carrito que recibe por props', () => {
    dibujar({ cantidadCarrito: 5 })
    expect(screen.getByRole('link', { name: /Carrito \(5\)/ })).toBeInTheDocument()
  })

  it('sin sesión ofrece "Iniciar sesión"; con sesión, "Mi perfil" y "Cerrar sesión"', () => {
    const { unmount } = dibujar()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument()
    unmount()

    dibujar({ haySesion: true })
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('al hacer clic en un enlace la URL cambia a esa página', async () => {
    const usuario = userEvent.setup()
    dibujar()
    expect(screen.getByTestId('destino')).toHaveTextContent('/')
    await usuario.click(screen.getByRole('link', { name: 'Productos' }))
    expect(screen.getByTestId('destino')).toHaveTextContent('/productos')
  })

  it('NavLink marca como activo solo el enlace de la página actual', () => {
    dibujar({}, '/productos')
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveClass('active')
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveClass('active')
  })

  it('"Cerrar sesión" llama a la función recibida (ESPÍA)', async () => {
    const usuario = userEvent.setup()
    const onCerrarSesion = vi.fn()
    dibujar({ haySesion: true, onCerrarSesion })
    await usuario.click(screen.getByText('Cerrar sesión'))
    expect(onCerrarSesion).toHaveBeenCalledTimes(1)
  })

  it('incluye el botón del menú hamburguesa para pantallas pequeñas (responsivo)', () => {
    dibujar()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
  })
})
