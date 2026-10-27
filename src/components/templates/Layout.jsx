import { Outlet, useNavigate } from 'react-router-dom'
import Encabezado from '../organisms/Encabezado.jsx'
import PiePagina from '../organisms/PiePagina.jsx'
import { useCarrito } from '../../context/CarritoContext.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

// Plantilla: estructura común de todas las páginas.
// <Outlet /> es el hueco donde React Router dibuja la página que corresponde a la URL.
function Layout() {
  const { cantidadTotal } = useCarrito()
  const { usuarioActual, cerrarSesion } = useSesion()
  const { mostrarToast } = useToast()
  const navigate = useNavigate()

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido principal</a>
      <Encabezado
        cantidadCarrito={cantidadTotal}
        haySesion={Boolean(usuarioActual)}
        onCerrarSesion={() => { cerrarSesion(); mostrarToast('Sesión cerrada'); navigate('/') }}
      />
      <main id="main"><Outlet /></main>
      <PiePagina />
    </>
  )
}

export default Layout
