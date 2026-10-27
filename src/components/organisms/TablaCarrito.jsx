import { Table } from 'react-bootstrap'
import FilaCarrito from '../molecules/FilaCarrito.jsx'

// Organismo: tabla responsiva (se desliza horizontalmente en pantallas chicas)
function TablaCarrito({ lineas, onCambiarCantidad, onQuitar }) {
  return (
    <Table responsive variant="dark" className="align-middle">
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col">Precio</th>
          <th scope="col">Cantidad</th>
          <th scope="col">Subtotal</th>
          <th scope="col"><span className="visually-hidden">Eliminar</span></th>
        </tr>
      </thead>
      <tbody>
        {lineas.map((linea) => (
          <FilaCarrito key={linea.id} linea={linea} onCambiarCantidad={onCambiarCantidad} onQuitar={onQuitar} />
        ))}
      </tbody>
    </Table>
  )
}

export default TablaCarrito
