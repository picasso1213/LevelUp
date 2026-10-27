import { PUNTOS_POR_CADA_1000_CLP } from '../data/fidelizacion.js'

// Todas las funciones devuelven un carrito NUEVO (inmutabilidad: React compara referencias)

export function totalUnidades(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0)
}

// Suma "cantidad" unidades del producto; si se conoce el stock, no lo supera
export function agregarItem(carrito, id, cantidad = 1, stock = Infinity) {
  const existe = carrito.find((item) => item.id === id)
  if (existe) {
    return carrito.map((item) =>
      item.id === id ? { ...item, cantidad: Math.min(item.cantidad + cantidad, stock) } : item,
    )
  }
  return [...carrito, { id, cantidad: Math.min(cantidad, stock) }]
}

// Fija la cantidad (entera, entre 1 y el máximo)
export function cambiarCantidad(carrito, id, cantidad, maximo = 99) {
  let n = Math.floor(Number(cantidad))
  if (!n || n < 1) n = 1
  if (n > maximo) n = maximo
  return carrito.map((item) => (item.id === id ? { ...item, cantidad: n } : item))
}

export function quitarItem(carrito, id) {
  return carrito.filter((item) => item.id !== id)
}

// Une cada línea del carrito con los datos del producto (ignora productos que ya no existen)
export function detalleCarrito(carrito, productos) {
  return carrito
    .map((item) => {
      const producto = productos.find((p) => p.id === item.id)
      return producto ? { ...producto, cantidad: item.cantidad, subtotal: producto.precio * item.cantidad } : null
    })
    .filter(Boolean)
}

// Subtotal, descuento (%), total y puntos Level-Up que se ganarían
export function calcularTotales(lineas, descuentoPct = 0) {
  const subtotal = lineas.reduce((suma, l) => suma + l.subtotal, 0)
  const descuento = Math.round((subtotal * descuentoPct) / 100)
  const total = subtotal - descuento
  const puntos = Math.floor(total / 1000) * PUNTOS_POR_CADA_1000_CLP
  return { subtotal, descuento, total, puntos }
}
