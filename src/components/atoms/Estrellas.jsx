// Átomo: muestra 5 estrellas, llenas hasta el promedio redondeado
function Estrellas({ promedio }) {
  const redondeado = Math.round(promedio || 0)
  return (
    <span role="img" aria-label={`${redondeado} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`estrella${n <= redondeado ? ' llena' : ''}`} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

export default Estrellas
