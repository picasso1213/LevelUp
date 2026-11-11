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

  async function canjearPuntos(id) {
    const canje = await canjear(id)
    mostrarToast(canje ? `¡Canjeaste "${canje.nombre}"!` : 'No se pudo realizar el canje')
  }

  async function guardar(cambios) {
    const resultado = await actualizarPerfil(cambios)
    mostrarToast(resultado.ok ? 'Perfil actualizado' : resultado.error)
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
          onGuardar={guardar}
        />

        <Button type="button" variant="outline-accent" className="mt-3" onClick={() => { cerrarSesion(); irA('inicio') }}>Cerrar sesión</Button>
      </Container>
    </section>
  )
}

export default Perfil
