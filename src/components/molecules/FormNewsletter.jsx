import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { esCorreoValido } from '../../utils/validaciones.js'

// Molécula con estado propio: el correo escrito y el mensaje de resultado
function FormNewsletter() {
  const [correo, setCorreo] = useState('')
  const [feedback, setFeedback] = useState({ texto: '', error: false })

  function enviar(e) {
    e.preventDefault()
    if (!correo.trim() || !esCorreoValido(correo)) {
      setFeedback({ texto: 'Ingresa un correo electrónico válido.', error: true })
      return
    }
    setFeedback({ texto: '¡Listo! Te avisaremos de nuestras novedades.', error: false })
    setCorreo('')
  }

  return (
    <Form noValidate className="newsletter-form" onSubmit={enviar}>
      <Form.Label htmlFor="newsletter-email" className="visually-hidden">Correo electrónico</Form.Label>
      <div className="newsletter-row">
        <Form.Control
          type="email" id="newsletter-email" placeholder="tu@correo.com" maxLength={100}
          autoComplete="email" value={correo} isInvalid={feedback.error}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <Button type="submit" variant="accent-blue">Suscribirme</Button>
      </div>
      <div className={`form-feedback${feedback.error ? ' error' : ''}`} role="status" aria-live="polite">{feedback.texto}</div>
    </Form>
  )
}

export default FormNewsletter
