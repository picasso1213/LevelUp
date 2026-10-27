import { Container, Row, Col, Button } from 'react-bootstrap'
import FormularioContacto from '../components/organisms/FormularioContacto.jsx'

function Contacto() {
  return (
    <>
      <section className="panel panel-tight">
        <Container>
          <h1>Hablemos</h1>
          <p className="lead">¿Dudas sobre un pedido, una cotización o el estado de tu compra? Escríbenos y te respondemos a la brevedad.</p>
        </Container>
      </section>
      <section className="panel">
        <Container>
          <Row className="g-4">
            <Col xs={12} lg={7}><FormularioContacto /></Col>
            <Col xs={12} lg={5}>
              <aside className="contacto-directo">
                <h2>Otras formas de contactarnos</h2>
                <Button as="a" variant="accent-green" className="whatsapp-btn" href="https://wa.me/56900000000" target="_blank" rel="noopener noreferrer">Chatea por WhatsApp</Button>
                <ul className="footer-links">
                  <li>Correo: contacto@levelupgamer.cl</li>
                  <li>Instagram: <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">@levelupgamer</a></li>
                  <li>Atención: lunes a viernes, 9:00 a 18:00</li>
                </ul>
              </aside>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default Contacto
