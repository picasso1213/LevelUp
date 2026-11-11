import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listarProductos } from '../services/productos.js'

// Catálogo de productos que viene del backend (GET /productos).
// Expone la lista, si está cargando, el mensaje de error (si falló) y recargar()
// (se usa después de una compra, porque el servidor descuenta el stock).
const ProductosContext = createContext(null)

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setProductos(await listarProductos())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const valor = useMemo(() => ({ productos, cargando, error, recargar }), [productos, cargando, error, recargar])
  return <ProductosContext.Provider value={valor}>{children}</ProductosContext.Provider>
}

export function useProductos() {
  const ctx = useContext(ProductosContext)
  if (!ctx) throw new Error('useProductos debe usarse dentro de <ProductosProvider>')
  return ctx
}
