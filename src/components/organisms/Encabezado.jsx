import { Link, NavLink } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { rutaDe } from '../../utils/rutas.js'

// Organismo: barra de navegación responsiva (se colapsa en "hamburguesa" bajo el breakpoint lg).
// Todo llega por props: cantidadCarrito, haySesion y la función onCerrarSesion (los eventos suben).
// Los enlaces son <NavLink>: React Router marca solo cuál es la página activa.
function Encabezado({ cantidadCarrito, haySesion, onCerrarSesion }) {
  // Enlace del menú: NavLink navega sin recargar y marca la página activa
  const item = (pagina, texto, extra = {}) => (
    <Nav.Link as={NavLink} to={rutaDe(pagina)} end={pagina === 'inicio'} {...extra}>
      {texto}
    </Nav.Link>
  )

  return (
    <header>
      <Navbar expand="lg" variant="dark" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">
            <svg className="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="8" width="20" height="10" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="7" cy="13" r="1.4" fill="currentColor" />
              <circle cx="17" cy="12" r="1.2" fill="currentColor" />
              <circle cx="19" cy="14" r="1.2" fill="currentColor" />
            </svg>
            {' '}LEVEL-UP <span className="brand-accent">GAMER</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="menu-principal" label="Abrir menú" />
          <Navbar.Collapse id="menu-principal">
            <Nav className="ms-auto align-items-lg-center">
              {item('inicio', 'Inicio')}
              {item('productos', 'Productos')}
              {item('nosotros', 'Nosotros')}
              {item('blog', 'Blog')}
              {item('contacto', 'Contacto')}

              {haySesion ? (
                <>
                  {item('perfil', 'Mi perfil')}
                  <Nav.Link as="button" type="button" className="nav-link-logout" onClick={onCerrarSesion}>
                    Cerrar sesión
                  </Nav.Link>
                </>
              ) : (
                item('login', 'Iniciar sesión')
              )}

              {item('carrito', <>🛒 Carrito (<span>{cantidadCarrito}</span>)</>, { className: 'cart-link' })}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Encabezado
