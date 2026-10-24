import Encabezado from '../organisms/Encabezado.jsx'
import PiePagina from '../organisms/PiePagina.jsx'
import { useCarrito } from '../../context/CarritoContext.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useNavegacion } from '../../context/NavegacionContext.jsx'

// Plantilla: estructura común de todas las páginas. `children` es la página actual.
// Aquí se conecta el estado global con el Encabezado por props.
function Layout({ children }) {
  const { cantidadTotal } = useCarrito()
  const { usuarioActual, cerrarSesion } = useSesion()
  const { mostrarToast } = useToast()
  const { pagina, irA } = useNavegacion()

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido principal</a>
      <Encabezado
        cantidadCarrito={cantidadTotal}
        haySesion={Boolean(usuarioActual)}
        paginaActual={pagina}
        onNavegar={irA}
        onCerrarSesion={() => { cerrarSesion(); mostrarToast('Sesión cerrada'); irA('inicio') }}
      />
      <main id="main">{children}</main>
      <PiePagina />
    </>
  )
}

export default Layout
