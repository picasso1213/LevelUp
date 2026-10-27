import { createContext, useCallback, useContext } from 'react'
import { useStorage } from '../hooks/useStorage.js'

const ResenasContext = createContext(null)

export function ResenasProvider({ children }) {
  const [resenas, setResenas] = useStorage('levelup_resenas', [])

  const agregarResena = useCallback((resena) => {
    setResenas((actual) => [...actual, { id: Date.now(), fecha: new Date().toISOString(), ...resena }])
  }, [setResenas])

  return <ResenasContext.Provider value={{ resenas, agregarResena }}>{children}</ResenasContext.Provider>
}

export function useResenas() {
  const ctx = useContext(ResenasContext)
  if (!ctx) throw new Error('useResenas debe usarse dentro de <ResenasProvider>')
  return ctx
}
