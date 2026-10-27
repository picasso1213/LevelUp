import Estrellas from '../atoms/Estrellas.jsx'

// Molécula: una reseña (autor, fecha, estrellas y comentario)
function ItemResena({ resena }) {
  return (
    <div className="resena-item">
      <div className="resena-item-header">
        <strong>{resena.nombreUsuario}</strong>
        <span className="resena-item-fecha">{new Date(resena.fecha).toLocaleDateString('es-CL')}</span>
      </div>
      <div className="resenas-mini"><Estrellas promedio={resena.calificacion} /></div>
      <p>{resena.comentario}</p>
    </div>
  )
}

export default ItemResena
