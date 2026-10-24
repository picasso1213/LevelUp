import { Badge, Button, ProgressBar } from 'react-bootstrap'
import { CANJES_LEVELUP, PUNTOS_BONUS_REFERIDO_NUEVO, PUNTOS_POR_REFERIDO } from '../../data/fidelizacion.js'
import { obtenerNivelActual } from '../../utils/fidelizacion.js'

// Organismo: puntos, nivel, barra de progreso, código de referido y catálogo de canjes.
// Es "tonto": solo muestra lo que recibe y avisa con onCopiar / onCanjear.
function PanelFidelizacion({ usuario, onCopiar, onCanjear }) {
  const { actual, siguiente, progreso } = obtenerNivelActual(usuario.puntosLevelUp)

  return (
    <>
      <p className="text-secondary">
        Puntos Level-Up: <strong>{usuario.puntosLevelUp}</strong> — Nivel{' '}
        <Badge bg="secondary">{actual.nombre}</Badge>
      </p>
      <ProgressBar now={progreso} style={{ maxWidth: 400 }} className="mb-2" aria-label="Progreso al siguiente nivel" />
      <p className="text-secondary" style={{ fontSize: '.85rem' }}>
        {siguiente
          ? `Te faltan ${siguiente.puntosMin - usuario.puntosLevelUp} puntos para llegar a ${siguiente.nombre}.`
          : '¡Alcanzaste el nivel máximo!'}
      </p>

      <div className="auth-card mt-4">
        <h2 className="auth-card-titulo">Programa de referidos</h2>
        <p className="text-secondary">
          Comparte tu código con amigos: tú ganas {PUNTOS_POR_REFERIDO} puntos y ellos {PUNTOS_BONUS_REFERIDO_NUEVO} al registrarse.
        </p>
        <p>
          Tu código: <strong>{usuario.codigoReferido}</strong>{' '}
          <Button type="button" variant="outline-accent" className="ms-2" onClick={() => onCopiar(usuario.codigoReferido)}>Copiar</Button>
        </p>
        <p className="text-secondary mb-0">Amigos referidos: {(usuario.referidos || []).length}</p>
      </div>

      <div className="auth-card mt-4">
        <h2 className="auth-card-titulo">Canjea tus puntos</h2>
        {CANJES_LEVELUP.map((canje) => (
          <div className="canje-item" key={canje.id}>
            <div>
              <strong>{canje.nombre}</strong>
              <p className="text-secondary m-0">{canje.costo} puntos</p>
            </div>
            <Button type="button" variant="outline-accent" disabled={usuario.puntosLevelUp < canje.costo}
              aria-label={`Canjear ${canje.nombre}`} onClick={() => onCanjear(canje.id)}>
              Canjear
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}

export default PanelFidelizacion
