import { Container } from 'react-bootstrap'
import EnlaceBoton from '../components/atoms/EnlaceBoton.jsx'

function Nosotros() {
  return (
    <>
      <section className="panel panel-tight">
        <Container>
          <h1>Quiénes somos</h1>
          <p className="lead">Level-Up Gamer nació hace dos años en Chile con una misión simple: que cualquier gamer, en cualquier región del país, pueda equipar su setup sin pisar una tienda física.</p>
        </Container>
      </section>

      <section className="panel">
        <Container className="nosotros-texto">
          <h2>Nuestra historia</h2>
          <p>Todo partió como un proyecto entre amigos apasionados por los videojuegos, cansados de pagar sobreprecio por accesorios importados y de esperar semanas por despachos poco claros. Hoy somos una tienda 100% online que despacha a las 16 regiones de Chile, con un catálogo que crece cada mes gracias a la retroalimentación de nuestra propia comunidad.</p>

          <h2>Nuestra misión</h2>
          <p>Democratizar el acceso al equipamiento gamer de calidad en Chile, con precios justos, información honesta sobre cada producto y un servicio de postventa real — no un chatbot que da vueltas en círculos.</p>

          <h2>El equipo</h2>
          <ul>
            <li><strong>Fundación y producto:</strong> definimos el catálogo probando cada línea de accesorios y periféricos antes de subirla a la tienda.</li>
            <li><strong>Logística:</strong> coordinamos despachos con couriers a nivel nacional, incluyendo zonas extremas.</li>
            <li><strong>Soporte al cliente:</strong> atendemos consultas de lunes a viernes, de 9:00 a 18:00, por WhatsApp y correo.</li>
          </ul>

          <h2>Programa LevelUp</h2>
          <p>Nuestros clientes registrados con correo institucional (@duoc.cl, @profesor.duoc.cl) acceden a 20% de descuento permanente, además de acumular puntos canjeables por cada compra y por cada persona que refieran a la tienda.</p>
        </Container>
      </section>

      <section className="panel">
        <Container className="nosotros-cta-box">
          <h2>¿Listo para subir de nivel tu setup?</h2>
          <p>Revisa el catálogo completo o únete gratis al programa LevelUp.</p>
          <div className="hero-actions">
            <EnlaceBoton pagina="productos">Ver productos</EnlaceBoton>
            <EnlaceBoton pagina="registro" variant="outline-accent">Únete gratis</EnlaceBoton>
          </div>
        </Container>
      </section>
    </>
  )
}

export default Nosotros
