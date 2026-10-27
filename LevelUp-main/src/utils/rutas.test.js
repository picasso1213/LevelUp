import { describe, it, expect } from 'vitest'
import { rutaDe } from './rutas.js'

describe('rutaDe (nombre de página -> URL)', () => {
  it('páginas simples', () => {
    expect(rutaDe('inicio')).toBe('/')
    expect(rutaDe('carrito')).toBe('/carrito')
    expect(rutaDe('perfil')).toBe('/perfil')
  })

  it('el detalle lleva el id en la ruta', () => {
    expect(rutaDe('detalle', { id: 3 })).toBe('/productos/3')
  })

  it('productos con categoría la manda en la query string, codificada', () => {
    expect(rutaDe('productos')).toBe('/productos')
    expect(rutaDe('productos', { categoria: 'Poleras Personalizadas' })).toBe('/productos?categoria=Poleras%20Personalizadas')
  })

  it('una página desconocida cae en el inicio', () => {
    expect(rutaDe('no-existe')).toBe('/')
  })
})
