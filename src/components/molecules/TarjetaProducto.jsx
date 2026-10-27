import EnlaceBoton from '../atoms/EnlaceBoton.jsx'
import { Button } from 'react-bootstrap'
import Estrellas from '../atoms/Estrellas.jsx'
import Precio from '../atoms/Precio.jsx'

// Molécula: átomos (Estrellas, Precio, Button) combinados en una tarjeta.
// Recibe DATOS por props (producto, promedio...) y AVISA hacia arriba con onAgregar (flujo unidireccional).
function TarjetaProducto({ producto, promedio = null, cantidadResenas = 0, onAgregar }) {
  const { id, nombre, categoria, descripcion, precio, imagen, stock } = producto
  const agotado = stock <= 0

  return (
    <article className="producto-card h-100">
      <img src={imagen} width="400" height="300" alt={nombre} loading="lazy" />
      <span className="categoria">{categoria}</span>
      <h3>{nombre}</h3>

      {promedio !== null ? (
        <div className="resenas-mini">
          <Estrellas promedio={promedio} /> <span className="text-secondary">({cantidadResenas})</span>
        </div>
      ) : (
        <div className="resenas-mini text-secondary">Sin reseñas aún</div>
      )}

      <p>{descripcion}</p>
      <Precio valor={precio} />

      <EnlaceBoton pagina="detalle" params={{ id }} variant="outline-accent">Ver detalle</EnlaceBoton>
      <Button
        type="button"
        variant="accent-green"
        disabled={agotado}
        onClick={() => onAgregar(id)}
      >
        {agotado ? 'Sin stock' : 'Añadir al carrito'}
      </Button>
    </article>
  )
}

export default TarjetaProducto
