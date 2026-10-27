import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import CampoFormulario from '../atoms/CampoFormulario.jsx'
import SelectorRegionComuna from '../molecules/SelectorRegionComuna.jsx'
import { categoriasDe } from '../../utils/productos.js'
import { PRODUCTOS } from '../../data/productos.js'

// Organismo: edición de datos de contacto. El estado inicial sale de las props (el usuario actual).
function FormularioPerfil({ usuario, onGuardar }) {
  const [telefono, setTelefono] = useState(usuario.telefono || '')
  const [direccion, setDireccion] = useState(usuario.direccion || '')
  const [ubicacion, setUbicacion] = useState({ region: usuario.region || '', comuna: usuario.comuna || '' })
  const [preferencias, setPreferencias] = useState(usuario.preferencias || [])

  // Agrega o quita una preferencia SIN mutar el arreglo
  const alternar = (categoria) =>
    setPreferencias((actual) => actual.includes(categoria) ? actual.filter((c) => c !== categoria) : [...actual, categoria])

  function enviar(e) {
    e.preventDefault()
    onGuardar({ telefono: telefono.trim(), direccion: direccion.trim(), ...ubicacion, preferencias })
  }

  return (
    <Form className="auth-card mt-4" noValidate onSubmit={enviar}>
      <h2 className="auth-card-titulo">Información de contacto</h2>
      <CampoFormulario id="perfil-telefono" label="Teléfono" type="tel" maxLength={20} placeholder="+56 9 1234 5678"
        value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <SelectorRegionComuna region={ubicacion.region} comuna={ubicacion.comuna} onCambio={setUbicacion} />
      <CampoFormulario id="perfil-direccion" label="Dirección" maxLength={300}
        value={direccion} onChange={(e) => setDireccion(e.target.value)} />

      <fieldset className="mb-3">
        <legend className="form-label">Preferencias de compra</legend>
        {categoriasDe(PRODUCTOS).map((cat) => (
          <Form.Check key={cat} type="checkbox" id={`pref-${cat}`} label={cat}
            checked={preferencias.includes(cat)} onChange={() => alternar(cat)} />
        ))}
      </fieldset>

      <Button type="submit" variant="accent-blue">Guardar cambios</Button>
    </Form>
  )
}

export default FormularioPerfil
