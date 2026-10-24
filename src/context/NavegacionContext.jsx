import { createContext, useCallback, useContext, useState } from 'react'

const NavegacionContext = createContext(null)

// Navegación mínima SIN librerías: el estado guarda qué página se muestra y sus parámetros.
// Páginas: inicio, productos, detalle, carrito, login, registro, perfil, nosotros, blog, contacto.
// Cuando agregues React Router, este archivo y el átomo <Enlace /> son lo que reemplazarás.
export function NavegacionProvider({ children }) {
  const [destino, setDestino] = useState({ pagina: 'inicio', params: {} })

  const irA = useCallback((pagina, params = {}) => {
    setDestino({ pagina, params })
    window.scrollTo?.(0, 0)
  }, [])

  return (
    <NavegacionContext.Provider value={{ pagina: destino.pagina, params: destino.params, irA }}>
      {children}
    </NavegacionContext.Provider>
  )
}

export function useNavegacion() {
  const ctx = useContext(NavegacionContext)
  if (!ctx) throw new Error('useNavegacion debe usarse dentro de <NavegacionProvider>')
  return ctx
}
