import { useNavegacion } from '../../context/NavegacionContext.jsx'

// Átomo: enlace interno. Cambia de página sin recargar (reemplaza a <Link> de React Router).
// Uso: <Enlace pagina="detalle" params={{ id: 3 }}>Ver</Enlace>
function Enlace({ pagina, params, className, children }) {
  const { irA } = useNavegacion()
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => { e.preventDefault(); irA(pagina, params) }}
    >
      {children}
    </a>
  )
}

export default Enlace
