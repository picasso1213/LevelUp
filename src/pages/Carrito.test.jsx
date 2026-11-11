import { describe, it, expect } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearUsuario } from '../test/utils.jsx'

describe('<Carrito />', () => {
  it('sin productos muestra el mensaje de carrito vacío', async () => {
    abrirApp('/carrito')
    expect(await screen.findByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver productos' })).toBeInTheDocument()
  })

  it('mientras llega el catálogo muestra "Cargando…"', () => {
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('con productos muestra las líneas, el subtotal y el total', async () => {
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 2 }] })
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Mouse Logitech G502 HERO')).toBeInTheDocument()
    expect(screen.getByLabelText('Cantidad de Mouse Logitech G502 HERO')).toHaveValue(2)
    // 2 x 49.990 = 99.980
    expect(screen.getAllByText(/99\.980/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Inicia sesión para pagar/)).toBeInTheDocument()
  })

  it('cambiar la cantidad actualiza el subtotal', async () => {
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    const campo = await screen.findByLabelText('Cantidad de Mouse Logitech G502 HERO')
    fireEvent.change(campo, { target: { value: '3' } })
    expect(campo).toHaveValue(3)
    expect(screen.getAllByText(/149\.970/).length).toBeGreaterThanOrEqual(1)
  })

  it('el botón ✕ elimina el producto y avisa', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    await usuario.click(await screen.findByRole('button', { name: 'Eliminar Mouse Logitech G502 HERO del carrito' }))
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByText('Producto eliminado del carrito')).toBeInTheDocument()
  })

  it('"Vaciar carrito" deja el carrito vacío', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }, { id: 6, cantidad: 2 }] })
    await usuario.click(await screen.findByRole('button', { name: 'Vaciar carrito' }))
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByText('Carrito vaciado')).toBeInTheDocument()
  })

  it('pagar sin sesión pide iniciar sesión y no crea ninguna boleta', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    await usuario.click(await screen.findByRole('button', { name: 'Proceder al pago' }))

    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
    expect(api.estado.boletas).toHaveLength(0)
  })

  it('pagar con sesión crea la boleta en el backend, suma puntos y descuenta el stock', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/carrito', { ...conSesion(crearUsuario()), carrito: [{ id: 1, cantidad: 1 }] })
    expect(await screen.findByText(/Ganarás 549 puntos Level-Up/)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Proceder al pago' }))

    expect(await screen.findByText(/Ganaste 549 puntos Level-Up/)).toBeInTheDocument()
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(api.estado.boletas).toHaveLength(1)
    expect(api.estado.peticiones.find((p) => p.ruta === '/boletas' && p.metodo === 'POST').cuerpo)
      .toEqual({ items: [{ productoId: 1, cantidad: 1 }] })
    expect(api.estado.usuarios[0].puntosLevelUp).toBe(549)
    expect(api.estado.productos.find((p) => p.id === 1).stock).toBe(7)
  })

  it('si no hay stock suficiente muestra el error del servidor y conserva el carrito', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/carrito', { ...conSesion(crearUsuario()), carrito: [{ id: 2, cantidad: 3 }] })
    await screen.findByRole('table')
    api.estado.productos.find((p) => p.id === 2).stock = 1 // alguien más compró mientras tanto

    await usuario.click(screen.getByRole('button', { name: 'Proceder al pago' }))

    expect(await screen.findByText(/Stock insuficiente para PC Gamer ASUS ROG Strix/)).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(api.estado.boletas).toHaveLength(0)
  })

  it('un usuario Duoc ve la línea de descuento del 20 %', async () => {
    const duoc = crearUsuario({ correo: 'ana@duoc.cl', esDuoc: true, descuento: 20 })
    abrirApp('/carrito', { ...conSesion(duoc), carrito: [{ id: 5, cantidad: 1 }] })
    expect(await screen.findByText('Descuento Duoc (20%):')).toBeInTheDocument()
  })
})
