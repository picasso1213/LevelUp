import { Alert, Button } from 'react-bootstrap'

// Molécula: avisa mientras se cargan datos del backend o si la carga falló (con botón para reintentar).
// Si no hay nada que avisar, no dibuja nada.
function EstadoCatalogo({ cargando, error, onReintentar }) {
  if (cargando) return <p className="text-secondary" role="status">Cargando…</p>
  if (error) {
    return (
      <Alert variant="danger" role="alert">
        {error}{' '}
        {onReintentar && <Button type="button" size="sm" variant="outline-accent" onClick={onReintentar}>Reintentar</Button>}
      </Alert>
    )
  }
  return null
}

export default EstadoCatalogo
