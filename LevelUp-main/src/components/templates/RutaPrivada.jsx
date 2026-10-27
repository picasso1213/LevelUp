import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Ruta protegida: sin sesión redirige a /login y recuerda a qué página se quería entrar (state.desde).
// `replace` evita que el botón "Atrás" vuelva a la página protegida.
function RutaPrivada({ autenticado }) {
  const ubicacion = useLocation()
  if (!autenticado) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}

export default RutaPrivada
