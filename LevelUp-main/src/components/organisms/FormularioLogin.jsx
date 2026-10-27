import { useState } from 'react'
import Enlace from '../atoms/Enlace.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import CampoFormulario from '../atoms/CampoFormulario.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

function FormularioLogin() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { iniciarSesion } = useSesion()
  const { mostrarToast } = useToast()
  const navigate = useNavigate()
  const ubicacion = useLocation()

  function enviar(e) {
    e.preventDefault()
    if (!iniciarSesion(correo, password)) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    mostrarToast('Sesión iniciada')
    // Vuelve a la página que se quería abrir (la deja RutaPrivada en location.state)
    navigate(ubicacion.state?.desde || '/perfil', { replace: true })
  }

  return (
    <Form className="auth-card" noValidate onSubmit={enviar}>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <CampoFormulario id="login-correo" label="Correo" type="email" maxLength={100} autoComplete="email"
        placeholder="tu@duoc.cl / @profesor.duoc.cl / @gmail.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      <CampoFormulario id="login-password" label="Contraseña" type="password" autoComplete="current-password"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit" variant="accent-blue" className="w-100">Iniciar sesión</Button>
      <p className="auth-link mt-3">¿No tienes cuenta? <Enlace pagina="registro">Regístrate aquí</Enlace></p>
    </Form>
  )
}

export default FormularioLogin
