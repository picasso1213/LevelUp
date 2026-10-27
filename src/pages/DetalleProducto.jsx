import { useState } from 'react'
import Enlace from '../components/atoms/Enlace.jsx'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap'
import Precio from '../components/atoms/Precio.jsx'
import CatalogoProductos from '../components/organisms/CatalogoProductos.jsx'
import ResenasProducto from '../components/organisms/ResenasProducto.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useResenas } from '../context/ResenasContext.jsx'

function DetalleProducto() {
  const { id } = useParams() // useParams: lee :id de /productos/:id
  const { productos, agregar } = useCarrito()
  const { resenas } = useResenas()
  const [cantidad, setCantidad] = useState(1)

  const producto = productos.find((p) => p.id === Number(id))

  if (!producto) {
    return (
      <Container className="panel">
        <Alert variant="dark">No encontramos ese producto. <Enlace pagina="productos">Vuelve al catálogo</Enlace>.</Alert>
      </Container>
    )
  }

  const relacionados = productos.filter((p) => p.categoria === producto.categoria && p.id !== producto.id)
  const agotado = producto.stock <= 0

  return (
    <section className="panel">
      <Container>
        <p className="breadcrumb-detalle">
          <Enlace pagina="inicio">Home</Enlace> &gt; <Enlace pagina="productos">Productos</Enlace> &gt; <span>{producto.nombre}</span>
        </p>

        <Row className="g-4 mb-5">
          <Col xs={12} md={6}>
            <img src={producto.imagen} alt={producto.nombre} className="detalle-imagen" />
          </Col>
          <Col xs={12} md={6}>
            <span className="categoria">{producto.categoria}</span>
            <h1>{producto.nombre}</h1>
            <Precio valor={producto.precio} className="detalle-precio" />
            <p className="detalle-descripcion">{producto.descripcion}</p>
            <p className="text-secondary">{agotado ? 'Sin stock' : `Stock disponible: ${producto.stock}`}</p>

            <div className="detalle-compra">
              <Form.Group controlId="detalle-cantidad">
                <Form.Label>Cantidad</Form.Label>
                <Form.Select className="detalle-cantidad-select" value={cantidad} disabled={agotado}
                  onChange={(e) => setCantidad(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].filter((n) => n <= Math.max(producto.stock, 1)).map((n) => <option key={n} value={n}>{n}</option>)}
                </Form.Select>
              </Form.Group>
              <Button type="button" variant="accent-green" disabled={agotado} onClick={() => agregar(producto.id, cantidad)}>
                Añadir al carrito
              </Button>
            </div>
          </Col>
        </Row>

        <ResenasProducto producto={producto} />

        {relacionados.length > 0 && (
          <div className="mt-5">
            <h2>Productos relacionados</h2>
            <CatalogoProductos productos={relacionados} resenas={resenas} onAgregar={agregar} />
          </div>
        )}
      </Container>
    </section>
  )
}

export default DetalleProducto
