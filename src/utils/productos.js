import { normalizar } from './formato.js'

export const FILTROS_INICIALES = {
  busqueda: '',
  categoria: '',
  precioMin: '',
  precioMax: '',
  soloStock: false,
  orden: 'relevancia',
}

// Categorías únicas y ordenadas (el filtro se actualiza solo si se agregan productos)
export function categoriasDe(productos) {
  return Array.from(new Set(productos.map((p) => p.categoria))).sort()
}

// Aplica búsqueda, categoría, rango de precio, stock y orden. No modifica el arreglo original.
export function filtrarProductos(productos, filtros) {
  const termino = normalizar(filtros.busqueda.trim())
  const min = filtros.precioMin !== '' ? Number(filtros.precioMin) : null
  const max = filtros.precioMax !== '' ? Number(filtros.precioMax) : null

  const resultado = productos.filter((p) => {
    if (termino && !normalizar(p.nombre).includes(termino)) return false
    if (filtros.categoria && p.categoria !== filtros.categoria) return false
    if (min !== null && p.precio < min) return false
    if (max !== null && p.precio > max) return false
    if (filtros.soloStock && p.stock <= 0) return false
    return true
  })

  switch (filtros.orden) {
    case 'precio-asc': return [...resultado].sort((a, b) => a.precio - b.precio)
    case 'precio-desc': return [...resultado].sort((a, b) => b.precio - a.precio)
    case 'nombre-asc': return [...resultado].sort((a, b) => a.nombre.localeCompare(b.nombre))
    case 'nombre-desc': return [...resultado].sort((a, b) => b.nombre.localeCompare(a.nombre))
    default: return resultado // 'relevancia' = orden original del catálogo
  }
}
