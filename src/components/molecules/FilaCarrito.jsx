import { Form } from 'react-bootstrap'
import { formatearPrecio } from '../../utils/formato.js'

// Molécula: una fila de la tabla del carrito. Los eventos suben por props.
function FilaCarrito({ linea, onCambiarCantidad, onQuitar }) {
  return (
    <tr>
      <td>
        <div className="carrito-producto">
          <img className="carrito-img" src={linea.imagen} alt={linea.nombre} />
          <span>{linea.nombre}</span>
        </div>
      </td>
      <td>{formatearPrecio(linea.precio)}</td>
      <td>
        <Form.Control
          type="number"
          className="input-cantidad"
          min="1"
          max={linea.stock}
          value={linea.cantidad}
          aria-label={`Cantidad de ${linea.nombre}`}
          onChange={(e) => onCambiarCantidad(linea.id, e.target.value)}
        />
      </td>
      <td className="carrito-subtotal">{formatearPrecio(linea.subtotal)}</td>
      <td>
        <button type="button" className="btn-eliminar" aria-label={`Eliminar ${linea.nombre} del carrito`} onClick={() => onQuitar(linea.id)}>
          ✕
        </button>
      </td>
    </tr>
  )
}

export default FilaCarrito
