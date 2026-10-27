import { createContext, useCallback, useContext, useMemo } from 'react'
import { useStorage } from '../hooks/useStorage.js'
import { PRODUCTOS } from '../data/productos.js'
import { agregarItem, cambiarCantidad, quitarItem, totalUnidades } from '../utils/carrito.js'
import { useToast } from './ToastContext.jsx'

const CarritoContext = createContext(null)

export function CarritoProvider({ children, productos = PRODUCTOS }) {
  // Estado levantado: vive aquí y lo comparten Encabezado, tarjetas, detalle y página de carrito
  const [carrito, setCarrito] = useStorage('levelup_carrito', [])
  const { mostrarToast } = useToast()

  const agregar = useCallback((idProducto, cantidad = 1) => {
    const producto = productos.find((p) => p.id === idProducto)
    if (!producto || producto.stock <= 0) return
    setCarrito((actual) => agregarItem(actual, idProducto, cantidad, producto.stock))
    mostrarToast(`${producto.nombre} añadido al carrito`)
  }, [productos, setCarrito, mostrarToast])

  const cambiar = useCallback((id, cantidad) => {
    const producto = productos.find((p) => p.id === id)
    setCarrito((actual) => cambiarCantidad(actual, id, cantidad, producto ? producto.stock : 99))
  }, [productos, setCarrito])

  const quitar = useCallback((id) => {
    setCarrito((actual) => quitarItem(actual, id))
    mostrarToast('Producto eliminado del carrito')
  }, [setCarrito, mostrarToast])

  const vaciar = useCallback(() => setCarrito([]), [setCarrito])

  // Dato derivado: se calcula, no se guarda en otro estado
  const cantidadTotal = useMemo(() => totalUnidades(carrito), [carrito])

  const valor = { carrito, cantidadTotal, productos, agregar, cambiar, quitar, vaciar }
  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return ctx
}
