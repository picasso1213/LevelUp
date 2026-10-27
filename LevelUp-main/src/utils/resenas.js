export function resenasDeProducto(resenas, idProducto) {
  return resenas.filter((r) => r.productoId === idProducto)
}

// Promedio de calificaciones o null si no hay reseñas
export function calcularPromedio(resenas, idProducto) {
  const lista = resenasDeProducto(resenas, idProducto)
  if (lista.length === 0) return null
  return lista.reduce((suma, r) => suma + r.calificacion, 0) / lista.length
}

// ¿El usuario tiene en su historial al menos una unidad del producto?
export function usuarioComproProducto(usuario, idProducto) {
  if (!usuario || !usuario.historialCompras) return false
  return usuario.historialCompras.some((pedido) => pedido.productos.some((p) => p.id === idProducto))
}
