import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

// Muestra un aviso breve ("Producto añadido al carrito") durante 2,2 segundos
export function ToastProvider({ children }) {
  const [mensaje, setMensaje] = useState('')

  // Efecto con limpieza: si llega otro mensaje, se cancela el temporizador anterior
  useEffect(() => {
    if (!mensaje) return undefined
    const temporizador = setTimeout(() => setMensaje(''), 2200)
    return () => clearTimeout(temporizador)
  }, [mensaje])

  const mostrarToast = useCallback((texto) => setMensaje(texto), [])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className={`toast-msg${mensaje ? ' show' : ''}`} role="status" aria-live="polite">
        {mensaje}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
