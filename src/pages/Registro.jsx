import { Container } from 'react-bootstrap'
import FormularioRegistro from '../components/organisms/FormularioRegistro.jsx'

function Registro() {
  return (
    <section className="panel">
      <Container>
        <div className="auth-wrapper">
          <div className="auth-brand">
            <h1 className="auth-brand-nombre">Registro de usuario</h1>
            <p className="text-secondary">Crea tu cuenta y obtén 20% de descuento con tu correo institucional.</p>
          </div>
          <FormularioRegistro />
        </div>
      </Container>
    </section>
  )
}

export default Registro
