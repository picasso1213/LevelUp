import { describe, it, expect } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearUsuario } from '../test/utils.jsx'

describe('<Carrito />', () => {
  it('sin productos muestra el mensaje de carrito vacío', () => {
    abrirApp('/carrito')
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver productos' })).toBeInTheDocument()
  })

  it('con productos muestra las líneas, el subtotal y el total', () => {
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 2 }] })
    const tabla = screen.getByRole('table')
    expect(within(tabla).getByText('Mouse Logitech G502 HERO')).toBeInTheDocument()
    expect(screen.getByLabelText('Cantidad de Mouse Logitech G502 HERO')).toHaveValue(2)
    // 2 x 49.990 = 99.980
    expect(screen.getAllByText(/99\.980/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Inicia sesión para ganar puntos/)).toBeInTheDocument()
  })

  it('cambiar la cantidad actualiza el subtotal', () => {
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    const campo = screen.getByLabelText('Cantidad de Mouse Logitech G502 HERO')
    fireEvent.change(campo, { target: { value: '3' } })
    expect(campo).toHaveValue(3)
    expect(screen.getAllByText(/149\.970/).length).toBeGreaterThanOrEqual(1)
  })

  it('el botón ✕ elimina el producto y avisa', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    await usuario.click(screen.getByRole('button', { name: 'Eliminar Mouse Logitech G502 HERO del carrito' }))
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByText('Producto eliminado del carrito')).toBeInTheDocument()
  })

  it('"Vaciar carrito" deja el carrito vacío', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }, { id: 6, cantidad: 2 }] })
    await usuario.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
    expect(screen.getByText('Carrito vaciado')).toBeInTheDocument()
  })

  it('pagar sin sesión agradece y vacía el carrito, sin puntos', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { carrito: [{ id: 5, cantidad: 1 }] })
    await usuario.click(screen.getByRole('button', { name: 'Proceder al pago' }))
    expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument()
    expect(screen.getByText('Tu carrito está vacío por ahora.')).toBeInTheDocument()
  })

  it('pagar con sesión suma puntos y guarda la compra en el historial', async () => {
    const usuario = userEvent.setup()
    abrirApp('/carrito', { ...conSesion(crearUsuario()), carrito: [{ id: 1, cantidad: 1 }] })
    expect(screen.getByText(/Ganarás 549 puntos Level-Up/)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Proceder al pago' }))

    expect(screen.getByText(/Ganaste 549 puntos Level-Up/)).toBeInTheDocument()
    const guardados = JSON.parse(window.localStorage.getItem('levelup_usuarios'))
    expect(guardados[0].puntosLevelUp).toBe(549)
    expect(guardados[0].historialCompras).toHaveLength(1)
  })

  it('un usuario Duoc ve la línea de descuento del 20 %', () => {
    const duoc = crearUsuario({ correo: 'ana@duoc.cl', esDuoc: true, descuento: 20 })
    abrirApp('/carrito', { ...conSesion(duoc), carrito: [{ id: 5, cantidad: 1 }] })
    expect(screen.getByText('Descuento Duoc (20%):')).toBeInTheDocument()
  })
})
