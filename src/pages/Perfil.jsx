import { Container, Badge, Button } from 'react-bootstrap'
import { useNavegar } from '../hooks/useNavegar.js'
import PanelFidelizacion from '../components/organisms/PanelFidelizacion.jsx'
import FormularioPerfil from '../components/organisms/FormularioPerfil.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Perfil() {
  const { usuarioActual: usuario, actualizarPerfil, canjear, cerrarSesion } = useSesion()
  const { mostrarToast } = useToast()
  const { irA } = useNavegar()

  // Sin sesión no se llega aquí: RutaPrivada redirige a /login. Esto solo protege el primer render.
  if (!usuario) return null

  async function copiar(codigo) {
    try {
      await navigator.clipboard.writeText(codigo)
      mostrarToast('Código copiado al portapapeles')
    } catch {
      mostrarToast('No se pudo copiar el código')
    }
  }

  function canjearPuntos(id) {
    const canje = canjear(id)
    if (canje) mostrarToast(`¡Canjeaste "${canje.nombre}"!`)
  }

  return (
    <section className="panel">
      <Container>
        <h1>Mi perfil</h1>
        <p>
          <strong>{usuario.nombre} {usuario.apellidos}</strong>
          {usuario.esDuoc && <Badge bg="success" className="ms-2">20% descuento Duoc de por vida</Badge>}
        </p>
        <p className="text-secondary">Correo: {usuario.correo}</p>
        <p className="text-secondary">RUN: {usuario.run}</p>

        <PanelFidelizacion usuario={usuario} onCopiar={copiar} onCanjear={canjearPuntos} />

        <FormularioPerfil
          key={usuario.correo}
          usuario={usuario}
          onGuardar={(cambios) => { actualizarPerfil(cambios); mostrarToast('Perfil actualizado') }}
        />

        <Button type="button" variant="outline-accent" className="mt-3" onClick={() => { cerrarSesion(); irA('inicio') }}>Cerrar sesión</Button>
      </Container>
    </section>
  )
}

export default Perfil
