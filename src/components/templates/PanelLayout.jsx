import { NavLink, Outlet } from 'react-router-dom'
import { Container, Nav } from 'react-bootstrap'
import { useSesion } from '../../context/SesionContext.jsx'

// Plantilla del panel de gestión: pestañas según el rol. ADMIN ve las tres; VENDEDOR solo productos y órdenes.
function PanelLayout() {
  const { usuarioActual } = useSesion()
  const esAdmin = usuarioActual?.rol === 'ADMIN'

  return (
    <section className="panel">
      <Container>
        <h1>Panel de gestión</h1>
        <p className="text-secondary">Sesión como {usuarioActual?.rol === 'ADMIN' ? 'administrador' : 'vendedor'}.</p>
        <Nav variant="pills" className="mb-4 gap-2">
          <Nav.Link as={NavLink} to="/panel/productos">Productos</Nav.Link>
          <Nav.Link as={NavLink} to="/panel/ordenes">Órdenes</Nav.Link>
          {esAdmin && <Nav.Link as={NavLink} to="/panel/usuarios">Usuarios</Nav.Link>}
        </Nav>
        <Outlet />
      </Container>
    </section>
  )
}

export default PanelLayout
