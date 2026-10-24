import { useState } from 'react'
import Enlace from '../atoms/Enlace.jsx'
import { Form, Button } from 'react-bootstrap'
import Estrellas from '../atoms/Estrellas.jsx'
import ItemResena from '../molecules/ItemResena.jsx'
import { useResenas } from '../../context/ResenasContext.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { calcularPromedio, resenasDeProducto, usuarioComproProducto } from '../../utils/resenas.js'

// Organismo: resumen, lista y formulario de reseñas. El formulario solo aparece si el usuario
// inició sesión, compró el producto y aún no lo reseñó (renderizado condicional).
function ResenasProducto({ producto }) {
  const { resenas, agregarResena } = useResenas()
  const { usuarioActual } = useSesion()
  const { mostrarToast } = useToast()
  const [calificacion, setCalificacion] = useState('')
  const [comentario, setComentario] = useState('')

  const lista = resenasDeProducto(resenas, producto.id)
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const promedio = calcularPromedio(resenas, producto.id)

  function publicar(e) {
    e.preventDefault()
    if (!Number(calificacion) || !comentario.trim()) return
    agregarResena({
      productoId: producto.id,
      correoUsuario: usuarioActual.correo,
      nombreUsuario: `${usuarioActual.nombre} ${usuarioActual.apellidos.charAt(0)}.`,
      calificacion: Number(calificacion),
      comentario: comentario.trim(),
    })
    setCalificacion('')
    setComentario('')
    mostrarToast('¡Gracias por tu reseña!')
  }

  function formulario() {
    if (!usuarioActual) {
      return <p className="text-secondary">Debes <Enlace pagina="login">iniciar sesión</Enlace> para dejar una reseña.</p>
    }
    if (!usuarioComproProducto(usuarioActual, producto.id)) {
      return <p className="text-secondary">Solo los clientes que compraron este producto pueden dejar una reseña.</p>
    }
    if (lista.some((r) => r.correoUsuario === usuarioActual.correo)) {
      return <p className="text-secondary">Ya dejaste una reseña para este producto. ¡Gracias por tu opinión!</p>
    }
    return (
      <Form className="auth-card" noValidate onSubmit={publicar}>
        <h3 className="auth-card-titulo">Deja tu reseña</h3>
        <Form.Group className="mb-3" controlId="resena-calificacion">
          <Form.Label>Calificación</Form.Label>
          <Form.Select value={calificacion} onChange={(e) => setCalificacion(e.target.value)} required>
            <option value="" disabled>-- Selecciona --</option>
            <option value="5">5 - Excelente</option>
            <option value="4">4 - Muy bueno</option>
            <option value="3">3 - Bueno</option>
            <option value="2">2 - Regular</option>
            <option value="1">1 - Malo</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="resena-comentario">
          <Form.Label>Comentario</Form.Label>
          <Form.Control as="textarea" rows={3} maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)} required />
        </Form.Group>
        <Button type="submit" variant="accent-blue">Publicar reseña</Button>
      </Form>
    )
  }

  return (
    <section aria-labelledby="titulo-resenas">
      <h2 id="titulo-resenas">Reseñas y calificaciones</h2>
      {promedio !== null ? (
        <div className="resenas-mini">
          <Estrellas promedio={promedio} /> <strong>{promedio.toFixed(1)}</strong>{' '}
          <span className="text-secondary">({lista.length} reseña{lista.length === 1 ? '' : 's'})</span>
        </div>
      ) : (
        <p className="text-secondary">Este producto todavía no tiene reseñas.</p>
      )}

      <div>
        {lista.length === 0
          ? <p className="text-secondary">Sé el primero en dejar tu opinión.</p>
          : lista.map((r) => <ItemResena key={r.id} resena={r} />)}
      </div>

      <div className="mt-3">{formulario()}</div>
    </section>
  )
}

export default ResenasProducto
