import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavegacionProvider, useNavegacion } from '../../context/NavegacionContext.jsx'
import TarjetaProducto from './TarjetaProducto.jsx'

const AUDIFONOS = {
  id: 7, nombre: 'Audífonos Pro', categoria: 'Accesorios', precio: 29990, stock: 3,
  imagen: '/images/a.jpg', descripcion: 'Sonido envolvente.',
}

// Muestra la página actual del contexto para poder comprobar a dónde navegó el enlace
function Destino() {
  const { pagina, params } = useNavegacion()
  return <p data-testid="destino">{pagina}:{params.id ?? ''}</p>
}

const dibujar = (props) =>
  render(
    <NavegacionProvider>
      <TarjetaProducto producto={AUDIFONOS} onAgregar={vi.fn()} {...props} />
      <Destino />
    </NavegacionProvider>,
  )

describe('<TarjetaProducto />', () => {
  it('muestra nombre, categoría y precio con formato chileno', () => {
    dibujar()
    expect(screen.getByRole('heading', { name: 'Audífonos Pro' })).toBeInTheDocument()
    expect(screen.getByText('Accesorios')).toBeInTheDocument()
    expect(screen.getByText('$29.990 CLP')).toBeInTheDocument()
  })

  it('el clic avisa hacia arriba con el id del producto (ESPÍA)', async () => {
    const usuario = userEvent.setup()
    const onAgregar = vi.fn()
    dibujar({ onAgregar })

    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(onAgregar).toHaveBeenCalledTimes(1)
    expect(onAgregar).toHaveBeenCalledWith(7)
  })

  it('sin stock el botón queda deshabilitado y no avisa', async () => {
    const usuario = userEvent.setup()
    const onAgregar = vi.fn()
    dibujar({ producto: { ...AUDIFONOS, stock: 0 }, onAgregar })

    const boton = screen.getByRole('button', { name: 'Sin stock' })
    expect(boton).toBeDisabled()
    await usuario.click(boton)
    expect(onAgregar).not.toHaveBeenCalled()
  })

  it('muestra "Sin reseñas aún" o el promedio, según corresponda', () => {
    const { unmount } = dibujar()
    expect(screen.getByText('Sin reseñas aún')).toBeInTheDocument()
    unmount()

    dibujar({ promedio: 4, cantidadResenas: 3 })
    expect(screen.getByRole('img', { name: '4 de 5 estrellas' })).toBeInTheDocument()
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('"Ver detalle" navega a la página de detalle con el id del producto', async () => {
    const usuario = userEvent.setup()
    dibujar()
    expect(screen.getByTestId('destino')).toHaveTextContent('inicio:')

    await usuario.click(screen.getByRole('link', { name: 'Ver detalle' }))

    expect(screen.getByTestId('destino')).toHaveTextContent('detalle:7')
  })
})
