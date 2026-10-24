import { formatearPrecio } from '../../utils/formato.js'

// Átomo: un precio con formato chileno
function Precio({ valor, className = 'precio' }) {
  return <p className={className}>{formatearPrecio(valor)}</p>
}

export default Precio
