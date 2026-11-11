import api from './api.js'

// Capa de servicios: el único archivo que sabe que los productos viven en /productos.
// axios entrega la respuesta completa (status, headers, data…); cada función devuelve solo respuesta.data.

// Catálogo (público): GET /productos  ·  GET /productos?categoria=Mouses
export async function listarProductos(categoria) {
  const respuesta = await api.get('/productos', { params: { categoria: categoria || undefined }, autenticada: false })
  return respuesta.data
}

export async function obtenerProducto(id) {
  const respuesta = await api.get(`/productos/${id}`, { autenticada: false })
  return respuesta.data
}

export async function listarCategorias() {
  const respuesta = await api.get('/categorias', { autenticada: false })
  return respuesta.data
}

// Gestión (solo ADMIN): el backend rechaza con 403 a cualquier otro rol
export async function crearProducto(datos) {
  const respuesta = await api.post('/productos', datos)
  return respuesta.data
}

export async function actualizarProducto(id, datos) {
  const respuesta = await api.put(`/productos/${id}`, datos)
  return respuesta.data
}

// DELETE responde 204 (sin cuerpo): no hay data que devolver
export async function eliminarProducto(id) {
  await api.delete(`/productos/${id}`)
}
