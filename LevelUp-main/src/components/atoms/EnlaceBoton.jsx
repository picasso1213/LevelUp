import Enlace from './Enlace.jsx'

// Átomo: un enlace interno con aspecto de botón de Bootstrap (es un <a> real, no un <button>)
function EnlaceBoton({ pagina, params, variant = 'accent-blue', className = '', children }) {
  return (
    <Enlace pagina={pagina} params={params} className={`btn btn-${variant} ${className}`.trim()}>
      {children}
    </Enlace>
  )
}

export default EnlaceBoton
