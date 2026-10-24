import { describe, it, expect } from 'vitest'
import { obtenerNivelActual, generarCodigoReferido } from './fidelizacion.js'
import { calcularPromedio, usuarioComproProducto } from './resenas.js'
import { formatearPrecio } from './formato.js'

describe('obtenerNivelActual', () => {
  it('0 puntos es Bronce con 0% de progreso', () => {
    const { actual, siguiente, progreso } = obtenerNivelActual(0)
    expect(actual.nombre).toBe('Bronce')
    expect(siguiente.nombre).toBe('Plata')
    expect(progreso).toBe(0)
  })

  it('calcula el progreso hacia el siguiente nivel', () => {
    const { actual, progreso } = obtenerNivelActual(200) // Plata (100) -> Oro (300)
    expect(actual.nombre).toBe('Plata')
    expect(progreso).toBe(50)
  })

  it('en el nivel máximo el progreso es 100 y no hay siguiente', () => {
    const { actual, siguiente, progreso } = obtenerNivelActual(5000)
    expect(actual.nombre).toBe('Diamante')
    expect(siguiente).toBeNull()
    expect(progreso).toBe(100)
  })
})

describe('otras utilidades', () => {
  it('el código de referido empieza con las iniciales en mayúscula', () => {
    expect(generarCodigoReferido('ana', 'pérez')).toMatch(/^AP[A-Z0-9]{4}$/)
  })

  it('formatearPrecio usa el formato chileno', () => {
    expect(formatearPrecio(1299990)).toBe('$1.299.990 CLP')
  })

  it('calcularPromedio devuelve null sin reseñas y el promedio si las hay', () => {
    const resenas = [{ productoId: 1, calificacion: 5 }, { productoId: 1, calificacion: 4 }]
    expect(calcularPromedio(resenas, 2)).toBeNull()
    expect(calcularPromedio(resenas, 1)).toBe(4.5)
  })

  it('usuarioComproProducto revisa el historial de compras', () => {
    const usuario = { historialCompras: [{ productos: [{ id: 3, cantidad: 1 }] }] }
    expect(usuarioComproProducto(usuario, 3)).toBe(true)
    expect(usuarioComproProducto(usuario, 4)).toBe(false)
    expect(usuarioComproProducto(null, 3)).toBe(false)
  })
})
