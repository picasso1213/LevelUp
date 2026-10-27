import { Link } from 'react-router-dom'
import { rutaDe } from '../../utils/rutas.js'

// Átomo: enlace interno. Usa <Link> de React Router: cambia de URL sin recargar la página.
// Uso: <Enlace pagina="detalle" params={{ id: 3 }}>Ver</Enlace>
function Enlace({ pagina, params, className, children }) {
  return <Link to={rutaDe(pagina, params)} className={className}>{children}</Link>
}

export default Enlace
