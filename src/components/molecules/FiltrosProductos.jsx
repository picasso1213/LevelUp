import { Form, Row, Col, Button } from 'react-bootstrap'

// Molécula: formulario CONTROLADO. Los valores vienen por props y cada cambio sube con onCambiar.
function FiltrosProductos({ filtros, categorias, onCambiar, onLimpiar }) {
  const cambiar = (campo) => (e) => onCambiar({ ...filtros, [campo]: e.target.value })

  return (
    <Form className="filtros-productos" noValidate onSubmit={(e) => e.preventDefault()} aria-label="Filtros de productos">
      <Row className="g-3 align-items-end">
        <Col xs={12} md={4}>
          <Form.Group controlId="filtro-busqueda">
            <Form.Label>Buscar</Form.Label>
            <Form.Control type="search" placeholder="Nombre del producto..." value={filtros.busqueda} onChange={cambiar('busqueda')} />
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group controlId="filtro-categoria">
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={filtros.categoria} onChange={cambiar('categoria')}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={6} md={2}>
          <Form.Group controlId="filtro-precio-min">
            <Form.Label>Precio mín.</Form.Label>
            <Form.Control type="number" min="0" placeholder="$0" value={filtros.precioMin} onChange={cambiar('precioMin')} />
          </Form.Group>
        </Col>
        <Col xs={6} md={2}>
          <Form.Group controlId="filtro-precio-max">
            <Form.Label>Precio máx.</Form.Label>
            <Form.Control type="number" min="0" placeholder="Sin límite" value={filtros.precioMax} onChange={cambiar('precioMax')} />
          </Form.Group>
        </Col>
        <Col xs={12} md={1}>
          <Button type="button" variant="outline-accent" className="w-100" onClick={onLimpiar}>Limpiar</Button>
        </Col>
      </Row>

      <Row className="g-3 align-items-center mt-1">
        <Col xs={12} md={4}>
          <Form.Check
            type="checkbox"
            id="filtro-stock"
            label="Solo con stock disponible"
            checked={filtros.soloStock}
            onChange={(e) => onCambiar({ ...filtros, soloStock: e.target.checked })}
          />
        </Col>
        <Col xs={12} md={{ span: 4, offset: 4 }}>
          <Form.Group controlId="filtro-orden">
            <Form.Label>Ordenar por</Form.Label>
            <Form.Select value={filtros.orden} onChange={cambiar('orden')}>
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre-asc">Nombre: A-Z</option>
              <option value="nombre-desc">Nombre: Z-A</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  )
}

export default FiltrosProductos
