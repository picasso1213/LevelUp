import { Container, Row, Col } from 'react-bootstrap'
import EnlaceBoton from '../components/atoms/EnlaceBoton.jsx'
import CatalogoProductos from '../components/organisms/CatalogoProductos.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useResenas } from '../context/ResenasContext.jsx'
import { categoriasDe } from '../utils/productos.js'

function Inicio() {
  const { productos, agregar } = useCarrito()
  const { resenas } = useResenas()

  return (
    <>
      <section className="hero">
        <Container>
          <Row className="align-items-center g-4">
            <Col xs={12} lg={6} className="hero-text">
              <h1>Sube de nivel<br />tu setup</h1>
              <p className="lead">Consolas, accesorios, PC gamers y sillas para los entusiastas de los videojuegos en Chile. Sin tienda física, con despacho a todo el país.</p>
              <div className="hero-actions">
                <EnlaceBoton pagina="productos">Ver productos</EnlaceBoton>
                <EnlaceBoton pagina="registro" variant="outline-accent">Únete gratis</EnlaceBoton>
              </div>
            </Col>
            <Col xs={12} lg={6}>
              <img className="hero-image img-fluid" src="/images/hero-setup.png" width="560" height="420" alt="Setup gamer con consola y control" />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="panel">
        <Container>
          <h2>Quiénes somos</h2>
          <p>Level-Up Gamer nació hace dos años para responder a la creciente demanda de los gamers chilenos. Ofrecemos una experiencia de compra personalizada, con un programa de puntos <strong>LevelUp</strong> que premia a nuestra comunidad más fiel.</p>
        </Container>
      </section>

      <section className="panel">
        <Container>
          <h2>Por qué elegirnos</h2>
          <Row xs={1} md={3} className="g-3">
            <Col><article className="beneficio-card h-100"><h3>Despacho a todo Chile</h3><p>Sin tienda física, pero con entregas a todas las regiones del país.</p></article></Col>
            <Col><article className="beneficio-card h-100"><h3>20% dcto. con correo Duoc</h3><p>Regístrate con tu correo institucional y obtén descuento de por vida.</p></article></Col>
            <Col><article className="beneficio-card h-100"><h3>Programa LevelUp</h3><p>Gana puntos por tus compras y referidos, y cámbialos por productos.</p></article></Col>
          </Row>
        </Container>
      </section>

      <section className="panel">
        <Container>
          <h2>Categorías</h2>
          <div className="d-flex flex-wrap gap-2">
            {/* Cada categoría abre el catálogo ya filtrado (se pasa como parámetro) */}
            {categoriasDe(productos).map((c) => (
              <EnlaceBoton key={c} pagina="productos" params={{ categoria: c }} variant="outline-accent">{c}</EnlaceBoton>
            ))}
          </div>
        </Container>
      </section>

      <section className="panel">
        <Container>
          <h2>Productos destacados</h2>
          <CatalogoProductos productos={productos} resenas={resenas} onAgregar={agregar} />
        </Container>
      </section>
    </>
  )
}

export default Inicio
