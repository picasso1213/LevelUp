import { Form } from 'react-bootstrap'

// Átomo: etiqueta + control + mensaje de error (todo accesible: label enlazado por controlId).
// "as" permite usarlo como <select> o <textarea>; los hijos son las <option>.
function CampoFormulario({ id, label, error, ayuda, as, children, className = 'mb-3', ...resto }) {
  const Control = as === 'select' ? Form.Select : Form.Control
  const propsExtra = as === 'textarea' ? { as: 'textarea' } : {}

  return (
    <Form.Group className={className} controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Control isInvalid={Boolean(error)} {...propsExtra} {...resto}>
        {children}
      </Control>
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      {ayuda && <Form.Text className="text-secondary d-block">{ayuda}</Form.Text>}
    </Form.Group>
  )
}

export default CampoFormulario
