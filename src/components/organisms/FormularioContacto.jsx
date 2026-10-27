import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import CampoFormulario from '../atoms/CampoFormulario.jsx'
import { validarContacto } from '../../utils/validaciones.js'

const VACIO = { nombre: '', correo: '', asunto: 'cotizacion', mensaje: '', terminos: false }

// Organismo: formulario controlado con validación al salir del campo (onBlur) y al enviar (onSubmit)
function FormularioContacto() {
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState('')

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValores({ ...valores, [campo]: valor })
    setExito('')
  }

  // Valida solo un campo (cuando el usuario sale de él)
  function validarCampo(campo, vals = valores) {
    const todos = validarContacto(vals)
    setErrores((prev) => {
      const siguiente = { ...prev }
      if (todos[campo]) siguiente[campo] = todos[campo]
      else delete siguiente[campo]
      return siguiente
    })
  }

  function enviar(e) {
    e.preventDefault()
    const nuevos = validarContacto(valores)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) {
      setExito('')
      return
    }
    setExito('¡Gracias por tu mensaje! Te responderemos a la brevedad.')
    setValores(VACIO)
  }

  return (
    <Form className="contact-form" noValidate onSubmit={enviar}>
      <h2 className="visually-hidden">Formulario de contacto</h2>

      <CampoFormulario id="nombre" label="Nombre completo" maxLength={100} autoComplete="name"
        value={valores.nombre} onChange={cambiar('nombre')} onBlur={() => validarCampo('nombre')} error={errores.nombre} />

      <CampoFormulario id="correo" type="email" maxLength={100} autoComplete="email"
        label={<>Correo electrónico <span className="text-secondary">(opcional)</span></>}
        placeholder="tu@duoc.cl / @profesor.duoc.cl / @gmail.com"
        value={valores.correo} onChange={cambiar('correo')} onBlur={() => validarCampo('correo')} error={errores.correo} />

      <CampoFormulario as="select" id="asunto" label="Asunto" value={valores.asunto} onChange={cambiar('asunto')}>
        <option value="cotizacion">Cotización</option>
        <option value="pedido">Estado de mi pedido</option>
        <option value="soporte">Soporte técnico</option>
        <option value="otro">Otro</option>
      </CampoFormulario>

      <CampoFormulario as="textarea" id="mensaje" label="Mensaje" rows={5} maxLength={500}
        value={valores.mensaje} onChange={cambiar('mensaje')} onBlur={() => validarCampo('mensaje')} error={errores.mensaje} />
      <p className="text-secondary text-end" aria-live="polite">{valores.mensaje.length}/500</p>

      <Form.Group className="mb-4" controlId="terminos">
        <Form.Check
          type="checkbox" id="terminos" isInvalid={Boolean(errores.terminos)}
          label="Acepto que Level-Up Gamer me contacte para responder mi consulta."
          checked={valores.terminos} onChange={cambiar('terminos')}
          feedback={errores.terminos} feedbackType="invalid"
        />
      </Form.Group>

      <Button type="submit" variant="accent-blue">Enviar mensaje</Button>
      <div className="form-success" role="status" aria-live="polite">{exito}</div>
    </Form>
  )
}

export default FormularioContacto
