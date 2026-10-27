import { Row, Col, Alert } from 'react-bootstrap'
import TarjetaProducto from '../molecules/TarjetaProducto.jsx'
import { calcularPromedio, resenasDeProducto } from '../../utils/resenas.js'

// Organismo: lista de tarjetas generada con map + key.
// Grilla responsiva de Bootstrap: 1 columna en móvil, 2 en tablet (md) y 3 en escritorio (lg).
function CatalogoProductos({ productos, resenas = [], onAgregar }) {
  if (productos.length === 0) {
    return (
      <Alert variant="dark" className="mt-3">
        No encontramos productos que coincidan con tu búsqueda. Prueba ajustando los filtros.
      </Alert>
    )
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <TarjetaProducto
            producto={producto}
            promedio={calcularPromedio(resenas, producto.id)}
            cantidadResenas={resenasDeProducto(resenas, producto.id).length}
            onAgregar={onAgregar}
          />
        </Col>
      ))}
    </Row>
  )
}

export default CatalogoProductos
