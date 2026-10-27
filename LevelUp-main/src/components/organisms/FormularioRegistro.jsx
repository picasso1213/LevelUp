import { useState } from 'react'
import Enlace from '../atoms/Enlace.jsx'
import { useNavegar } from '../../hooks/useNavegar.js'
import { Form, Button, Row, Col } from 'react-bootstrap'
import CampoFormulario from '../atoms/CampoFormulario.jsx'
import SelectorRegionComuna from '../molecules/SelectorRegionComuna.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { validarRegistro } from '../../utils/validaciones.js'
import { PUNTOS_BONUS_REFERIDO_NUEVO } from '../../data/fidelizacion.js'

const VACIO = {
  nombre: '', apellidos: '', run: '', correo: '', fechaNacimiento: '', password: '', password2: '',
  telefono: '', region: '', comuna: '', direccion: '', codigoReferido: '',
}

// Organismo: todo el formulario vive en UN objeto de estado y se valida con una función pura
function FormularioRegistro() {
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const { usuarios, registrar } = useSesion()
  const { mostrarToast } = useToast()
  const { irA } = useNavegar()

  const cambiar = (campo) => (e) => setValores({ ...valores, [campo]: e.target.value })

  function enviar(e) {
    e.preventDefault()
    const nuevos = validarRegistro(valores, usuarios)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = registrar(valores, valores.codigoReferido)
    if (!resultado.ok) {
      setErrores({ codigoReferido: resultado.error })
      return
    }

    let mensaje = resultado.usuario.esDuoc
      ? '¡Cuenta creada! Tienes 20% de descuento de por vida por tu correo institucional.'
      : '¡Cuenta creada con éxito!'
    if (resultado.referente) mensaje += ` Ganaste ${PUNTOS_BONUS_REFERIDO_NUEVO} puntos Level-Up por usar un código de referido.`
    mostrarToast(mensaje)
    irA('perfil')
  }

  return (
    <Form className="auth-card" noValidate onSubmit={enviar}>
      <Row>
        <Col md={6}><CampoFormulario id="reg-nombre" label="Nombre" value={valores.nombre} onChange={cambiar('nombre')} error={errores.nombre} autoComplete="given-name" /></Col>
        <Col md={6}><CampoFormulario id="reg-apellidos" label="Apellidos" value={valores.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos} autoComplete="family-name" /></Col>
      </Row>

      <CampoFormulario id="reg-run" label="RUN" ayuda="Sin puntos ni guión, ej: 123456785"
        value={valores.run} onChange={cambiar('run')} error={errores.run} />

      <CampoFormulario id="reg-correo" label="Correo" type="email" maxLength={100} autoComplete="email"
        placeholder="tu@duoc.cl / @profesor.duoc.cl / @gmail.com" value={valores.correo} onChange={cambiar('correo')} error={errores.correo} />

      <CampoFormulario id="reg-fecha-nacimiento" label="Fecha de nacimiento" type="date"
        ayuda="Debes ser mayor de 18 años. Con correo @duoc.cl o @profesor.duoc.cl obtienes 20% de descuento de por vida."
        value={valores.fechaNacimiento} onChange={cambiar('fechaNacimiento')} error={errores.fechaNacimiento} />

      <Row>
        <Col md={6}><CampoFormulario id="reg-password" label="Contraseña" type="password" autoComplete="new-password" value={valores.password} onChange={cambiar('password')} error={errores.password} /></Col>
        <Col md={6}><CampoFormulario id="reg-password2" label="Confirmar contraseña" type="password" autoComplete="new-password" value={valores.password2} onChange={cambiar('password2')} error={errores.password2} /></Col>
      </Row>

      <CampoFormulario id="reg-telefono" label="Teléfono (opcional)" type="tel" maxLength={20} placeholder="+56 9 1234 5678"
        value={valores.telefono} onChange={cambiar('telefono')} />

      <SelectorRegionComuna
        region={valores.region} comuna={valores.comuna}
        errorRegion={errores.region} errorComuna={errores.comuna}
        onCambio={(cambios) => setValores({ ...valores, ...cambios })}
      />

      <CampoFormulario id="reg-direccion" label="Dirección" maxLength={300}
        value={valores.direccion} onChange={cambiar('direccion')} error={errores.direccion} />

      <CampoFormulario id="reg-codigo-referido" label="Código de referido (opcional)" maxLength={20} placeholder="Ej: JP4F2K"
        ayuda="Si un amigo te invitó, ingresa su código y ambos ganan puntos Level-Up."
        value={valores.codigoReferido} onChange={cambiar('codigoReferido')} error={errores.codigoReferido} />

      <Button type="submit" variant="accent-blue" className="w-100">Crear cuenta</Button>
      <p className="auth-link mt-3">¿Ya tienes cuenta? <Enlace pagina="login">Inicia sesión</Enlace></p>
    </Form>
  )
}

export default FormularioRegistro
