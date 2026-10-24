import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Encabezado from './Encabezado.jsx'

// React Bootstrap dibuja los enlaces del menú con role="button" (href="#"), por eso se buscan como "button"
const dibujar = (props) =>
  render(
    <Encabezado
      cantidadCarrito={0}
      haySesion={false}
      paginaActual="inicio"
      onNavegar={vi.fn()}
      onCerrarSesion={vi.fn()}
      {...props}
    />,
  )

describe('<Encabezado />', () => {
  it('muestra los enlaces principales de navegación', () => {
    dibujar()
    for (const nombre of ['Inicio', 'Productos', 'Nosotros', 'Blog', 'Contacto']) {
      expect(screen.getByRole('button', { name: nombre })).toBeInTheDocument()
    }
  })

  it('muestra la cantidad del carrito que recibe por props', () => {
    dibujar({ cantidadCarrito: 5 })
    expect(screen.getByRole('button', { name: /Carrito \(5\)/ })).toBeInTheDocument()
  })

  it('sin sesión ofrece "Iniciar sesión"; con sesión, "Mi perfil" y "Cerrar sesión"', () => {
    const { unmount } = dibujar()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument()
    unmount()

    dibujar({ haySesion: true })
    expect(screen.getByRole('button', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('al hacer clic en un enlace avisa hacia arriba la página elegida (ESPÍA)', async () => {
    const usuario = userEvent.setup()
    const onNavegar = vi.fn()
    dibujar({ onNavegar })
    await usuario.click(screen.getByRole('button', { name: 'Productos' }))
    expect(onNavegar).toHaveBeenCalledWith('productos')
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
