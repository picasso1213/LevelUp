import { describe, it, expect } from 'vitest'
import {
  totalUnidades, agregarItem, cambiarCantidad, quitarItem, detalleCarrito, calcularTotales,
} from './carrito.js'

const PRODUCTOS = [
  { id: 1, nombre: 'A', precio: 10000, stock: 5 },
  { id: 2, nombre: 'B', precio: 2500, stock: 3 },
]

describe('carrito (funciones puras)', () => {
  it('agregarItem suma la cantidad si el producto ya estaba', () => {
    const carrito = [{ id: 1, cantidad: 1 }]
    expect(agregarItem(carrito, 1, 2)).toEqual([{ id: 1, cantidad: 3 }])
  })

  it('agregarItem no supera el stock y NO modifica el carrito original', () => {
    const original = [{ id: 1, cantidad: 4 }]
    const nuevo = agregarItem(original, 1, 10, 5)
    expect(nuevo[0].cantidad).toBe(5)
    expect(original[0].cantidad).toBe(4) // inmutabilidad
    expect(nuevo).not.toBe(original)
  })

  it('cambiarCantidad corrige valores inválidos (decimales, cero, sobre el máximo)', () => {
    const carrito = [{ id: 1, cantidad: 2 }]
    expect(cambiarCantidad(carrito, 1, '0')[0].cantidad).toBe(1)
    expect(cambiarCantidad(carrito, 1, '2.9')[0].cantidad).toBe(2)
    expect(cambiarCantidad(carrito, 1, 50, 5)[0].cantidad).toBe(5)
  })

  it('quitarItem y totalUnidades', () => {
    const carrito = [{ id: 1, cantidad: 2 }, { id: 2, cantidad: 3 }]
    expect(totalUnidades(carrito)).toBe(5)
    expect(quitarItem(carrito, 1)).toEqual([{ id: 2, cantidad: 3 }])
  })

  it('detalleCarrito ignora productos que ya no existen', () => {
    const lineas = detalleCarrito([{ id: 1, cantidad: 2 }, { id: 99, cantidad: 1 }], PRODUCTOS)
    expect(lineas).toHaveLength(1)
    expect(lineas[0].subtotal).toBe(20000)
  })

  it('calcularTotales aplica descuento y calcula puntos (1 por cada $1.000)', () => {
    const lineas = detalleCarrito([{ id: 1, cantidad: 2 }, { id: 2, cantidad: 2 }], PRODUCTOS)
    expect(calcularTotales(lineas, 0)).toEqual({ subtotal: 25000, descuento: 0, total: 25000, puntos: 25 })
    expect(calcularTotales(lineas, 20)).toEqual({ subtotal: 25000, descuento: 5000, total: 20000, puntos: 20 })
  })
})
