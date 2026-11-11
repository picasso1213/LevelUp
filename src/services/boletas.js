import api from './api.js'

// Compra: POST /boletas con [{ id, cantidad }] (las líneas del carrito). El precio no viaja:
// el servidor lo busca, calcula descuento, total y puntos, y descuenta el stock.
export async function crearBoleta(lineas) {
  const items = lineas.map((l) => ({ productoId: l.id, cantidad: l.cantidad }))
  const respuesta = await api.post('/boletas', { items })
  return respuesta.data
}

export async function listarMisCompras() {
  const respuesta = await api.get('/boletas/mis-compras')
  return respuesta.data
}

// Órdenes de todos los clientes (ADMIN y VENDEDOR)
export async function listarBoletas() {
  const respuesta = await api.get('/boletas')
  return respuesta.data
}

export async function obtenerBoleta(id) {
  const respuesta = await api.get(`/boletas/${id}`)
  return respuesta.data
}
