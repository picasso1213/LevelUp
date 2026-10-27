import Enlace from '../atoms/Enlace.jsx'
import { Container, Row, Col } from 'react-bootstrap'
import FormNewsletter from '../molecules/FormNewsletter.jsx'

// Organismo: pie de página con 4 columnas que se apilan en móvil (xs=12) y se reparten en escritorio
function PiePagina() {
  return (
    <footer>
      <Container>
        <Row className="g-4">
          <Col xs={12} md={6} lg={3}>
            <p className="footer-brand">LEVEL-UP <span className="brand-accent">GAMER</span></p>
            <p className="text-secondary">Tienda online para gamers en Chile. Despachos a todo el país.</p>
            <ul className="social-list">
              <li><a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://wa.me/56900000000" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            </ul>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <p className="footer-title">Enlaces</p>
            <ul className="footer-links">
              <li><Enlace pagina="inicio">Inicio</Enlace></li>
              <li><Enlace pagina="productos">Productos</Enlace></li>
              <li><Enlace pagina="nosotros">Nosotros</Enlace></li>
              <li><Enlace pagina="contacto">Contacto</Enlace></li>
            </ul>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <p className="footer-title">Contacto</p>
            <ul className="footer-links">
              <li>Correo: contacto@levelupgamer.cl</li>
              <li>WhatsApp: +56 9 0000 0000</li>
            </ul>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <p className="footer-title">Nuevas noticias</p>
            <p className="text-secondary">Novedades, ofertas y eventos gamer.</p>
            <FormNewsletter />
          </Col>
        </Row>
      </Container>
      <p className="footer-bottom">© 2026 Level-Up Gamer. Todos los derechos reservados.</p>
    </footer>
  )
}

export default PiePagina
