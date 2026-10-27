import { Container } from 'react-bootstrap'
import EnlaceBoton from '../components/atoms/EnlaceBoton.jsx'

// Se muestra cuando la URL no coincide con ninguna ruta (ruta comodín "*")
function NoEncontrado() {
  return (
    <section className="panel">
      <Container className="text-center">
        <h1>404 · Página no encontrada</h1>
        <p className="text-secondary">La dirección que buscas no existe.</p>
        <EnlaceBoton pagina="inicio">Volver al inicio</EnlaceBoton>
      </Container>
    </section>
  )
}

export default NoEncontrado
