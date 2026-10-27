import { describe, it, expect } from 'vitest'
import { PRODUCTOS } from '../data/productos.js'
import { FILTROS_INICIALES, categoriasDe, filtrarProductos } from './productos.js'

const con = (cambios) => ({ ...FILTROS_INICIALES, ...cambios })

describe('filtrarProductos', () => {
  it('sin filtros devuelve todo el catálogo en su orden original', () => {
    expect(filtrarProductos(PRODUCTOS, FILTROS_INICIALES)).toEqual(PRODUCTOS)
  })

  it('busca por nombre ignorando mayúsculas y tildes', () => {
    const r = filtrarProductos(PRODUCTOS, con({ busqueda: 'playstation' }))
    expect(r.map((p) => p.id)).toEqual([1])
    expect(filtrarProductos(PRODUCTOS, con({ busqueda: 'SILLA' }))).toHaveLength(1)
  })

  it('filtra por categoría y por rango de precio', () => {
    expect(filtrarProductos(PRODUCTOS, con({ categoria: 'Mouse' }))).toHaveLength(1)
    const baratos = filtrarProductos(PRODUCTOS, con({ precioMax: '60000' }))
    expect(baratos.every((p) => p.precio <= 60000)).toBe(true)
    const medios = filtrarProductos(PRODUCTOS, con({ precioMin: '50000', precioMax: '350000' }))
    expect(medios.map((p) => p.id)).toEqual([3, 4])
  })

  it('"solo con stock" descarta productos agotados', () => {
    const lista = [...PRODUCTOS, { id: 7, nombre: 'Agotado', categoria: 'X', precio: 1, stock: 0 }]
    expect(filtrarProductos(lista, con({ soloStock: true }))).toHaveLength(PRODUCTOS.length)
  })

  it('ordena por precio sin mutar el arreglo original', () => {
    const copia = [...PRODUCTOS]
    const asc = filtrarProductos(PRODUCTOS, con({ orden: 'precio-asc' }))
    expect(asc[0].precio).toBe(14990)
    expect(filtrarProductos(PRODUCTOS, con({ orden: 'precio-desc' }))[0].precio).toBe(1299990)
    expect(PRODUCTOS).toEqual(copia)
  })
})

describe('categoriasDe', () => {
  it('devuelve categorías únicas y ordenadas', () => {
    const cats = categoriasDe(PRODUCTOS)
    expect(cats).toHaveLength(6)
    expect(cats).toEqual([...cats].sort())
  })
})
