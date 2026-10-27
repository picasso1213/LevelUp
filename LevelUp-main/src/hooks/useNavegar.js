import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { rutaDe } from '../utils/rutas.js'

// Navegar desde el código (después de iniciar sesión, al cerrar sesión...).
// Es la versión con React Router de lo que hacía NavegacionContext: irA('perfil')
export function useNavegar() {
  const navigate = useNavigate()
  const irA = useCallback((pagina, params, opciones) => {
    navigate(rutaDe(pagina, params), opciones)
    window.scrollTo?.(0, 0)
  }, [navigate])
  return { irA }
}
